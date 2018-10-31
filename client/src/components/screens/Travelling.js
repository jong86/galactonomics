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
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    goToPlanetHomeScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetHome' }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
