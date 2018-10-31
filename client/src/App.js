import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import globalStyles from 'globalStyles'

import gtaJSON from "contracts/GalacticTransitAuthority.json"
import geaJSON from "contracts/GalacticEconomicAuthority.json"
import giaJSON from "contracts/GalacticIndustrialAuthority.json"
import getWeb3 from "utils/getWeb3"
import truffleContract from "truffle-contract"

import screenMapping from 'utils/screenMapping'

class App extends Component {
  state = {
    isInitialized: null,
  }

  componentDidMount = async () => {
    try {
      await this.initWeb3AndContracts()
      this.listenToContracts()

      let ownsSpaceship
      ownsSpaceship = await this.checkIfOwnsSpaceship()

      if (ownsSpaceship) {
        await this.getPlayerInfo()
      }

    } catch (e) {
      console.error(e)
    }

    this.setState({ isInitialized: true })
  }

  initWeb3AndContracts = () => new Promise(async (resolve, reject) => {
    try {
      // Save web3 in redux store
      const web3 = await getWeb3()
      this.props.setWeb3(web3)

      // Save account in redux store
      const accounts = await web3.eth.getAccounts()
      this.props.setAddress(accounts[0])

      // Get all contract instances
      let contracts = [
        { json: gtaJSON, name: 'gta' },
        { json: geaJSON, name: 'gea' },
        { json: giaJSON, name: 'gia' },
      ]

      contracts = await Promise.all(
        contracts.map(contract => new Promise(async (resolve, reject) => {
          const Contract = truffleContract(contract.json)
          Contract.setProvider(web3.currentProvider)
          try {
            const instance = await Contract.deployed()
            resolve({
              instance: instance,
              name: contract.name,
            })
          } catch (e) {
            reject(e)
          }
        }))
      )

      // Save the contracts to redux store
      contracts.forEach(contract => this.props.addContract(contract.instance, contract.name))

      resolve()

    } catch (e) {
      // Catch any errors for any of the above operations.
      reject(e)
    }
  })

  listenToContracts = () => {
    const { contracts, user } = this.props

    contracts.gta.TravelComplete({}, (error, response) => {
      if (error) return console.error(error)
      const { player, currentFuel, planetId } = response.args
      if (player === user.address) {
        this.props.setUserInfo({
          currentFuel: currentFuel.toString(),
          currentPlanet: planetId.toString(),
        })
        this.props.goToPlanetIntroScreen()
      }
    })
  }

  checkIfOwnsSpaceship = () => new Promise(async (resolve, reject) => {
    const { contracts, user } = this.props

    let spaceshipsOwned
    try {
      spaceshipsOwned = await contracts.gta.balanceOf(user.address, { from: user.address })
    } catch (e) {
      return reject(e)
    }

    if (spaceshipsOwned.toString() === '0') {
      this.props.setUserInfo({ ownsSpaceship: false })
      return resolve(false)
    }

    this.props.setUserInfo({ ownsSpaceship: true })
    resolve(true)
  })

  getPlayerInfo = () => new Promise(async (resolve, reject) => {
    const { contracts, user } = this.props

    let playerInfo
    try {
      playerInfo = await contracts.gta.getInfo({ from: user.address })
    } catch (e) {
      return reject(e)
    }

    this.props.setUserInfo({
      currentFuel: playerInfo.currentFuel.toString(),
      currentPlanet: playerInfo.currentPlanet.toString(),
      maxCargo: playerInfo.maxCargo.toString(),
      maxFuel: playerInfo.maxFuel.toString(),
      spaceshipName: playerInfo.spaceshipName.toString(),
    })

    resolve()
  })

  render() {
    if (!this.state.isInitialized) {
      return <div>Activating L-337 Nanobulators...</div>
    }

    return (
      <Fragment>
        { screenMapping(this.props.currentScreen) }
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentScreen: state.view.currentScreen,
    contracts: state.contracts,
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setWeb3: (web3) => dispatch({ type: 'SET_WEB3', web3 }),
    addContract: (instance, name) => dispatch({ type: 'ADD_CONTRACT', instance, name }),
    setAddress: (address) => dispatch({ type: 'SET_ADDRESS', address }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    goToPlanetIntroScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIntro' }),
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(App)
App = injectSheet(globalStyles)(App)
export default App
