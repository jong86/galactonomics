import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import getPlayerInfo from 'utils/getPlayerInfo'
import Planet from 'components/reusables/Planet'

const PWIDTH = 128

const styles = {
  Travel: {
    justifyContent: 'flex-start',
    '& h1': {
      zIndex: 1,
    }
  },
  planets: {
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
}

class Travel extends Component {
  componentDidMount = () => {
    getPlayerInfo()
    this.getPlanetURIs()
  }

  startTravelling = async planetId => {
    const { user, changeScreen, setTravellingTo } = this.props

    // Go right to planet home if user is already on chosen planet
    if (planetId == user.currentPlanet) {
      return changeScreen('PlanetHome')
    }

    // Collect id of chosen planet
    setTravellingTo(planetId)
    // Go to travelling / 'loading' screen
    changeScreen('Travelling')
  }

  getPlanetURIs = async () => {
    const { sector } = this.props.travel
    const { user, contracts } = this.props

    const planets = []
    for (let i = sector; i <= sector + 17; i++) {
      console.log(i)
      try {
        const planetURI = await contracts.gta.planetURI(String(i), { from: user.address } )
        planets.push({ id: i, uri: planetURI })
      } catch (e) {
        console.error(e)
      }
    }

    this.props.setTravelState({ planets })
  }

  render() {
    const { classes, user } = this.props
    const { planets } = this.props.travel
    const { renderer } = this.props.three

    return (
      <div className={classes.Travel}>
        <h1>Choose a planet to travel to</h1>
        <div className={classes.planets}>
          {planets && planets.map((planet, i) =>
            <div
              key={i}
              className={classes.planet}
              style={{
                left: ((window.innerWidth / 100) - (PWIDTH / 2)),
                bottom: ((window.innerHeight / 100) * (10*i)),
              }}
              onClick={() => this.startTravelling(planet.id)}
            >
              <Planet uri={String(planet.uri)} renderer={renderer} />
              <div> { String(planet.uri) }</div>
              <div>
                { planet.id }
              </div>
              {planet.id == user.currentPlanet && '(current)'}
            </div>
          )}
        </div>
      </div>
    );
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
    setTravellingTo: travellingTo => dispatch({ type: 'SET_TRAVELLING_TO', travellingTo }),
    setTravelState: travelState => dispatch({ type: 'SET_TRAVEL_STATE', travelState }),
  }
}

Travel = connect(mapStateToProps, mapDispatchToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
