import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import spaceship from 'assets/spaceship.jpg'

const styles = {
  container: {

  }
}

class SpaceshipDealer extends Component {
  state = {
    isLoading: false,
  };

  buySpaceship = async () => {
    this.setState({ isLoading: true })

    const { web3, contracts, user } = this.props

    try {
      await contracts.gta.buySpaceship(
        "My Spaceship",
        { from: user.address, value: web3.utils.toWei("0.01", "ether") }
      )
    } catch (e) {
      return console.error(e)
    }

    // After 'SpaceshipBought' event is heard...
    this.props.goToTravelScreen()
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h2>It's dangerous to go alone.</h2>
        <h1>Would you like to purchase a spaceship?</h1>
        <h3>WARNING: Spaceship ownership is required by law to handle commodities in this galactic region</h3>
        <img src={spaceship} />
        <Rect
          onClick={this.buySpaceship}
          type="good"
        >{this.state.isLoading ? 'Loading...' : 'Okay'}</Rect>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

SpaceshipDealer = connect(mapStateToProps, mapDispatchToProps)(SpaceshipDealer)
SpaceshipDealer = injectSheet(styles)(SpaceshipDealer)
export default SpaceshipDealer;
