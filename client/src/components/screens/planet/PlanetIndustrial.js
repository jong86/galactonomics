import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'

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

class PlanetIndustrial extends Component {
  state = {};

  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <MPIContainer>
        PlanetIndustrial
      </MPIContainer>
    )
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

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
