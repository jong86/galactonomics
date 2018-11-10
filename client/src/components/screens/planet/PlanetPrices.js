import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import PricesRow from 'components/reusables/PricesRow'

const styles = {}

class PlanetPrices extends Component {
  state = {};

  componentDidMount = async () => {
    const commodityInfos = await this.getCommodityInfos()
    console.log('commodityInfos', commodityInfos);
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

  render() {
    const { classes, user } = this.props
    const planet = planets[user.currentPlanet]

    return (
      <MPIContainer>
        PlanetPrices
        <PricesRow
          pricesArray={[1, 2, 3]}
          symbol={'BTC'}
        />
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
