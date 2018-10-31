import React, { Component } from "react";
import { connect } from 'react-redux';
import injectSheet from 'react-jss'

const styles = {
  container: {
    textAlign: "center",
  }
}

class Travel extends Component {
  state = {};


  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <h1>Travel</h1>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {

  }
}

Travel = connect(mapStateToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
