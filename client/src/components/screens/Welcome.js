import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'

const styles = {
  container: {

  }
}

class Welcome extends Component {
  goToNextScreen = () => {
    const { user } = this.props

    if (user.ownsSpaceship)
      this.props.goToTravelScreen()
    else
      this.props.goToSpaceshipDealerScreen()
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h1>Galactonomics</h1>
        <Rect
          isButton
          onClick={this.goToNextScreen}
          type="good"
        >Continue</Rect>
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
    goToSpaceshipDealerScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'SpaceshipDealer' }),
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
