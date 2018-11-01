import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'

const styles = {
  container: {

  }
}

class PlanetIntro extends Component {
  state = {};

  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets[user.currentPlanet]

    return (
      <div className={classes.container}>
        <h1>Welcome to planet {planet.name}</h1>
        <Rect
          onClick={() => changeScreen('PlanetHome')}
          type="good"
        >Continue >></Rect>
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
