import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import globalStyles from 'globalStyles'

import commoditiesJSON from "contracts/Commodities.json"
import gtaJSON from "contracts/GalacticTransitAuthority.json"
import geaJSON from "contracts/GalacticEconomicAuthority.json"
import giaJSON from "contracts/GalacticIndustrialAuthority.json"
import templeJSON from "contracts/TempleAuthority.json"

import getWeb3 from "utils/getWeb3"
import truffleContract from "truffle-contract"

import screenMapping from 'utils/screenMapping'
import Dialog from 'components/reusables/Dialog'
import LaserFrame from 'components/reusables/LaserFrame'

import getPlayerInfo from 'utils/getPlayerInfo'
import planets from 'utils/planets'

class App extends Component {
  state = {
    isInitialized: null,
  }

  componentDidMount = async () => {
    try {
      await this.initWeb3AndContracts()
      await this.initEventListening()

      let ownsSpaceship
      ownsSpaceship = await this.checkIfOwnsSpaceship()

      if (ownsSpaceship) {
        await getPlayerInfo()
      } else {
        this.props.changeScreen('Welcome')
      }

    } catch (e) {
      return console.error(e)
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
        { json: commoditiesJSON, name: 'commodities' },
        { json: gtaJSON, name: 'gta' },
        { json: geaJSON, name: 'gea' },
        { json: giaJSON, name: 'gia' },
        { json: templeJSON, name: 'temple' },
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

  initEventListening = () => {
    const { contracts, user, web3, setIndustrialState } = this.props

    // Reset areasMined when someone mines a commodity,
    // because timesMined variable used in hash is changed
    contracts.gia.CommodityMined({ fromBlock: 'latest' })
    .on('data', data => {
      const { miner } = data.returnValues
      console.log(miner, 'just mined a commodity')
      setIndustrialState({
        areasMined: [],
      })
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

  componentDidCatch = (error, errorInfo) => {
    console.error(error, errorInfo)
  }

  render() {
    const { isInitialized } = this.state
    const { classes, currentScreen, alertBoxContent, clearAlertBoxContent, user } = this.props
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    if (!isInitialized) {
      return <div>Activating L-337 Nanobulators...</div>
    }

    const bgImage = () => {
      const styleObject = {}
      if (
        (currentScreen.substr(0, 6) === 'Planet' || currentScreen.substr(0, 6) === 'Temple')&&
        currentScreen !== 'PlanetIntro' && currentScreen !== 'TempleIntro'
      ) {
        styleObject.backgroundImage = `url(${planet.img})`
      }
      if (user.currentPlanet == '255') {
        styleObject.backgroundPosition = '50% 40%'
        styleObject.backgroundSize = '50%'
      }
      return styleObject
    }

    return (
      <div className={classes.App} style={bgImage()}>
        {/* Render current screen */}
        {screenMapping(currentScreen)}

        {/* Global alert dialog box */}
        <Dialog type="bad" isVisible={alertBoxContent}>
          {alertBoxContent}
          <LaserFrame
            type="bad"
            isButton
            onClick={clearAlertBoxContent}
          >Ok</LaserFrame>
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    currentScreen: state.view.currentScreen,
    contracts: state.contracts,
    user: state.user,
    alertBoxContent: state.view.alertBoxContent,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setWeb3: (web3) => dispatch({ type: 'SET_WEB3', web3 }),
    addContract: (instance, name) => dispatch({ type: 'ADD_CONTRACT', instance, name }),
    setAddress: (address) => dispatch({ type: 'SET_ADDRESS', address }),
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
    clearAlertBoxContent: () => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content: '' }),
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(App)
App = injectSheet(globalStyles)(App)
export default App
