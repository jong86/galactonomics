import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import spaceship from 'assets/images/spaceship.jpg'
import getErrorMsg from 'utils/getErrorMsg'
import Sound from 'react-sound';
import travellingSound from 'assets/sounds/travelling.wav'
import Laserframe from 'components/reusables/Laserframe.js'

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
    currentSpeed: 5.39,
  };

  componentDidMount = () => {
    this.travelToPlanet()
  }

  componentDidUpdate = (_, prevState) => {
    if (!prevState.isTravelling && this.state.isTravelling) {
      // start animation
      window.requestAnimationFrame(this.changeSpeed)
    }
  }

  changeSpeed = () => {
    let signCoef = 1
    if (Math.random() <= 0.5) {
      signCoef = -1
    }

    const modulator = Math.random() * 0.1 * signCoef
    const { currentSpeed } = this.state
    const newSpeed = parseFloat(parseFloat(currentSpeed) + modulator).toFixed(7)

    this.setState({ currentSpeed: newSpeed })
    window.requestAnimationFrame(this.changeSpeed)
  }

  travelToPlanet = () => {
    const {contracts, user, changeScreen, finishTravel, setDialogBox } = this.props

    contracts.gta.travelToPlanet(user.travellingTo.id, { from: user.address })
      .on('transactionHash', () => {
        this.setState({ isTravelling: true })
      })
      .on('receipt', receipt => {
        finishTravel()
        changeScreen('PlanetIntro')
      })
      .on('error', e => {
        setDialogBox(getErrorMsg(e.message), "bad")
        changeScreen('Travel')
      })
  }

  render() {
    const { classes, user } = this.props
    const { isTravelling, currentSpeed } = this.state

    return (
      <div className={classes.container}>
        {!isTravelling ?
          <h1>Waiting for hyperdrive activation...</h1>
          :
          <h1>Travelling to planet {user.travellingTo.id}...</h1>
        }
        <img
          src={spaceship}
          className={classes[isTravelling && 'travellingSpaceship']}
        />
        <Laserframe flavour="info">
          Current speed: {isTravelling ? currentSpeed + ' * 10^11 kph' : 'N/A'}
        </Laserframe>
        <Sound
          url={travellingSound}
          playStatus={isTravelling && Sound.status.PLAYING}
          volume={7}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    finishTravel: () => dispatch({ type: 'FINISH_TRAVEL' }),
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
