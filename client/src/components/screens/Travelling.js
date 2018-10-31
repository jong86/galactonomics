import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'

const styles = {
  container: {

  }
}

class Welcome extends Component {
  state = {};

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h1>Travelling to planet ________...</h1>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {

  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
  }
}

Welcome = connect(mapStateToProps, mapDispatchToProps)(Welcome)
Welcome = injectSheet(styles)(Welcome)
export default Welcome;
