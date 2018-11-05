import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

class PlanetIndustrial extends Component {
  componentDidMount = () => {
    this.getCommodity()
    this.getInvestment()
  }

  getCommodity = async () => {
    const { user, contracts, setIndustrialState } = this.props

    let response
    try {
      response = await contracts.gia.getCommodity(user.currentPlanet, { from: user.address })
    } catch (e) {
      console.error(e)
    }

    setIndustrialState({
      amountMinedPerBlock: response.amountMinedPerBlock.toString(),
      miningDuration: response.miningDuration.toString(),
      miningCost: response.miningCost.toString(),
      commodityName: response.name,
    })
  }

  getInvestment = async () => {
    const { user, contracts, setIndustrialState } = this.props

    let response
    try {
      response = await contracts.gia.getInvestment(user.address, { from: user.address })
    } catch (e) {
      console.error(e)
    }

    setIndustrialState({
      miningCommodityId: response.commodityId.toString(),
      miningBlocksLeft: response.blocksLeft.toString(),
    })
  }

  acceptOffer = () => {
    const { user, contracts, setDialogContent, industrial } = this.props
    const { miningCost } = industrial

    contracts.gia.investInProduction(
      user.currentPlanet,
      { from: user.address, value: miningCost },
    )
    .on('transactionHash', txHash => {
      console.log('txHash', txHash);
      console.log("You accepted the offer")
    })
    .on('receipt', receipt => {
      console.log('receipt', receipt);
      console.log("Production has begun...")
      this.getInvestment()
    })
    .on('error', e => {
      console.log('e', e);
      setDialogContent("Error with investment")
    })
  }

  render() {
    const { classes, user, web3, industrial } = this.props
    const {
      amountMinedPerBlock,
      miningDuration,
      miningCost,
      commodityName,
      miningCommodityId,
      miningBlocksLeft,
    } = industrial
    const planet = planets[user.currentPlanet]
    const miningPlanetName = planets[miningCommodityId || 0].name

    return (
      <MPIContainer>
        {miningBlocksLeft === '0' ?
          <Rect
            size="wide"
          >
            <div>One of the leading industrial contractors on planet {planet.name + " "}
            has offered you a deal on the production of {commodityName}.</div>
            <div>Contract details:</div>
            <div>Upfront cost: Ξ{web3.utils.fromWei(miningCost || '0')}</div>
            <div>Returns: {amountMinedPerBlock} units of {commodityName} per block</div>
            <div>Duration: {miningDuration} blocks</div>
            <div>Would you like to accept their offer?</div>
            <div className={classes.acceptDecline}>
              <Rect
                isButton
                type="bad"
              >Decline</Rect>
              <Rect
                isButton
                type="good"
                onClick={this.acceptOffer}
              >Accept</Rect>
            </div>
          </Rect>
          :
          <div>You are already mining {commodityName} on planet {miningPlanetName}. There are {miningBlocksLeft} blocks left.</div>
        }
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
    industrial: state.industrial,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogContent: content => dispatch({ type: 'SET_DIALOG_CONTENT', content }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
