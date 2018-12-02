import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import PricesRow from 'components/reusables/PricesRow'
import uuid from 'utils/uuid'
import Loader from 'components/reusables/Loader'
import commodities from 'utils/commodities'

const styles = {}

class PlanetPrices extends Component {
  state = {
    isLoading: true,
    commoditiesMinMaxes: [],
    commodityInfos: [],
  }

  componentDidMount = async () => {
    const commodityInfos = await this.getCommodityInfos()
    this.setState({commodityInfos})
    this.getAllSellOrders()
    this.getCommoditiesTraded()
  }

  getCommodityInfos = async () => {
    const commodityInfos = []

    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < 7; i++) {
          commodityInfos.push({
            name: commodities[i].name,
            symbol: commodities[i].symbol,
          })
        }
      } catch (e) {
        return reject(e)
      }

      resolve(commodityInfos)
    })
  }

  getCommoditiesTraded = async () => {
    const { contracts, user } = this.props

    const tradedOnPlanet = []

    for (let p = 0; p < 7; p++) {
      const traded = (await contracts.gea.getCommoditiesTraded(p, { from: user.address })).toString().split(',')
      tradedOnPlanet.push(traded)
    }
    console.log(tradedOnPlanet);
  }

  getAllSellOrders = async () => {
    const { contracts, user, web3 } = this.props

    // Collect all sell orders for each commodity on each planet
    let commoditiesPrices = []
    for (let commodityId = 0; commodityId < 7; commodityId++) {
      const planets = []
      for (let planetId = 0; planetId < 7; planetId++) {
        const numSellOrders = await contracts.gea.getNumSellOrders(planetId, commodityId, { from: user.address })
        const sellOrderIds = Array.apply(null, {length: parseInt(numSellOrders.toString())}).map(Number.call, Number)
        let sellOrders = await Promise.all(sellOrderIds.map(sellOrderId => new Promise(async (resolve, reject) => {
          const sellOrder = await contracts.gea.getSellOrder(planetId, commodityId, sellOrderId, { from: user.address })
          resolve(sellOrder)
        })))
        // Filter out closed orders
        sellOrders = sellOrders.filter(order => order.open)
        planets[planetId] = sellOrders
      }
      commoditiesPrices[commodityId] = planets
    }

    // Change array to only having min/max prices
    const commoditiesMinMaxes = commoditiesPrices.map(commodity => {
      return commodity.map(planet => {
        if (planet.length) {
          let min = planet[0].price
          let max = planet[0].price

          for (let i = 1; i < planet.length; i++) {
            if (planet[i].price.lt(min)) {
              min = planet[i].price
            }
            if (planet[i].price.gt(max)) {
              max = planet[i].price
            }
          }

          return { min, max }
        } else {
          return { min: '', max: '' }
        }
      })
    })

    this.setState({ commoditiesMinMaxes, isLoading: false, })
  }

  render() {
    const { classes, user } = this.props
    const { commoditiesMinMaxes, commodityInfos, isLoading } = this.state

    return (
      <MPIContainer>
        {isLoading ?
          <Fragment>
            <Loader />
            Loading prices...
          </Fragment>
          :
          <Fragment>
            <PricesRow isHeader />
            {commoditiesMinMaxes.length && commoditiesMinMaxes.map((commodityMinMaxes, i) => (
              <PricesRow
                key={uuid()}
                minMaxes={commodityMinMaxes}
                symbol={commodityInfos[i].symbol}
              />
            ))}
          </Fragment>
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
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

PlanetPrices = connect(mapStateToProps, mapDispatchToProps)(PlanetPrices)
PlanetPrices = injectSheet(styles)(PlanetPrices)
export default PlanetPrices;
