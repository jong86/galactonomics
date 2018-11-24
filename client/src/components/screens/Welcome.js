import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import Loader from 'components/reusables/Loader'

const styles = {
  container: {}
}

class Welcome extends Component {
  goToNextScreen = () => {
    const { user, changeScreen} = this.props

    if (user.ownsSpaceship)
      changeScreen('Travel')
    else
      changeScreen('SpaceshipDealer')
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h1>Galactonomics</h1>
        <Laserframe
          isButton
          onClick={this.goToNextScreen}
          type="good"
        >Continue</Laserframe>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contracts: state.contracts,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
