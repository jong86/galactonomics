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

  componentDidMount = () => {
    // Get player info and save to store
    this.getPlayerInfo()
  }

  getPlayerInfo = async () => {
    const { gta } = this.props.contracts
    const { address } = this.props.player

    let response

    try {
      response = await gta.getInfo({ from: address })
    } catch (e) {
      return console.error(e)
    }

    console.log('response', response);
  }

  goToNextScreen = () => {


    // if ()
    //   // If player doesn't own spaceship:
    //   goToSpaceshipDealerScreen()
    //   // If player owns spaceship:
    //   goToTravelScreen()
  }

  render() {
    const { classes, goToSpaceshipDealer } = this.props

    return (
      <div className={classes.container}>
        <h1>Galactonomics</h1>
        <Button
          onClick={this.goToNextScreen}
          type="good"
        >Continue</Button>
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
    goToSpaceshipDealerScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'SpaceshipDealer' }),
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
