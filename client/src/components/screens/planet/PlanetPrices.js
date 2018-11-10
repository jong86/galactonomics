import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import PricesRow from 'components/reusables/PricesRow'
import uuid from 'utils/uuid'

const styles = {}

class PlanetPrices extends Component {
  state = {
    commodityPrices: [],
  }

  componentDidMount = async () => {
    const commodityInfos = await this.getCommodityInfos()
    console.log('commodityInfos', commodityInfos);
    this.getAllSellOrders()
  }

  getCommodityInfos = async () => {
    const { contracts, user } = this.props
    const commodityInfos = []

    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < 7; i++) {
          commodityInfos.push(await contracts.gea.getCommodityInfo(i, { from: user.address }))
        }
      } catch (e) {
        return reject(e)
      }

      resolve(commodityInfos)
    })
  }

  getAllSellOrders = async () => {
    const { contracts, user, web3 } = this.props

    // Collect all sell orders for each commodity on each planet
    let planetPrices = []
    for (let planetId = 0; planetId < 7; planetId++) {
      const commodities = []
      for (let commodityId = 0; commodityId < 7; commodityId++) {
        const numSellOrders = await contracts.gea.getNumSellOrders(planetId, commodityId, { from: user.address })
        const sellOrderIds = Array.apply(null, {length: parseInt(numSellOrders.toString())}).map(Number.call, Number)
        const sellOrders = await Promise.all(sellOrderIds.map(sellOrderId => new Promise(async (resolve, reject) => {
          const sellOrder = await contracts.gea.getSellOrder(planetId, commodityId, sellOrderId, { from: user.address })
          resolve(sellOrder)
        })))
        commodities[commodityId] = sellOrders
      }
      planetPrices[planetId] = commodities
    }

    // Change array to only having min/max prices
    planetPrices = planetPrices.map(planet => {
      return planet.map(commodity => {
        if (commodity.length) {
          let min = commodity[0].price
          let max = commodity[0].price

          for (let i = 1; i < commodity.length; i++) {
            if (commodity[i].price.lt(min)) {
              min = commodity[i].price
            }
            if (commodity[i].price.gt(max)) {
              max = commodity[i].price
            }
          }

          return { min, max }
        } else {
          return { min: '-', max: '-' }
        }
      })
    })

    // Put the commodities in the parent array
    // const commodityPrices = planetPrices.map(planet => {
    //   let
    //   return
    // })

    console.log('planetPrices', planetPrices);
    this.setState({ planetPrices })
  }

  render() {
    const { classes, user } = this.props
    const { planetPrices } = this.state

    return (
      <MPIContainer>
        {/* {planetPrices.map(planet => {
          return (
            <PricesRow
              key={uuid()}
              minMax={[1, 2, 3]}
              symbol={'BTC'}
            />
          )
        })} */}
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
