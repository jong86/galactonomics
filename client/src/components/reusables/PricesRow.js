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
      backgroundColor: 'rgba(50, 50, 50, 0.75)',
      margin: '2px',
      width: '25%',
      fontWeight: ({ isHeader }) => isHeader ? 'bold' : null,
      flexDirection: 'row',
      padding: '2px',
      paddingTop: '4px',
    },
  }
}

let PricesRow = ({ classes, onClick, symbol, minMaxes, isHeader, fromWei }) => {
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
          return (
            <div key={uuid()} style={{ opacity: 0 }}>
              {'n/a'}
            </div>
          )
        } else if (isHeader) {
          return (
            <div key={uuid()}>
              {item}
            </div>
          )
        } else if (i === 0) {
          return (
            <div key={uuid()}>
              {item.symbol}
            </div>
          )
        } else {
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
  }
}

PricesRow = connect(mapStateToProps)(PricesRow)
PricesRow = injectSheet(styles)(PricesRow)
export default PricesRow