import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'

const styles = {
  container: {

  }
}

class Welcome extends Component {
  state = {};

  render() {
    const { classes, goToSpaceshipDealer } = this.props

    return (
      <div className={classes.container}>
        <h1>Galactonomics</h1>
        <Button
          onClick={() => {
            // If player doesn't own spaceship:
            goToSpaceshipDealer()
            // If player owns spaceship:
            // goToTravel()
          }}
          type="good"
        >Continue</Button>
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
    goToSpaceshipDealer: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'SpaceshipDealer' }),
    goToTravel: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
