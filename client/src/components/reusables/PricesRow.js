import React from "react"
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import planets from 'utils/planets'

const styles = {
  PricesRow: {
    flexDirection: 'row',
    width: 'fill-available',
    cursor: ({ isHeader }) => !isHeader ? 'pointer' : null,

    backgroundColor: ({ isSelected }) => isSelected ? '#777' : null,
    '&:hover': {
      backgroundColor: ({ isSelected, isHeader }) => { if (!isHeader) return isSelected ? '#777' : '#222' },
    },

    '& > div': {
      border: '1px solid grey',
      width: '25%',
      fontWeight: ({ isHeader }) => isHeader ? 'bold' : null,
    },
  }
}

let PricesRow = ({ classes, onClick, symbol, pricesArray, isHeader, fromWei }) => {
  let items = []
  if (isHeader) {
    items = planets.map(planet => planet.name).unshift('')
  } else {
    pricesArray.unshift(symbol)
  }

  return (
    <div
      onClick={onClick}
      className={classes.PricesRow}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item}
        </div>
      ))}
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