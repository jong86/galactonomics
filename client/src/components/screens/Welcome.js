import React, { Component } from "react";
import { connect } from 'react-redux';
import injectSheet from 'react-jss'

import gtaContract from "./contracts/GalacticTransitAuthority.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

const styles = {
  container: {
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


  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h1>Galactonomics</h1>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    global: state.global,
  }
}


App = injectSheet(styles)(App)
export default App;
