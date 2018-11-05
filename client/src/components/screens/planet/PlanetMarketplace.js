import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'

const styles = {
  container: {
    flexDirection: 'row',
    width: '100%',
    '& > div:first-child': {
      flex: '0.2',
      border: '1px solid red',
    },
    '& > div:last-child': {
      flex: '0.8',
      border: '1px solid yellow',
    },
  }
}

class PlanetMarketplaces extends Component {
  state = {
    commodityNames: []
  };

  componentDidMount = () => {
    this.getCommoditiesList()
    this.getSellOrders()
  }

  getSellOrders = async () => {
    const { contracts, user } = this.props

    const numSellOrders = await contracts.gea.getNumSellOrders(user.currentPlanet, { from: user.address })
    console.log('numSellOrders', numSellOrders);

    const sellOrders = []
  }

  getCommoditiesList = async () => {
    const { contracts, user } = this.props
    const commoditiesList = await contracts.gea.getCommoditiesList({ from: user.address })
    this.setState({ commodityNames: Object.values(commoditiesList) })
  }

  render() {
    const { classes, user } = this.props
    const planet = planets[user.currentPlanet]

    return (
      <MPIContainer>
        <div className={classes.container}>
          <div>
            left
          </div>
          <div>
            right
          </div>
        </div>
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

PlanetMarketplaces = connect(mapStateToProps, mapDispatchToProps)(PlanetMarketplaces)
PlanetMarketplaces = injectSheet(styles)(PlanetMarketplaces)
export default PlanetMarketplaces;
