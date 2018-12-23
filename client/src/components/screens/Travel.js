import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import refreshCommoditiesOwned from 'utils/refreshCommoditiesOwned'
import Planet from 'components/reusables/Planet'
import Laserframe from 'components/reusables/Laserframe'
import Loader from 'components/reusables/Loader'

const styles = {
  Travel: {
    justifyContent: 'flex-start',
    '& h1': {
      zIndex: 1,
    }
  },
  planets: {
    position: 'absolute',
    width: '100%',
  },
  planet: {
    position: 'absolute',
    cursor: 'pointer',
    fontSize: 8,
    '&:hover > div:nth-child(2), &:hover > div:nth-child(3)': {
      opacity: 1.0,
    },
    '& > div:nth-child(2), & > div:nth-child(3)': {
      opacity: 0.5,
    },
  },
  nav: {
    flexDirection: 'row',
  },
}

class Travel extends Component {
  state = {}

  componentDidMount = () => {
    refreshCommoditiesOwned()
    this.getPlanetURIs()
  }

  componentDidUpdate = prevProps => {
    const { sector: prevSector } = prevProps.travel
    const { sector } = this.props.travel

    if (prevSector !== sector) {
      this.props.three.bg.renderer.clear()
      this.getPlanetURIs()
    }
  }

  travelToPlanet = async planetId => {
    const { changeScreen, changeCurrentPlanet, travel } = this.props
    const { uri } = travel.visiblePlanets.find(planet => planet.id === planetId)
    changeCurrentPlanet(planetId, uri)
    changeScreen('PlanetHome')
  }

  getPlanetURIs = async () => {
    this.setState({ isLoadingPlanets: true })
    const { sector } = this.props.travel
    const { user, contracts, setVisiblePlanets } = this.props

    const planets = []
    for (let i = sector; i < sector + 17; i++) {
      try {
        const planetURI = await contracts.commodityReg.getURI(String(i), { from: user.address } )
        planets.push({ id: i, uri: planetURI })
      } catch (e) {
        console.error(e)
      }
    }

    setVisiblePlanets({ visiblePlanets: planets })
    this.setState({ isLoadingPlanets: false })
  }

  render() {
    const { classes, user } = this.props
    const { visiblePlanets, sector } = this.props.travel
    const { isLoadingPlanets } = this.state

    return (
      <div className={classes.Travel}>
        <h1>Choose a planet to travel to</h1>
        Current sector: {sector}
        <div className={classes.nav}>
          <Laserframe
            isButton
            onClick={() => this.props.changeScreen('PlanetHome')}
          >
            Cancel travelling
          </Laserframe>
          <Laserframe
            isButton
            onClick={() => this.props.changeSector(sector - 17)}
          >
            {'<< Prev sector'}
          </Laserframe>
          <Laserframe
            isButton
            onClick={() => this.props.changeSector(sector + 17)}
          >
            {'Next sector >>'}
          </Laserframe>
        </div>
        {isLoadingPlanets ?
          <Loader />
          :
          <div className={classes.planets}>
            {visiblePlanets && visiblePlanets.map((planet, i) => {
              const x = (i * 100) + 24;
              const y = 200

              return (
                <div
                  key={planet.id}
                  className={classes.planet}
                  style={{
                    left: x,
                    top: y,
                    zIndex: 2,
                  }}
                  onClick={() => this.travelToPlanet(planet.id)}
                >
                  <Planet
                    uri={planet.uri}
                    x={x}
                    y={y}
                    radius={16}
                  />
                  <div>
                    {planet.id}
                  </div>
                  <div>
                    {planet.id == user.currentPlanet.id ? "(current)" : ""}
                  </div>
                </div>
              )
            })}
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
    travel: state.travel,
    three: state.three,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeCurrentPlanet: (id, uri) => dispatch({ type: 'CHANGE_CURRENT_PLANET', id, uri }),
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setVisiblePlanets: visiblePlanets => dispatch({ type: 'SET_VISIBLE_PLANETS', visiblePlanets }),
    changeSector: newSector => dispatch({ type: 'CHANGE_SECTOR', newSector }),
  }
}

Travel = connect(mapStateToProps, mapDispatchToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel
