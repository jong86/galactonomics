import React, { Component } from "react";
import { connect } from 'react-redux';
import injectSheet from 'react-jss'

import gtaJSON from "./contracts/GalacticTransitAuthority.json";
import geaJSON from "./contracts/GalacticEconomicAuthority.json";
import giaJSON from "./contracts/GalacticIndustrialAuthority.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import screenMapping from './utils/screenMapping'

const styles = {
  '@global': {
    body: {
      backgroundColor: 'black',
      color: 'white',
      fontFamily: 'Verdana',
    },
    div: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    },
  },
}

class App extends Component {
  state = {
    infoFromGTA: 0,
    isInitialized: null,
    accounts: null,
    contract: null,
  };

  componentDidMount = async () => {
    try {
      // Save web3 in redux store
      const web3 = await getWeb3();
      this.props.setWeb3(web3)

      // Save account in redux store
      const accounts = await web3.eth.getAccounts();
      this.props.setAddress(accounts[0])

      // Get all contract instances
      let contracts = [
        { json: gtaJSON, name: 'gta' },
        { json: geaJSON, name: 'gea' },
        { json: giaJSON, name: 'gia' },
      ]

      contracts = await Promise.all(
        contracts.map(contract => new Promise(async (resolve, reject) => {
          const Contract = truffleContract(contract.json);
          Contract.setProvider(web3.currentProvider);
          try {
            const instance = await Contract.deployed();
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

      this.setState({ isInitialized: true })

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  runExample = async () => {
    const { accounts, gta } = this.props;

    // Get the value from the contract to prove it worked.
    const response = await gta.getInfo();

    // Update state with the result.
    this.setState({ infoFromGTA: JSON.stringify(response) });
  };

  render() {
    const { classes } = this.props

    if (!this.state.isInitialized) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div>
        { screenMapping(this.props.currentScreen) }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentScreen: state.view.currentScreen,
    contract: state.contracts,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setWeb3: (web3) => dispatch({ type: 'SET_WEB3', web3 }),
    addContract: (instance, name) => dispatch({ type: 'ADD_CONTRACT', instance, name }),
    setAddress: (address) => dispatch({ type: 'SET_ADDRESS', address })
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(App)
App = injectSheet(styles)(App)
export default App;
