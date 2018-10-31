import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from '../reusables/Button'

const styles = {
  container: {

  }
}

class SpaceshipDealer extends Component {
  state = {};

  buySpaceship = () => {
    console.log("buying spaceship...")



    // After success of spaceship buying, go to the travel screen
  }

  render() {
    const { classes, goToTravel } = this.props

    return (
      <div className={classes.container}>
        <h1>It's dangerous to go alone.</h1>
        <h1>Would you like to purchase a spaceship?</h1>
        <h3>(spaceship ownership is required by law to handle commodities in this galactic region)</h3>
        <Button onClick={this.buySpaceship}>Okay</Button>
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
    goToTravel: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

SpaceshipDealer = connect(mapStateToProps, mapDispatchToProps)(SpaceshipDealer)
SpaceshipDealer = injectSheet(styles)(SpaceshipDealer)
export default SpaceshipDealer;
