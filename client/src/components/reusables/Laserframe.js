import React from "react";
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'

const styles = {
  LaserFrame: {
    textAlign: "center",
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: ({ type, active }) => {
      // if (active) return '#000'
      return colorFromType(type)
    },
    backgroundColor: ({ type, active }) => {
      if (!active) return 'rgba(0, 0, 0, 0.75)'
      return '#444'
    },
    width: ({ size }) => {
      switch (size) {
        case 'wide': return 'fill-available'
        case 'small': return 'fit-content'
        case 'wide3': return '33.33333%'
        case 'wide4': return '25%'
      }
    },
    borderRadius: 4,
    padding: '12px',
    margin: '4px',
    cursor: ({ isButton }) => isButton ? 'pointer' : 'default',
    userSelect: 'none',

    '&:hover': {
      color: ({ isButton }) => isButton ? '#000' : null,
      backgroundColor: ({ isButton, type }) => isButton ? colorFromType(type) : null,
    }
  }
}

let LaserFrame = ({ classes, children, onClick }) => (
  <div className={classes.LaserFrame} onClick={onClick}>
    { children }
  </div>
)

LaserFrame = injectSheet(styles)(LaserFrame)
export default LaserFrame;
