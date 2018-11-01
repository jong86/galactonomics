import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import colorFromType from 'utils/colorFromType'
import Rect from 'components/reusables/Rect'

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
    this.setState({ isRefueling: true })

    const { contracts, user } = this.props

    try {
      contracts.gta.refuel({ from: user.address, value: this.state.refuelCost })
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

    return (
      <Fragment>
        <Rect
          shape="wide"
        >Fuel</Rect>
        <div>{currentFuel}/{maxFuel}</div>
        <div>Cost to refuel: Ξ{refuelCost}</div>
        <Rect
          type="good"
          isButton
          shape="wide"
          onClick={this.refuel}
        >Fill-up tank</Rect>
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
