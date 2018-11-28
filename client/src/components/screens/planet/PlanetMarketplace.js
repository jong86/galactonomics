import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import uuid from 'utils/uuid'
import SellOrder from 'components/reusables/SellOrder'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'

const styles = {
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    '& > div:first-child': {
      flex: '0.2',
    },
    '& > div:last-child': {
      flex: '0.8',
    },
  }
}

class PlanetMarketplace extends Component {
  constructor(props) {
    super(props)

    this.state = {
      commodities: [],
      sellOrders: [],
      selectedCommodityId: null,
      selectedSellOrderId: null,

      sellAmount: '',
      sellPrice: '',

      isSellBoxVisible: false,

      isLoading: false,
    }

    this.handleChange = handleChange.bind(this)
  }

  componentDidMount = () => {
    this.getCommodities()
  }

  componentDidUpdate(_, prevState) {
    if (this.state.selectedCommodityId !== prevState.selectedCommodityId) {
      this.getSellOrders()
    }
  }

  getSellOrders = async () => {
    const { contracts, user } = this.props
    const { selectedCommodityId } = this.state

    if (selectedCommodityId !== null) {
      this.setState({ isLoading: true })

      const numSellOrders = await contracts.gea.getNumSellOrders(
        user.currentPlanet,
        selectedCommodityId,
        { from: user.address }
      )

      const sellOrderIds = Array.apply(null, {length: parseInt(numSellOrders.toString())}).map(Number.call, Number)

      // Collect all sell orders
      const sellOrders = await Promise.all(sellOrderIds.map(sellOrderId => new Promise(async (resolve, reject) => {
        let sellOrder
        try {
          sellOrder = await contracts.gea.getSellOrder(user.currentPlanet, selectedCommodityId, sellOrderId, { from: user.address })
        } catch (e) {
          reject(e)
        }
        resolve(sellOrder)
      })))
      this.setState({ sellOrders, isLoading: false })
    }
  }

  getCommodities = async () => {
    const commoditiesTraded = await this.getCommoditiesTraded()
    const commodityInfos = await this.getCommodityInfos(commoditiesTraded)
    const commodityBalances = await this.getCommodityBalances(commoditiesTraded)

    this.setState({
      commodities: commodityInfos.map((commodityInfo, i) => ({
        id: commoditiesTraded[i],
        name: commodityInfo.name,
        symbol: commodityInfo.symbol,
        myBalance: commodityBalances[i]
      }))
    })
  }

  getCommoditiesTraded = async () => {
    const { contracts, user } = this.props
    let commoditiesTraded
    return new Promise(async (resolve, reject) => {
      try {
        commoditiesTraded = await contracts.gea.getCommoditiesTraded(user.currentPlanet, { from: user.address })
      } catch (e) {
        return reject(e)
      }
      commoditiesTraded = commoditiesTraded.map(commodityIdBN => commodityIdBN.toNumber())
      resolve(commoditiesTraded)
    })
  }

  getCommodityInfos = async commodityIds => {
    const { contracts, user } = this.props
    const commodityInfos = []
    return new Promise(async (resolve, reject) => {
      try {
        for (let id of commodityIds) {
          commodityInfos.push({
            name: await contracts.commodities.getName(id, { from: user.address }),
            symbol: await contracts.commodities.getSymbol(id, { from: user.address }),
          })
        }
      } catch (e) {
        return reject(e)
      }
      resolve(commodityInfos)
    })
  }

  getCommodityBalances = async commodityIds => {
    const { contracts, user } = this.props
    let commodityBalances = []
    return new Promise(async (resolve, reject) => {
      try {
        for (let id of commodityIds) {
          commodityBalances.push(await contracts.commodities.getBalance(id, { from: user.address }))
        }
      } catch (e) {
        reject(e)
      }
      commodityBalances = commodityBalances.map(commodityIdBN => commodityIdBN.toNumber())
      resolve(commodityBalances)
    })
  }

  createSellOrder = async () => {
    const { contracts, user } = this.props
    const { selectedCommodityId, sellAmount, sellPrice } = this.state

    try {
      await contracts.gea.createSellOrder(
        user.currentPlanet,
        selectedCommodityId,
        sellAmount,
        sellPrice,
        { from: user.address },
      )
    } catch (e) {
      this.setState({ isSellBoxVisible: false })
      this.props.setDialogBox("Error creating sell order", "bad")
      return
    }

    this.setState({ isSellBoxVisible: false })
    // Refresh list of sell orders
    this.getSellOrders()
    // Refresh commodity balances
    this.getCommodities()
    // Refresh cargo
    getPlayerInfo()
  }

  onClickBuy = async () => {
    const { contracts, user } = this.props
    const { sellOrders, selectedCommodityId, selectedSellOrderId } = this.state
    const sellOrder = sellOrders[selectedSellOrderId]

    try {
      await contracts.gea.buySellOrder(
        user.currentPlanet,
        selectedCommodityId,
        selectedSellOrderId,
        { from: user.address, value: sellOrder.amount.mul(sellOrder.price)},
      )
    } catch (e) {
      this.props.setDialogBox("Error buying order", "bad")
      return
    }

    // Refresh list of sell orders
    this.getSellOrders()
    // Refresh commodity balances
    this.getCommodities()
    // Refresh cargo
    getPlayerInfo()
  }

  onClickSell = () => {
    const {
      commodities,
      sellPrice,
      sellAmount,
      selectedCommodityId,
    } = this.state

    let commodity = { name: '', symbol: '' }
    if (commodities.length && typeof selectedCommodityId === 'number') {
      commodity = commodities[commodities.findIndex(commodity => commodity.id === selectedCommodityId)]
    }

    if (selectedCommodityId !== null) {
      this.props.setDialogBox(
        <Fragment>
          <div>
          Selling {commodity.name}
          </div>
          <label htmlFor="sellAmount">
            Amount
            <input name="sellAmount" defaultValue={sellAmount} type="number" onChange={this.handleChange}></input>
          </label>
          <label htmlFor="sellPrice">
            Price
            <input name="sellPrice" defaultValue={sellPrice} type="number" onChange={this.handleChange}></input>
          </label>
          <LaserFrame
            flavour="info"
            isButton
            onClick={this.createSellOrder}
          >Ok</LaserFrame>
        </Fragment>,
        "info",
        true,
      )
    } else {
      this.props.setDialogBox("You need to select a commodity to sell", "bad")
    }
  }

  render() {
    const { classes } = this.props
    const {
      commodities,
      sellOrders,
      sellPrice,
      sellAmount,
      selectedCommodityId,
      selectedSellOrderId,
      isSellBoxVisible,
      isLoading,
    } = this.state

    let commodity = { name: '', symbol: '' }
    if (commodities.length && typeof selectedCommodityId === 'number') {
      commodity = commodities[commodities.findIndex(commodity => commodity.id === selectedCommodityId)]
    }

    const sideButtons = [
      { fn: this.onClickBuy, label: 'Buy' },
      { fn: this.onClickSell, label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          <div>
            {/* Render commodity names and balances */}
            {commodities.map((commodity, i) => (
              <LaserFrame
                key={i}
                isButton
                size="wide"
                active={selectedCommodityId === commodity.id}
                onClick={() => this.setState({ selectedCommodityId: commodities[i].id })}
              >
                <div>{commodity.name}</div>
                <div>{"(You have: " + commodity.myBalance.toString() + " kg)"}</div>
              </LaserFrame>
            ))}
          </div>
          {isLoading ?
            <div>
              <Loader />
              Loading orders...
            </div>
            :
            <div>
              {/* Render sell orders for currently viewed commodity */}
              {selectedCommodityId !== null ?
                <Fragment>
                  <SellOrder isHeader symbol={commodity.symbol} />
                  {sellOrders
                    .filter(sellOrder => sellOrder.open)
                    .map(sellOrder => (
                      <SellOrder
                        key={uuid()}
                        onClick={() => this.setState({
                          selectedSellOrderId: sellOrder.orderId.toString()
                        })}
                        seller={sellOrder.seller}
                        amount={sellOrder.amount.toString()}
                        price={sellOrder.price.toString()}
                        isSelected={selectedSellOrderId === sellOrder.orderId.toString()}
                      />
                    ))
                  }
                </Fragment>
                :
                'Select a commodity on the left panel to start buying or selling'
              }
            </div>
          }
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
    setDialogBox: (content, flavour, noDefaultButton) =>
      dispatch({ type: 'SET_DIALOG_BOX', content, flavour, noDefaultButton }),
  }
}

PlanetMarketplace = connect(mapStateToProps, mapDispatchToProps)(PlanetMarketplace)
PlanetMarketplace = injectSheet(styles)(PlanetMarketplace)
export default PlanetMarketplace;
