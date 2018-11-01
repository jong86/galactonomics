import React from "react";
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import colorFromType from 'utils/colorFromType'
import Rect from 'components/reusables/Rect'

const styles = {
  Dialog: {
    border: ({ type }) => '1px solid ' + colorFromType(type),
    color: ({ type }) => colorFromType(type),
    width: 'fit-content',
    borderRadius: 4,
    padding: '4px',
    textAlign: "center",
    display: ({ children }) => children ? 'absolute' : 'none',
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#000',
  }
}

let Dialog = ({ classes, children, onConfirm, clearDialogContent }) => (
  <div className={classes.Dialog}>
    { children }
    <Rect onClick={() => {
      if (onConfirm) return onConfirm()
      clearDialogContent()
    }}>Ok</Rect>
  </div>
)

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    clearDialogContent: () => dispatch({ type: 'SET_DIALOG_CONTENT', content: '' }),
  }
}

Dialog = connect(mapStateToProps, mapDispatchToProps)(Dialog)
Dialog = injectSheet(styles)(Dialog)
export default Dialog;
