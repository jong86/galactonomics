import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
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
        <LaserFrame
          isButton
          onClick={this.goToNextScreen}
          flavour="good"
        >Continue</LaserFrame>
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
