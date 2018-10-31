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
    const { address } = this.props.user

    // Need a loading indicator here so players who own spaceships don't
    // navigate to the buy spaceship screen before response is received

    let spaceshipsOwned

    try {
      spaceshipsOwned = await gta.balanceOf(address, { from: address })
    } catch (e) {
      return console.error(e)
    }

    if (spaceshipsOwned.toString() === '0')
      return this.props.setUserInfo({ ownsSpaceship: false })

    this.props.setUserInfo({ ownsSpaceship: true })
    this.getPlayerInfo()
  }

  getPlayerInfo = async () => {
    const { gta } = this.props.contracts
    const { address } = this.props.user

    let playerInfo

    try {
      playerInfo = await gta.getInfo({ from: address })
    } catch (e) {
      return console.error(e)
    }

    this.props.setUserInfo({
      currentFuel: playerInfo.currentFuel.toString(),
      currentPlanet: playerInfo.currentPlanet.toString(),
      maxCargo: playerInfo.maxCargo.toString(),
      maxFuel: playerInfo.maxFuel.toString(),
      spaceshipName: playerInfo.spaceshipName.toString(),
    })
  }

  goToNextScreen = () => {
    if (this.props.user.ownsSpaceship)
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
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToSpaceshipDealerScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'SpaceshipDealer' }),
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
