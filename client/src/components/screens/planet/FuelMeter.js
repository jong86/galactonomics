import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import LaserFrame from 'components/reusables/LaserFrame'
import { FaGasPump } from 'react-icons/fa';
import getRevertMsg from 'utils/getRevertMsg'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import Sound from 'react-sound';
import receivedSomething from 'assets/sounds/receivedSomething.wav'

const styles = {
}

class FuelMeter extends Component {
  state = {
    isLoading: false,
    isRefueling: false,
    refuelCost: {},
    doneFueling: false,
  }

  componentDidMount = () => {
    this.checkRefuelCost()
  }

  checkRefuelCost = async () => {
    this.setState({ isLoading: true })

    const { contracts, user } = this.props

    let refuelCost
    try {
      refuelCost = await contracts.gta.refuelCost({ from: user.address })
    } catch (e) {
      return console.error(e)
    }

    this.setState({ refuelCost: refuelCost, isLoading: false })
  }

  refuel = async () => {
    const { contracts, user } = this.props

    contracts.gta.refuel({ from: user.address, value: this.state.refuelCost })
    .on('transactionHash', () => {
      this.setState({ isRefueling: true })
    })
    .on('receipt', async () => {
      await getPlayerInfo()
      this.setState({
        isRefueling: false,
        doneFueling: true,
      })
    })
    .on('error', e => {
      this.props.setDialogBox(getRevertMsg(e.message), 'bad')
    })
  }

  render() {
    const { classes, currentFuel, maxFuel, web3 } = this.props
    const { isRefueling, doneFueling } = this.state

    let refuelCost
    try {
      refuelCost = web3.utils.fromWei(this.state.refuelCost.toString())
    } catch (e) {
      refuelCost = <Loader />
    }

    const isFull = currentFuel === maxFuel

    return (
      <Fragment>
        <LaserFrame
          size="wide"
        >Fuel</LaserFrame>
        <FaGasPump />
        <div>{currentFuel}/{maxFuel} megalitres</div>
        {!isFull && <div>Cost to refuel: Ξ{refuelCost}</div>}
        <LaserFrame
          flavour={isRefueling ? 'status' : 'good'}
          isButton={!isFull}
          size="wide"
          onClick={() => { if (!isFull) this.refuel()}}
        >{isRefueling ? <div>Refueling... <Loader flavour="status" /></div> : (isFull ? 'Tank is full' : 'Fill up tank')}</LaserFrame>
        <Sound
          url={receivedSomething}
          playStatus={doneFueling && Sound.status.PLAYING}
          volume={25}
          onFinishedPlaying={() => this.setState({ doneFueling: false })}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

FuelMeter = connect(mapStateToProps, mapDispatchToProps)(FuelMeter)
FuelMeter = injectSheet(styles)(FuelMeter)
export default FuelMeter;
