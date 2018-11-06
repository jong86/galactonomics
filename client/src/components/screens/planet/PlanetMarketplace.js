import React, { Component, Fragment } from "react"
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
      '& > div': {

      },
    },
  }
}

class PlanetMarketplaces extends Component {
  state = {
    commodityNames: [],
    sellOrders: [],
    selectedCommodityId: null,
  };

  componentDidMount = () => {
    this.getCommoditiesList()
    this.getSellOrders()
  }

  getSellOrders = async () => {
    const { contracts, user } = this.props
    const numSellOrders = await contracts.gea.getNumSellOrders(user.currentPlanet, { from: user.address })

    // Make an incrementing array from 0..n
    const sellOrderIds = Array.apply(null, {length: numSellOrders}).map(Number.call, Number)

    // Collect all sell orders
    const sellOrders = await Promise.all(sellOrderIds.map(sellOrderId => new Promise(async (resolve, reject) => {
      let sellOrder
      try {
        sellOrder = await contracts.gea.getSellOrder(user.currentPlanet, sellOrderId, { from: user.address })
      } catch (e) {
        reject(e)
      }
      resolve(sellOrder)
    })))

    this.setState({ sellOrders })
  }

  getCommoditiesList = async () => {
    const { contracts, user } = this.props
    const commoditiesList = await contracts.gea.getCommoditiesList({ from: user.address })
    this.setState({ commodityNames: Object.values(commoditiesList) })
  }

  render() {
    const { classes, user } = this.props
    const { commodityNames, sellOrders, selectedCommodityId } = this.state
    const planet = planets[user.currentPlanet]

    const sideButtons = [
      { fn: () => console.log("buying..."), label: 'Buy' },
      { fn: () => console.log("selling..."), label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          <div>
            {/* Render commodity names */}
            {commodityNames.map((name, i) => (
              <Rect
                key={i}
                isButton
                size="wide"
                active={selectedCommodityId === i}
                onClick={() => this.setState({ selectedCommodityId: i })}
              >
                {name}
              </Rect>
            ))}
          </div>
          <div>
            {/* Render sell orders for currently viewed commodity */}
            {sellOrders
            .filter(sellOrder => sellOrder.commodityId == selectedCommodityId)
            .map((sellOrder, i) => (
              <div key={i}>
                {sellOrder.seller}
                {sellOrder.price.toString()}
                {sellOrder.quantity.toString()}
              </div>
            ))}
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
