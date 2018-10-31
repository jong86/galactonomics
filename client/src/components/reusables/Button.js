import React, { Component } from "react";
import injectSheet from 'react-jss'

const styles = {
  Button: {
    textAlign: "center",
    border: '1px solid red',
    width: 'min-content',
  }
}

let Button = ({ classes, children, onClick }) => (
  <div className={classes.Button} onClick={onClick}>
    { children }
  </div>
)

Button = injectSheet(styles)(Button)
export default Button;
