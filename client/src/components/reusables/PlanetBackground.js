import React from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'

const styles = {
  PlanetBackground: {
    position: 'absolute',
    display: 'block',
    'min-height': '100%',
    'min-width': '100%',
    zIndex: -1,
    filter: 'blur(8px)',
    transform: 'scale(1.2)',
    objectPosition: '0 1000px',
  }
}

let PlanetBackground = ({ classes, currentPlanet }) => (
  <img className={classes.PlanetBackground} src={planets[currentPlanet].img} />
)

const mapStateToProps = state => {
  return {
    currentPlanet: state.user.currentPlanet,
  }
}

PlanetBackground = connect(mapStateToProps)(PlanetBackground)
PlanetBackground = injectSheet(styles)(PlanetBackground)
export default PlanetBackground
