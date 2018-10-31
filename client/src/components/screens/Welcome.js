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
    const { contracts, user } = this.props

    // Need a loading indicator here so players who own spaceships don't
    // navigate to the buy spaceship screen before response is received

    let spaceshipsOwned

    try {
      spaceshipsOwned = await contracts.gta.balanceOf(user.address, { from: user.address })
    } catch (e) {
      return console.error(e)
    }

    if (spaceshipsOwned.toString() === '0')
      return this.props.setUserInfo({ ownsSpaceship: false })

    this.props.setUserInfo({ ownsSpaceship: true })
    this.getPlayerInfo()
  }

  getPlayerInfo = async () => {
    const { contracts, user } = this.props

    let playerInfo

    try {
      playerInfo = await contracts.gta.getInfo({ from: user.address })
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
