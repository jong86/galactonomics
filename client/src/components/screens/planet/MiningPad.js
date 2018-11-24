import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import LaserFrame from 'components/reusables/LaserFrame'

const styles = {
}

class MiningPad extends Component {
  render() {
    const { classes } = this.props

    return (
      <LaserFrame
        size="wide"
      >
      </LaserFrame>
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

MiningPad = connect(mapStateToProps)(MiningPad)
MiningPad = injectSheet(styles)(MiningPad)
export default MiningPad;
