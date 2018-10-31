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
    }
  },
  container: {
    textAlign: "center",
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
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

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

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
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
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.getInfo();

    // Update state with the result.
    this.setState({ infoFromGTA: JSON.stringify(response) });
  };

  render() {
    const { classes } = this.props

    if (!this.state.isInitialized) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className={classes.container}>
        { screenMapping(this.props.currentScreen) }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentScreen: state.view.currentScreen,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addContract: (instance, name) => dispatch({ type: 'ADD_CONTRACT', instance, name })
  }
}

App = connect(mapStateToProps, mapDispatchToProps)(App)
App = injectSheet(styles)(App)
export default App;
