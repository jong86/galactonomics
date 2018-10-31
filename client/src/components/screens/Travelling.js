import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'

const styles = {
  container: {

  }
}

class Travelling extends Component {
  state = {};

  componentDidMount = () => {
    // Wait until TravelComplete event is heard, then set currentPlanet again in state
    // so that the correct planet is shown in PlanetIntro
  }

  render() {
    const { classes, travellingTo } = this.props

    return (
      <div className={classes.container}>
        <h1>Travelling to planet {travellingTo}...</h1>
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
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
