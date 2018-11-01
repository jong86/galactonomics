import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import colorFromType from 'utils/colorFromType'
import Rect from 'components/reusables/Rect'
import { FaGasPump } from 'react-icons/fa';
import getRevertMsg from 'utils/getRevertMsg'
import getPlayerInfo from 'utils/getPlayerInfo'

const styles = {
}

class FuelMeter extends Component {
  state = {
    isLoading: false,
    isRefueling: false,
    refuelCost: {},
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

    try {
      contracts.gta.refuel({ from: user.address, value: this.state.refuelCost })
      .on('transactionHash', () => {
        this.setState({ isRefueling: true })
      })
      .on('receipt', receipt => {
        getPlayerInfo()
      })
      .on('error', e => {
        this.props.setDialogContent(getRevertMsg(e.message))
      })

    } catch (e) {
      return console.error(e)
    }

    this.setState({ isRefueling: false })
  }
  
  render() {
    const { classes, currentFuel, maxFuel, web3 } = this.props

    let refuelCost
    try {
      refuelCost = web3.utils.fromWei(this.state.refuelCost.toString())
    } catch (e) {
      refuelCost = '(loading...)'
    }

    const isFull = currentFuel === maxFuel

    return (
      <Fragment>
        <Rect
          shape="wide"
        >Fuel</Rect>
        <FaGasPump />
        <div>{currentFuel}/{maxFuel} megalitres</div>
        {!isFull && <div>Cost to refuel: Ξ{refuelCost}</div>}
        <Rect
          type={isFull ? '' : 'good' }
          isButton={!isFull}
          shape="wide"
          onClick={() => { if (!isFull) this.refuel()}}
        >{isFull ? 'Tank is full' : 'Fill-up tank'}</Rect>
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

FuelMeter = connect(mapStateToProps)(FuelMeter)
FuelMeter = injectSheet(styles)(FuelMeter)
export default FuelMeter;
