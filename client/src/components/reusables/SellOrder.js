import React, { Component, Fragment } from "react"
import injectSheet from 'react-jss'
import { connect } from 'react-redux'
import ellipAddr from 'utils/ellipAddr'

const styles = {
  SellOrder: {
    flexDirection: 'row',
    width: 'fill-available',
    cursor: ({ isHeader }) => !isHeader ? 'pointer' : null,

    backgroundColor: ({ isSelected }) => isSelected ? '#777' : '#000',
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

let SellOrder = ({ classes, onClick, seller, amount, price, symbol, isHeader, fromWei }) => {
  let items
  if (isHeader) {
    items = ['Seller', 'Price (ETH)', `Amount (${symbol})`, 'Total (ETH)']
  } else {
    items = [ellipAddr(seller), fromWei(String(price)), amount, fromWei(String(amount * price))]
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

const mapStateToProps = state => {
  return {
    fromWei: state.web3.utils.fromWei,
  }
}

SellOrder = connect(mapStateToProps)(SellOrder)
SellOrder = injectSheet(styles)(SellOrder)
export default SellOrder