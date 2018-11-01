import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'

const styles = {
  container: {
    display: 'grid',
    height: '100%',
    gridTemplateColumns: '1.5fr 0.5fr',
    gridTemplateRows: '0.5fr 2fr 0.5fr',
    gridGap: '1px 1px',
    gridTemplateAreas: '". ." ". ." ". ."',
    alignItems: 'start',
  },
}

class MPIContainer extends Component {
  state = {};

  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <div className={classes.container}>
        <div>
          {/* Cargo meter (top-left) */}
          cargo
        </div>
        <div>
          {/* Money (top-right) */}
          money
        </div>
        <div>
          {/* Main */}
          { this.props.children }
        </div>
        <div>
          {/* buttons (mid-right) */}
          buttons
        </div>
        <div>
          {/* Navigation (bottom-left) */}
          Navigation
        </div>
        <div>
          {/* help (bottom-right) */}
          help
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

MPIContainer = connect(mapStateToProps, mapDispatchToProps)(MPIContainer)
MPIContainer = injectSheet(styles)(MPIContainer)
export default MPIContainer;
