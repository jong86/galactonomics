import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'

const styles = {
  container: {

  }
}

class Welcome extends Component {
  componentDidMount = () => {
    this.checkIfOwnsSpaceship()
  }

  checkIfOwnsSpaceship = async () => {
    const { gta } = this.props.contracts
    const { address } = this.props.player

    let spaceshipsOwned

    try {
      spaceshipsOwned = await gta.balanceOf(address, { from: address })
    } catch (e) {
      return console.error(e)
    }

    if (spaceshipsOwned.toString() === '0') {
      this.props.setPlayerInfo({ ownsSpaceship: false })
      console.log("you dont own a spaceship")
    } else {
      this.props.setPlayerInfo({ ownsSpaceship: true })
      console.log("you own a spaceship")
    }

    // this.props.setPlayerInfo({
    //   currentFuel: response.currentFuel.toString(),
    //   currentPlanet: response.currentPlanet.toString(),
    //   maxCargo: response.maxCargo.toString(),
    //   maxFuel: response.maxFuel.toString(),
    //   spaceshipName: response.spaceshipName.toString(),
    // })
  }

  goToNextScreen = () => {
    const { player } = this.props
    if (player.ownsSpaceship)
      this.props.goToTravelScreen()
    else
      this.props.goToSpaceshipDealerScreen()
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
    setPlayerInfo: info => dispatch({ type: 'SET_PLAYER_INFO', info }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
