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
import Dialog from 'components/reusables/Dialog'
import Rect from 'components/reusables/Rect'

import getPlayerInfo from 'utils/getPlayerInfo'


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

  initEventListening = () => {
    const { contracts, user, setIndustrialState } = this.props
    contracts.gia.CommodityMinted({ fromBlock: 'latest' })
    .on('data', data => {
      const { to, blocksLeft } = data.returnValues
      
      if (to === user.address) {
        getPlayerInfo()
        setIndustrialState({
          miningBlocksLeft: blocksLeft,
        })
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

  componentDidCatch = (error, errorInfo) => {
    console.error(error, errorInfo)
  }

  render() {
    const { isInitialized } = this.state
    const { currentScreen, alertBoxContent, clearAlertBoxContent } = this.props

    if (!isInitialized) {
      return <div>Activating L-337 Nanobulators...</div>
    }

    return (
      <Fragment>
        {/* Render current screen */}
        {screenMapping(currentScreen)}

        {/* Global alert dialog box */}
        <Dialog type="bad" isVisible={alertBoxContent}>
          {alertBoxContent}
          <Rect
            type="bad"
            isButton
            onClick={clearAlertBoxContent}
          >Ok</Rect>
        </Dialog>
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
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
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(App)
App = injectSheet(globalStyles)(App)
export default App
