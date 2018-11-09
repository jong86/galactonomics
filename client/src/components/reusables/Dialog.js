import React from "react";
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'

const styles = {
  Dialog: {
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: '#fff',
    width: 'fit-content',
    borderRadius: 4,
    padding: '16px',
    textAlign: "center",
    display: ({ isVisible }) => isVisible ? 'absolute' : 'none',
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#000',
  }
}

let Dialog = ({ classes, type, children }) => (
  <div className={classes.Dialog}>
    { children }
  </div>
)

Dialog = injectSheet(styles)(Dialog)
export default Dialog;
