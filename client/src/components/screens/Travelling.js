import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import spaceship from 'assets/images/spaceship.jpg'
import planets from 'utils/planets'
import getRevertMsg from 'utils/getRevertMsg'
import Sound from 'react-sound';
import travellingSound from 'assets/sounds/travelling.wav'

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
  }

  travelToPlanet = () => {
    const { contracts, user, changeScreen, setUserInfo, setDialogBox } = this.props

    contracts.gta.travelToPlanet(user.travellingTo, { from: user.address })
    .on('transactionHash', () => {
      this.setState({ isTravelling: true })
    })
    .on('receipt', receipt => {
      setUserInfo({ currentPlanet: user.travellingTo })
      changeScreen('PlanetIntro')
    })
    .on('error', e => {
      setDialogBox(getRevertMsg(e.message), "bad")
      changeScreen('Travel')
    })
  }

  render() {
    const { classes, travellingTo, user } = this.props
    const { isTravelling } = this.state
    const planet = planets.find(planet => planet.id == user.travellingTo)

    return (
      <div className={classes.container}>
        {!isTravelling ?
          <h1>Waiting for hyperdrive activation...</h1>
          :
          <h1>Travelling to {planet.id != '255' && 'planet '}{planet.name}...</h1>
        }
        <img
          src={spaceship}
          className={classes[isTravelling && 'travellingSpaceship']}
        />
        <Sound
          url={travellingSound}
          playStatus={isTravelling && Sound.status.PLAYING}
          volume={15}
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
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
