import React from "react";
import injectSheet from 'react-jss'
import colorFromFlavour from 'utils/colorFromFlavour'

const styles = {
  Rect: {
    textAlign: "center",
    border: ({ flavour }) => '1px solid ' + colorFromFlavour(flavour),
    color: ({ flavour, active }) => {
      // if (active) return '#000'
      return colorFromFlavour(flavour)
    },
    backgroundColor: ({ flavour, active }) => {
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

    '&:hover': {
      color: ({ isButton }) => isButton ? '#000' : null,
      backgroundColor: ({ isButton, flavour }) => isButton ? colorFromFlavour(flavour) : null,
    }
  }
}

let Rect = ({ classes, children, onClick }) => (
  <div className={classes.Rect} onClick={onClick}>
    { children }
  </div>
)

Rect = injectSheet(styles)(Rect)
export default Rect;
