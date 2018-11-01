import React from "react";
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'

const styles = {
  Rect: {
    textAlign: "center",
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: ({ type }) => colorFromType(type),
    width: ({ shape }) => {
      switch (shape) {
        case 'wide': return 'fill-available'
        case 'small': return 'fit-content'
        case 'square3': return '33.33333%'
      }
    },
    // height: ({ shape }) => {
    //   if (shape === 'square3') {
    //     return 40
    //   }
    // },
    borderRadius: 4,
    padding: '4px',
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
