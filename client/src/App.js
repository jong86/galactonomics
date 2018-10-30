import React, { Component } from "react";
import injectSheet from 'react-jss'

import gtaContract from "./contracts/GalacticTransitAuthority.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

const styles = {
  App: {
    textAlign: "center",
  }
}

class App extends Component {
  state = {
    infoFromGTA: 0,
    web3: null,
    accounts: null,
    contract: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(gtaContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
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

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className={classes.App}>
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 37</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.infoFromGTA}</div>
      </div>
    );
  }
}

App = injectSheet(styles)(App)
export default App;
