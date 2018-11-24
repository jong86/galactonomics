import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
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
        <Laserframe
          isButton
          onClick={() => changeScreen('PlanetHome')}
          type="good"
        >Continue >></Laserframe>
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
