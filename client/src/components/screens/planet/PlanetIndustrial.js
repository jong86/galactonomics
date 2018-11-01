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
  state = {
    amountMinedPerBlock: '',
    miningDuration: '',
    miningCost: '',
  };

  componentDidMount = () => {
    this.getCommodity()
  }

  getCommodity = async () => {
    const { user, contracts } = this.props

    let response
    try {
      response = await contracts.gia.getCommodity(user.currentPlanet, { from: user.address })
    } catch (e) {
      console.error(e)
    }

    this.setState({
      amountMinedPerBlock: response.amountMinedPerBlock.toString(),
      miningDuration: response.miningDuration.toString(),
      miningCost: response.miningCost.toString(),
    })
  }

  render() {
    const { classes, user } = this.props
    const {
      amountMinedPerBlock,
      miningDuration,
      miningCost,
    } = this.state
    const planet = planets[user.currentPlanet]

    return (
      <MPIContainer>
        <Rect
          size="wide"
        >
          <div>One of the leading industrial contractors on planet {planet.name} has offered you a deal:</div>
          <div>Upfront cost: Ξ{miningCost}</div>
          <div>Returns: {amountMinedPerBlock} per block</div>
          <div>Duration: {miningDuration} blocks</div>
          <div>Do you accept their offer?</div>
          <div className={classes.acceptDecline}>
            <Rect
              isButton
              type="bad"
            >Decline</Rect>
            <Rect
              isButton
              type="good"
            >Accept</Rect>
          </div>
        </Rect>
      </MPIContainer>
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
  }
}

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
