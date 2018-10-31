import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import spaceship from 'assets/spaceship.jpg'

const styles = {
  container: {
    '& > img': {
      animation: 'vibrate1 0.3s linear infinite both',
    },
  },
}

class Travelling extends Component {
  state = {};

  componentDidMount = () => {
    // Wait until TravelComplete event is heard, then set currentPlanet again in state
    // so that the correct planet is shown in PlanetIntro

    // When event is heard, change to PlanetIntro screen, AND
    // set data that comes back (currentFuel and currentPlanet)
    this.listenToEvent()
  }

  listenToEvent = () => {
    const { contracts, user } = this.props

    contracts.gta.TravelComplete({}, (error, response) => {
      if (error) return console.error(error)
      const { player, currentFuel, planetId } = response.args
      if (player === user.address) {
        this.props.setUserInfo({
          currentFuel: currentFuel.toString(),
          currentPlanet: planetId.toString(),
        })
        this.props.goToPlanetIntroScreen()
      }
    })
  }

  render() {
    const { classes, travellingTo } = this.props

    return (
      <div className={classes.container}>
        <h1>Travelling to planet {travellingTo}...</h1>
        <img src={spaceship} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    travellingTo: state.user.travellingTo,
    contracts: state.contracts,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    goToPlanetIntroScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIntro' }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
