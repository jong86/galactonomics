import React, { Fragment } from "react"
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import planets from 'utils/planets'
import uuid from 'utils/uuid'

const styles = {
  PricesRow: {
    flexDirection: 'row',
    width: 'fill-available',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',


    '& > div': {
      backgroundColor: 'rgba(64, 64, 64, 0.75)',
      margin: '2px',
      width: '25%',
      fontWeight: ({ isHeader }) => isHeader ? 'bold' : null,
      flexDirection: 'row',
      padding: '2px',
      paddingTop: '4px',
    },
  },

  highlight: {
    backgroundColor: 'rgba(128, 128, 128, 0.75) !important',
  },
}

let PricesRow = ({ classes, onClick, symbol, minMaxes, isHeader, fromWei, currentPlanet, commodityId }) => {
  let items = []
  if (isHeader) {
    items = planets.slice(0, 7).map(planet => planet.name)
    items.unshift(null)
  } else {
    items = minMaxes.slice()
    items.unshift({symbol})
  }

  return (
    <div
      onClick={onClick}
      className={classes.PricesRow}
    >
      {items.length && items.map((item, i) => {
        if (item === null) {
          // Blank cell
          return (
            <div key={uuid()} style={{ opacity: 0 }}>
              {'n/a'}
            </div>
          )
        } else if (isHeader) {
          // Display planet names
          return (
            <div key={uuid()} className={i - 1 == currentPlanet && classes.highlight}>
              {item}
            </div>
          )
        } else if (i === 0) {
          // Display commodity names
          return (
            <div key={uuid()} className={commodityId == currentPlanet && classes.highlight}>
              {item.symbol}
            </div>
          )
        } else {
          // Min-max range
          return (
            <div key={uuid()}>
              <span key={uuid()}>
                {item.min && item.min.toString()}
              </span>
              <span key={uuid()}>
                {' - '}
              </span>
              <span key={uuid()}>
                {item.max && item.max.toString()}
              </span>
            </div>
          )
        }
      })}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    fromWei: state.web3.utils.fromWei,
    currentPlanet: state.user.currentPlanet,
  }
}

PricesRow = connect(mapStateToProps)(PricesRow)
PricesRow = injectSheet(styles)(PricesRow)
export default PricesRow