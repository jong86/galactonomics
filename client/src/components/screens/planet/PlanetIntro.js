import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import planets from 'utils/planets'

const styles = {
  PlanetIntro: {
  }
}

class PlanetIntro extends Component {
  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <div className={classes.PlanetIntro}>
        <h1>Welcome to {planet.id != '255' && 'planet '}{planet.name}</h1>
        <LaserFrame
          isButton
          onClick={() => changeScreen('PlanetHome')}
          type="good"
        >Continue >></LaserFrame>
        <img
          src={planet.img}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

PlanetIntro = connect(mapStateToProps, mapDispatchToProps)(PlanetIntro)
PlanetIntro = injectSheet(styles)(PlanetIntro)
export default PlanetIntro;
