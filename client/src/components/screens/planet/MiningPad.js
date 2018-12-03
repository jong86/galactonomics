import React, { Component, Fragment } from "react";
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import Laserframe from 'components/reusables/Laserframe'

const styles = {
  MiningPad: {
    flexDirection: 'row',
    display: 'grid',
    'grid-template-columns': 'repeat(128, 1fr)',
    'grid-template-rows': 'auto',
    fontSize: 14,
  },
  area: {
    zIndex: 1,
    backgroundColor: '#44',
    width: 'min-content',
    paddingTop: '2px',
    '&:hover': {
      backgroundColor: '#444 !important',
      cursor: 'pointer',
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
    const { classes, setIndustrialState, areaSize } = this.props
    const { areasMined } = this.props.industrial

    return (
      <Laserframe
        size="wide"
      >
        <div className={classes.MiningPad}>
          {Array(4096).fill().map((_, i) => {
            const areaStart = i * areaSize
            const areaEnd = areaStart + areaSize
            const wasMined = Array.isArray(areasMined) && areasMined.includes(i)
            const char = wasMined ? 'X' : 'O'
            return (
              <span
                className={classes.area}
                key={i}
                onClick={() => {
                  if (!wasMined)
                    this.mineArea(areaStart, areaEnd)
                }}
                style={{
                  color: wasMined ? '#f00' : null,
                }}
                onMouseEnter={e => {
                  e.stopPropagation()
                  if (!wasMined)
                    setIndustrialState({ areaStart, areaEnd, nonce: areaStart })
                }}
                onMouseLeave={e => {
                  e.stopPropagation()
                  if (!wasMined)
                    setIndustrialState({ areaStart: undefined, areaEnd: undefined })
                }}
              >{char}</span>
            )
          })}
        </div>
      </Laserframe>
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
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

MiningPad = connect(mapStateToProps, mapDispatchToProps)(MiningPad)
MiningPad = injectSheet(styles)(MiningPad)
export default MiningPad;
