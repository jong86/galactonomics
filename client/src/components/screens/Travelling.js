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
  }

  travelToPlanet = async () => {
    const { contracts, user, changeScreen, setUserInfo, setDialogContent } = this.props

    try {
      contracts.gta.travelToPlanet(user.travellingTo, { from: user.address, gas: 200000 })
      .on('transactionHash', () => {
        this.setState({ isTravelling: true })
      })
      .on('receipt', receipt => {
        setUserInfo({ currentPlanet: user.travellingTo })
        changeScreen('PlanetHome')
      })
      .on('error', e => {
        setDialogContent(getRevertMsg(e.message))
        changeScreen('Travel')
      })

    } catch (e) {
      changeScreen('Travel')
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
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    setDialogContent: content => dispatch({ type: 'SET_DIALOG_CONTENT', content }),
  }
}

Travelling = connect(mapStateToProps, mapDispatchToProps)(Travelling)
Travelling = injectSheet(styles)(Travelling)
export default Travelling;
