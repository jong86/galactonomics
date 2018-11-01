import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'

const styles = {
  outer: {
    height: '100%',
    width: 'fill-available',
    border: '1px solid red',
    '& > div': {
      width: 'fill-available',
    }
  },
  topRow: {
    flexDirection: 'row',
  },
  topLeftCol: {
    flex: 1,
  },
  topRightCol: {
    flex: 0.2,
  },
}

class MPIContainer extends Component {
  state = {};

  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <div className={classes.outer}>
        <div className={classes.topRow}>
          {/* Top row */}
          <div className={classes.topLeftCol}>
            <div>cargo meter here</div>
            <div>{ this.props.children }</div>
          </div>
          <div className={classes.topRightCol}>
            <div>status/buttons here</div>
          </div>
        </div>
        <div>
          {/* Bottom row */}
          navigation here
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
