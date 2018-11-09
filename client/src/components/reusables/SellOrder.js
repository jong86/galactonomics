import React, { Component, Fragment } from "react"
import injectSheet from 'react-jss'
import ellipAddr from 'utils/ellipAddr'

const styles = {
  SellOrder: {
    flexDirection: 'row',
    width: 'fill-available',
    cursor: ({ isHeader }) => { if (!isHeader) return 'pointer' },

    '& > div': {
      border: '1px solid grey',
      width: '25%',
      fontWeight: ({ isHeader }) => { if (isHeader) return 'bold' },
    },
  }
}

let SellOrder = ({ classes, onClick, seller, amount, price, isHeader }) => {
  let items
  if (isHeader) {
    items = ['Seller', 'Amount', 'Price', 'Total']
  } else {
    items = [ellipAddr(seller), amount, price, amount * price]
  }

  return (
    <div
      onClick={onClick}
      className={classes.SellOrder}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item}
        </div>
      ))}
    </div>
  )
}

SellOrder = injectSheet(styles)(SellOrder)
export default SellOrder