import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import LaserFrame from 'components/reusables/LaserFrame'

const styles = {
  MiningPad: {
    flexDirection: 'row',
    display: 'grid',
    'grid-template-columns': 'repeat(128, 1fr)',
    'grid-template-rows': 'auto',
    'grid-row-gap': '4px',
    fontSize: 16,
  },
  area: {
    zIndex: 1,
    backgroundColor: '#44',
    width: 'min-content',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#aaa',
    }
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
            <span
              className={classes.area}
              key={i}
              onClick={() => this.mineArea(i * 1024, i * 1024 + 1024)}
            >?</span>
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
    industrial: state.industrial,
  }
}

MiningPad = connect(mapStateToProps)(MiningPad)
MiningPad = injectSheet(styles)(MiningPad)
export default MiningPad;
