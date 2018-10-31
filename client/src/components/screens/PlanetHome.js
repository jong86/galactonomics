import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'

const styles = {
  container: {
    display: 'grid',
    height: '100%',
    width: 'fill-available',
    gridTemplateColumns: '1.5fr 2.5fr 1fr',
    gridTemplateRows: '1fr',
    gridGap: '1px 1px',
    gridTemplateAreas: ". . .",

    '& > div': {
      border: '1px solid red',
    }
  }
}

class PlanetHome extends Component {
  state = {};

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <div>
          1
        </div>
        <div>
          2
        </div>
        <div>
          3
        </div>
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
    goToPlanetHomeScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetHome' }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
