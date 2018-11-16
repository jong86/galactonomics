import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

class TempleIndustrial extends Component {
  componentDidMount = () => {
  }

  render() {
    const { classes, user, web3 } = this.props
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <MPIContainer>
        <Rect
          size="wide"
        >
          <div>Would like to forge a crystal?</div>
          <div>(Requires ____ kg of all 7 commodities)</div>
          <div className={classes.acceptDecline}>
            <Rect
              isButton
              type="bad"
            >Decline</Rect>
            <Rect
              isButton
              type="good"
              onClick={this.acceptOffer}
            >Accept</Rect>
          </div>
        </Rect>
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
    industrial: state.industrial,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

TempleIndustrial = connect(mapStateToProps, mapDispatchToProps)(TempleIndustrial)
TempleIndustrial = injectSheet(styles)(TempleIndustrial)
export default TempleIndustrial;
