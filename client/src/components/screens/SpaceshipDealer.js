import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'
import getWeb3 from 'utils/getWeb3'

const styles = {
  container: {

  }
}

class SpaceshipDealer extends Component {
  state = {};

  buySpaceship = async () => {
    const { web3 } = this.props
    const { gta } = this.props.contracts
    const { address } = this.props.player
    console.log('gta', gta);

    console.log('address', address);

    try {
      await gta.buySpaceship("My Spaceship", { from: address, value: web3.utils.toWei("0.01", "ether") })
    } catch (e) {
      return console.error(e)
    }

    // After success of spaceship buying, go to the travel screen
  }

  render() {
    const { classes, goToTravel } = this.props

    return (
      <div className={classes.container}>
        <h2>It's dangerous to go alone.</h2>
        <h1>Would you like to purchase a spaceship?</h1>
        <h3>(spaceship ownership is required by law to handle commodities in this galactic region)</h3>
        <Button
          onClick={this.buySpaceship}
          type="good"
        >Okay</Button>
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
    goToTravel: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

SpaceshipDealer = connect(mapStateToProps, mapDispatchToProps)(SpaceshipDealer)
SpaceshipDealer = injectSheet(styles)(SpaceshipDealer)
export default SpaceshipDealer;
