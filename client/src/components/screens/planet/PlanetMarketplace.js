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
    this.getCommodityNames()
    this.getSellOrders()
  }

  getSellOrders = async () => {
    const { contracts, user } = this.props
    const numSellOrders = await contracts.gea.getNumSellOrders(user.currentPlanet, { from: user.address })

    // Make an incrementing array from 0..n, will break if numSellOrders is larger than javascript max num
    const sellOrderIds = Array.apply(null, {length: parseInt(numSellOrders.toString())}).map(Number.call, Number)

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

  getCommodityNames = async () => {
    const { contracts, user } = this.props

    const commodityIds = Array.apply(null, {length: 7}).map(Number.call, Number)

    const commodityNames = await Promise.all(commodityIds.map((commodityId, i) => new Promise(async (resolve, reject) => {
      let commodityName
      try {
        commodityName = await contracts.gea.getCommodityName(i, { from: user.address })
      } catch (e) {
        reject(e)
      }
      resolve(commodityName)
    })))

    this.setState({ commodityNames })
  }

  buy = () => {
    this.props.setDialogContent('buying')
  }

  sell = () => {
    this.props.setDialogContent('selling')
  }

  render() {
    const { classes, user } = this.props
    const { commodityNames, sellOrders, selectedCommodityId } = this.state
    const planet = planets[user.currentPlanet]

    const sideButtons = [
      { fn: this.buy, label: 'Buy' },
      { fn: this.sell, label: 'Sell' },
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
    setDialogContent: content => dispatch({ type: 'SET_DIALOG_CONTENT', content }),
  }
}

PlanetMarketplaces = connect(mapStateToProps, mapDispatchToProps)(PlanetMarketplaces)
PlanetMarketplaces = injectSheet(styles)(PlanetMarketplaces)
export default PlanetMarketplaces;
