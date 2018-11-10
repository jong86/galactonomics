import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'

const styles = {
  PlanetBackground: {
    position: 'absolute',
    zIndex: -1,
    filter: 'blur(8px)',
    width: '300%',
    top: '40%',
  }
}

let PlanetBackground = ({ classes, currentPlanet, currentScreen }) => (
  <img className={classes.PlanetBackground} src={planets[currentPlanet].img} />
)

const mapStateToProps = state => {
  return {
    currentPlanet: state.user.currentPlanet,
    currentScreen: state.view.currentScreen,
  }
}

PlanetBackground = connect(mapStateToProps)(PlanetBackground)
PlanetBackground = injectSheet(styles)(PlanetBackground)
export default PlanetBackground;
