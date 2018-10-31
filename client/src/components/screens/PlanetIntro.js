import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'
import planets from 'utils/planets'

const styles = {
  container: {

  }
}

class PlanetIntro extends Component {
  state = {};

  render() {
    const { classes, user } = this.props
    const planet = planets[user.currentPlanet]

    return (
      <div className={classes.container}>
        <h1>Welcome to planet {planet.name}</h1>
        <Button
          onClick={this.props.goToPlanetHomeScreen}
          type="good"
        >Continue >></Button>
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
    goToPlanetHomeScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetHome' }),
  }
}

PlanetIntro = connect(mapStateToProps, mapDispatchToProps)(PlanetIntro)
PlanetIntro = injectSheet(styles)(PlanetIntro)
export default PlanetIntro;
