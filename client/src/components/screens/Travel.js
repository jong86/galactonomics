import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import getPlayerInfo from 'utils/getPlayerInfo'
import Planet from 'components/reusables/Planet'
import Laserframe from 'components/reusables/Laserframe'
import Loader from 'components/reusables/Loader'

const PWIDTH = 128

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
    getPlayerInfo()
    this.getPlanetURIs()
  }

  componentDidUpdate = prevProps => {
    const { sector: prevSector } = prevProps.travel
    const { sector } = this.props.travel

    if (prevSector !== sector) {
      this.props.three.renderer.clear()
      this.getPlanetURIs()
    }
  }

  startTravelling = async planetId => {
    const { user, changeScreen, setTravellingTo, travel } = this.props
    // Go right to planet home if user is already on chosen planet
    if (planetId == user.currentPlanet.id) {
      return changeScreen('PlanetHome')
    }

    // Grab URI of chosen planet from array
    const planetURI = travel.planets.find(planet => planet.id === planetId).uri

    // Save id and URI of chosen planet
    setTravellingTo(planetId, planetURI)
    // Go to travelling / 'loading' screen
    changeScreen('Travelling')
  }

  getPlanetURIs = async () => {
    this.setState({ isLoadingPlanets: true })
    const { sector } = this.props.travel
    const { user, contracts } = this.props

    const planets = []
    for (let i = sector; i < sector + 17; i++) {
      try {
        const planetURI = await contracts.gta.planetURI(String(i), { from: user.address } )
        planets.push({ id: i, uri: planetURI })
      } catch (e) {
        console.error(e)
      }
    }

    this.setState({ isLoadingPlanets: false })

    this.props.setTravelState({ planets })
  }

  render() {
    const { classes, user } = this.props
    const { planets, sector } = this.props.travel
    const { isLoadingPlanets } = this.state

    return (
      <div className={classes.Travel}>
        <h1>Choose a planet to travel to</h1>
        Current sector: {sector}
        <div className={classes.nav}>
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
            {planets && planets.map((planet, i) => {
              const x = (i * 100) + 24
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
                  onClick={() => this.startTravelling(planet.id)}
                >
                  <Planet
                    uri={planet.uri}
                    x={x}
                    y={y}
                  />
                  <div>
                    {planet.id}
                  </div>
                  {planet.id == user.currentPlanet.id && '(current)'}
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
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setTravellingTo: (id, uri) => dispatch({ type: 'SET_TRAVELLING_TO', id, uri }),
    setTravelState: travelState => dispatch({ type: 'SET_TRAVEL_STATE', travelState }),
    changeSector: newSector => dispatch({ type: 'CHANGE_SECTOR', newSector }),
  }
}

Travel = connect(mapStateToProps, mapDispatchToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
