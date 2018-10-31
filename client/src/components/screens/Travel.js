import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'

const PWIDTH = 128

const styles = {
  container: {
  },
  planets: {
    width: '100%',
  },
  planet: {
    position: 'absolute',
    cursor: 'pointer',
    '&:hover > div': {
      opacity: 1.0,
    },
    '& > div': {
      opacity: 0.5,
    },
  },
}

class Travel extends Component {
  state = {};

  travelToPlanet = async planetId => {
    const { contracts, user } = this.props

    this.props.goToTravellingScreen()

    try {
      await contracts.gta.travelToPlanet(planetId, { from: user.address, gas: 200000 })
    } catch (e) {
      this.props.goToTravelScreen()
      return console.error(e)
    }

    this.props.setTravellingTo(planets[planetId].name)
  }

  render() {
    const { classes, user } = this.props

    return (
      <div className={classes.container}>
        <h1>Choose a planet to travel to</h1>
        <div className={classes.planets}>
          {planets.map((planet, i) =>
            <div
              key={i}
              className={classes.planet}
              style={{
                left: ((window.innerWidth / 100) * planet.x) - (PWIDTH / 2),
                bottom: ((window.innerHeight / 100) * planet.y),
              }}
              onClick={() => this.travelToPlanet(i)}
            >
              <img
                src={planet.img}
                width={PWIDTH}
                alt=""
              />
              <div>
                { planet.name }
              </div>
              {i == user.currentPlanet && '(current)'}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToPlanetIntroScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIntro' }),
    goToTravellingScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travelling' }),
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    setTravellingTo: travellingTo => dispatch({ type: 'SET_TRAVELLING_TO', travellingTo }),
  }
}

Travel = connect(mapStateToProps, mapDispatchToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
