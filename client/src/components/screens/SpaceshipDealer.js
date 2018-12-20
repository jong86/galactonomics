import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import spaceship from 'assets/images/spaceship.jpg'
import Loader from 'components/reusables/Loader'
import getErrorMsg from 'utils/getErrorMsg'

const styles = {
  container: {}
}

class SpaceshipDealer extends Component {
  state = {
    isLoading: false,
    loadingText: '',
  };

  buySpaceship = async () => {
    this.setState({ isLoading: true, loadingText: 'Waiting for your approval of ownership transfer' })

    const { web3, contracts, user, changeScreen, setDialogBox } = this.props

    contracts.transitAuthority.buySpaceship(
      "My Spaceship",
      { from: user.address, value: web3.utils.toWei("0.01", "ether") }
    )
      .on('transactionHash', () => {
        this.setState({ isLoading: true, loadingText: 'Waiting processing by the Galactic Transit Authority' })
      })
      .on('receipt', receipt => {
        changeScreen('Travel')
      })
      .on('error', e => {
        this.setState({ isLoading: false })
        setDialogBox(getErrorMsg(e.message), "bad")
      })
  }

  render() {
    const { classes } = this.props
    const { isLoading, loadingText } = this.state

    return (
      <div className={classes.container}>
        <h2>It's dangerous to go alone.</h2>
        <h1>Would you like to purchase a spaceship?</h1>
        <h3>WARNING: Spaceship ownership is required by law to handle commodities in this galactic region</h3>
        <img src={spaceship} />
        <Laserframe
          isButton={!isLoading}
          onClick={this.buySpaceship}
          flavour="good"
        >{isLoading ? <div>{loadingText} <Loader flavour="good" /></div> : 'Okay'}</Laserframe>
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
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

SpaceshipDealer = connect(mapStateToProps, mapDispatchToProps)(SpaceshipDealer)
SpaceshipDealer = injectSheet(styles)(SpaceshipDealer)
export default SpaceshipDealer;
