import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import spaceship from 'assets/spaceship.jpg'
import planets from 'utils/planets'
import getRevertMsg from 'utils/getRevertMsg'

const styles = {
  container: {
  },
  travellingSpaceship: {
    animation: 'vibrate1 0.3s linear infinite both',
  },
}

class Travelling extends Component {
  state = {
    isTravelling: false,
  };

  componentDidMount = () => {
    this.travelToPlanet()
    // When waiting for signature of travelToPlanet transaction, this screen
    // should say "Waiting for hyperdrive activation...". Then once tx is signed,
    // the animation starts and message says, "Travelling to..."

    // Wait until TravelComplete event is heard, then set currentPlanet again in state
    // so that the correct planet is shown in PlanetIntro

    // When event is heard, change to PlanetIntro screen, AND
    // set data that comes back (currentFuel and currentPlanet)
  }

  travelToPlanet = async () => {
    const { contracts, user } = this.props

    try {
      contracts.gta.travelToPlanet(user.travellingTo, { from: user.address, gas: 200000 })
      .on('transactionHash', () => {
        this.setState({ isTravelling: true })
      })
      .on('receipt', receipt => {
        this.props.setUserInfo({ currentPlanet: user.travellingTo })
        this.props.goToPlanetIntroScreen()
      })
      .on('error', e => {
        this.props.setDialogContent(getRevertMsg(e.message))
        this.props.goToTravelScreen()
      })

    } catch (e) {
      this.props.goToTravelScreen()
      return console.error("Could not travel", e)
    }
  }

  render() {
    const { classes, travellingTo, user } = this.props
    const { isTravelling } = this.state

    return (
      <div className={classes.container}>
        {!isTravelling ?
          <h1>Waiting for hyperdrive activation...</h1>
          :
          <h1>Travelling to planet {planets[user.travellingTo].name}...</h1>
        }
        <img
          src={spaceship}
          className={classes[isTravelling && 'travellingSpaceship']}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    travellingTo: state.user.travellingTo,
    contracts: state.contracts,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    goToPlanetIntroScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIntro' }),
    setDialogContent: content => dispatch({ type: 'SET_DIALOG_CONTENT', content }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
