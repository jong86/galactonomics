import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'
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

    const { web3 } = this.props
    const { gta } = this.props.contracts
    const { address } = this.props.player

    try {
      await gta.buySpaceship("My Spaceship", { from: address, value: web3.utils.toWei("0.01", "ether") })
    } catch (e) {
      return console.error(e)
    }

    this.props.goToTravelScreen()
    // After success of spaceship buying, go to the travel screen
  }

  render() {
    const { classes, goToTravel } = this.props

    return (
      <div className={classes.container}>
        <h2>It's dangerous to go alone.</h2>
        <h1>Would you like to purchase a spaceship?</h1>
        <h3>WARNING: Spaceship ownership is required by law to handle commodities in this galactic region</h3>
        <img src={spaceship} />
        <Button
          onClick={this.buySpaceship}
          type="good"
        >{this.state.isLoading ? 'Loading...' : 'Okay'}</Button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contracts: state.contracts,
    player: state.player,
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
