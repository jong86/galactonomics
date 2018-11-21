import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import commodities from 'utils/commodities'
import MPIContainer from 'components/screens/planet/MPIContainer'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

class PlanetIndustrial extends Component {
  componentDidMount = () => {
    this.getCommodity()
  }

  getCommodity = async () => {
    const { user, contracts, setIndustrialState } = this.props
    let commodity

    try {
      commodity = await contracts.commodities.get(user.currentPlanet, { from: user.address })
    } catch (e) {
      return console.error(e)
    }

    setIndustrialState({
      miningAmount: commodity.miningAmount.toString(),
      miningTarget: commodity.miningTarget.toString(),
      commodityName: commodities[user.currentPlanet].name,
      commoditySymbol: commodities[user.currentPlanet].symbol,
    })
  }

  render() {
    const { classes, user, web3, industrial } = this.props
    const {
      miningAmount,
      miningTarget,
      commodityName,
      commoditySymbol,
    } = industrial
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <MPIContainer>
          <Rect
            size="wide"
          >
            test
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
    industrial: state.industrial,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
