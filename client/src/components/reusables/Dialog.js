import React from "react";
import injectSheet from 'react-jss'
import colorFromFlavour from 'utils/colorFromFlavour'

const styles = {
  Dialog: {
    border: ({ flavour }) => '1px solid ' + colorFromFlavour(flavour),
    color: '#fff',
    width: 'fit-content',
    borderRadius: 4,
    padding: '16px',
    textAlign: "center",
    position: 'absolute',
    zIndex: 3,
    backgroundColor: '#000',
  },
  backdrop: {
    display: ({ isVisible }) => isVisible ? 'flex' : 'none',
    zIndex: 2,
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.75)',
    height: '100vh',
    width: '100vw',
  }
}

let Dialog = ({ classes, children }) => (
  <div className={classes.backdrop}>
    <div className={classes.Dialog}>
      { children }
    </div>
  </div>
)

Dialog = injectSheet(styles)(Dialog)
export default Dialog;
