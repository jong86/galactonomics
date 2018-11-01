import React from "react";
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'

const styles = {
  Rect: {
    textAlign: "center",
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: ({ type, active }) => {
      // if (active) return '#000'
      return colorFromType(type)
    },
    backgroundColor: ({ type, active }) => {
      if (!active) return '#000'
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
  }
}

let Rect = ({ classes, children, onClick }) => (
  <div className={classes.Rect} onClick={onClick}>
    { children }
  </div>
)

Rect = injectSheet(styles)(Rect)
export default Rect;
