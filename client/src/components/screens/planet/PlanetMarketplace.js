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
    alignItems: 'flex-start',
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
    commodities: [],
    sellOrders: [],
    selectedCommodityId: null,

    sellAmount: 0,
    sellPrice: 0,
  };

  componentDidMount = () => {
    this.getCommodities()
    this.getSellOrders()
  }

  getSellOrders = async () => {
    const { contracts, user } = this.props
    const numSellOrders = await contracts.gea.getNumSellOrders(user.currentPlanet, { from: user.address })

    // Make an incrementing array from 0..n
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

  getCommodities = async () => {
    const commodityNames = await this.getCommodityNames()
    const commodityBalances = await this.getCommodityBalances()
    this.setState({
      commodities: commodityNames.map((commodityName, i) => ({ name: commodityName, myBalance: commodityBalances[i].toString() }))
    })
  }

  getCommodityNames = async () => {
    const { contracts, user } = this.props

    const commodityIds = Array.apply(null, {length: 7}).map(Number.call, Number)

    return new Promise(async (resolve, reject) => {
      try {
        const commodityNames = await Promise.all(commodityIds.map((commodityId, i) => new Promise(async (resolve, reject) => {
          let commodityName
          try {
            commodityName = await contracts.gea.getCommodityName(i, { from: user.address })
          } catch (e) {
            reject(e)
          }
          resolve(commodityName)
        })))
        resolve(commodityNames)
      } catch (e) {
        reject(e)
      }
    })
  }

  getCommodityBalances = async () => {
    const { contracts, user } = this.props

    const commodityIds = Array.apply(null, {length: 7}).map(Number.call, Number)

    return new Promise(async (resolve, reject) => {
      try {
        const commodityBalances = await Promise.all(commodityIds.map((commodityId, i) => new Promise(async (resolve, reject) => {
          let commodityBalance
          try {
            commodityBalance = await contracts.gea.getCommodityBalance(i, { from: user.address })
          } catch (e) {
            reject(e)
          }
          resolve(commodityBalance)
        })))
        resolve(commodityBalances)
      } catch (e) {
        reject(e)
      }
    })
  }

  createSellOrder = async () => {
    const { contracts, user } = this.props
    const { selectedCommodityId, sellAmount, sellPrice } = this.state
    let response

    try {
      response = await contracts.gea.createSellOrder(
        user.currentPlanet,
        selectedCommodityId,
        sellAmount,
        sellPrice,
        { from: user.address },
      )
    } catch (e) {
      console.error(e)
      this.props.setDialogContent("Error creating sell order")
    }
  }

  buy = () => {
    // const { selectedOrderId, commodities } = this.state
    // const commodityName = commodities[selectedCommodityId].name
    // this.props.setDialogContent(
    //   <Fragment>
    //     <div>
    //       Buying {commodityName}
    //     </div>
    //     <input placeholder="amount"></input>
    //     <input placeholder="price"></input>
    //   </Fragment>
    // )
  }

  sell = () => {
    const { selectedCommodityId, commodities, sellAmount, sellPrice } = this.state
    const commodityName = commodities[selectedCommodityId].name
    this.props.setDialogContent(
      <Fragment>
        <div>
          Selling {commodityName}
        </div>
        <input placeholder="amount" value={sellAmount} type="number"></input>
        <input placeholder="price" value={sellPrice} type="number"></input>
      </Fragment>
    )
  }

  render() {
    const { classes, user } = this.props
    const { commodities, sellOrders, selectedCommodityId } = this.state
    const planet = planets[user.currentPlanet]

    const sideButtons = [
      { fn: this.buy, label: 'Buy' },
      { fn: this.sell, label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          <div>
            {/* Render commodity names and balances */}
            {commodities.map((commodity, i) => (
              <Rect
                key={i}
                isButton
                size="wide"
                active={selectedCommodityId === i}
                onClick={() => this.setState({ selectedCommodityId: i })}
              >
                <div>{commodity.name}</div>
                <div>{"(Your balance: " + commodity.myBalance.toString() + ")"}</div>
              </Rect>
            ))}
          </div>
          <div>
            {/* Render sell orders for currently viewed commodity */}
            {selectedCommodityId !== null ?
              sellOrders
              .filter(sellOrder => sellOrder.commodityId == selectedCommodityId)
              .map((sellOrder, i) => (
                <div key={i}>
                  {sellOrder.seller}
                  {sellOrder.price.toString()}
                  {sellOrder.amount.toString()}
                </div>
              ))
              :
              <Fragment>Select a commodity on the left panel to start buying or selling</Fragment>
            }
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
