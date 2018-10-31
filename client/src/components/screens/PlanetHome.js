import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'

const styles = {
  container: {

  }
}

class PlanetHome extends Component {
  state = {};

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        Planet home screen
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {

  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToPlanetHomeScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetHome' }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
