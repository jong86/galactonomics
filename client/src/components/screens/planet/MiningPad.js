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
    // 'grid-row-gap': '4px',
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
    const { setIndustrialState } = this.props
    setIndustrialState({
      isMining: true,
      areaStart: start,
      areaEnd: end,
    })
  }

  render() {
    const { classes, setIndustrialState } = this.props

    return (
      <LaserFrame
        size="wide"
      >
        <div className={classes.MiningPad}>
          {Array(4096).fill().map((_, i) => {
            const areaStart = i * 1024
            const areaEnd = areaStart + 1024

            return (
              <span
                className={classes.area}
                key={i}
                onClick={() => this.mineArea(areaStart, areaEnd)}
                onMouseEnter={e => {
                  e.stopPropagation()
                  setIndustrialState({ areaStart, areaEnd, nonce: areaStart })
                }}
                onMouseLeave={e => {
                  e.stopPropagation()
                  setIndustrialState({ areaStart: undefined, areaEnd: undefined })
                }}
              >?</span>
            )
          })}
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

const mapDispatchToProps = dispatch => {
  return {
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

MiningPad = connect(mapStateToProps, mapDispatchToProps)(MiningPad)
MiningPad = injectSheet(styles)(MiningPad)
export default MiningPad;
