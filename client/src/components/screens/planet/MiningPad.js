import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import LaserFrame from 'components/reusables/LaserFrame'
import { MdLinearScale } from "react-icons/md";

const styles = {
  MiningPad: {
    flexDirection: 'row',
    display: 'grid',
    'grid-template-columns': 'repeat(64, 0.1% 1fr)',
    'grid-template-rows': 'auto',
  },
}

class MiningPad extends Component {
  mineArea = (start, end) => {
    console.log('start, end', start, end);
  }

  render() {
    const { classes } = this.props

    return (
      <LaserFrame
        size="wide"
      >
        <div className={classes.MiningPad}>
          {Array(4096).fill().map((_, i) =>
            <div
              onClick={() => this.mineArea(i * 1024, i * 1024 + 1024)}
            >0</div>
          )}
        </div>
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
