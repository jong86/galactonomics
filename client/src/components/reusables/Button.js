import React from "react";
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'

const styles = {
  Button: {
    textAlign: "center",
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: ({ type }) => colorFromType(type),
    width: 'min-content',
    borderRadius: 4,
    padding: '4px',
    cursor: 'pointer',
    userSelect: 'none',
  }
}

let Button = ({ classes, children, onClick }) => (
  <div className={classes.Button} onClick={onClick}>
    { children }
  </div>
)

Button = injectSheet(styles)(Button)
export default Button;
