import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import Dialog from 'components/reusables/Dialog'
import getPlayerInfo from 'utils/getPlayerInfo'

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
  constructor(props) {
    super(props)

    this.state = {
      commodities: [],
      sellOrders: [],
      selectedCommodityId: null,

      sellAmount: '',
      sellPrice: '',
    }

    this.handleChange = handleChange.bind(this);
  }

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
      commodities: commodityNames.map((commodityName, i) =>
        ({name: commodityName, myBalance: commodityBalances[i].toString()})
      )
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
      this.setState({ isSellBoxVisible: false })
      this.props.setAlertBoxContent("Error creating sell order")
      return
    }

    this.setState({ isSellBoxVisible: false })
    // Refresh list of sell orders
    this.getSellOrders()
    // Refresh commodity balances
    this.getCommodities()
  }

  onClickBuy = () => {
    // const { selectedOrderId, commodities } = this.state
    // const commodityName = commodities[selectedCommodityId].name
    // this.props.setAlertBoxContent(
    //   <Fragment>
    //     <div>
    //       Buying {commodityName}
    //     </div>
    //     <input placeholder="amount"></input>
    //     <input placeholder="price"></input>
    //   </Fragment>
    // )
  }

  onClickSell = () => {
    const { selectedCommodityId } = this.state
    if (selectedCommodityId !== null) {
      this.setState({ isSellBoxVisible: true })
    } else {
      this.props.setAlertBoxContent("You need to select a commodity to sell")
    }
  }

  render() {
    const { classes, user } = this.props
    const { commodities, sellOrders, sellPrice, sellAmount, selectedCommodityId, isSellBoxVisible } = this.state
    let commodityName
    if (commodities.length && selectedCommodityId) {
      commodityName = commodities[selectedCommodityId].name
    }
    const planet = planets[user.currentPlanet]

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
              <Rect
                key={i}
                isButton
                size="wide"
                active={selectedCommodityId === i}
                onClick={() => this.setState({ selectedCommodityId: i })}
              >
                <div>{commodity.name}</div>
                <div>{"(Your have: " + commodity.myBalance.toString() + " kg)"}</div>
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

        {/* Sell box */}
        <Dialog type="status" isVisible={isSellBoxVisible}>
          <div>
            Selling {commodityName}
          </div>
          <label htmlFor="sellAmount">
            Amount
            <input name="sellAmount" defaultValue={sellAmount} type="number" onChange={this.handleChange}></input>
          </label>
          <label htmlFor="sellPrice">
            Price
            <input name="sellPrice" defaultValue={sellPrice} type="number" onChange={this.handleChange}></input>
          </label>
          <Rect
            type="status"
            isButton
            onClick={this.createSellOrder}
          >Ok</Rect>
        </Dialog>
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
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
  }
}

PlanetMarketplaces = connect(mapStateToProps, mapDispatchToProps)(PlanetMarketplaces)
PlanetMarketplaces = injectSheet(styles)(PlanetMarketplaces)
export default PlanetMarketplaces;
