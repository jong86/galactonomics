import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

class TempleIndustrial extends Component {
  constructor() {
    super()
    this.state = {
      isForging: false,
    }
  }

  forge = async () => {
    const { contracts, user } = this.props
    this.setState({ isForging: true })

    try {
      await contracts.temple.forge({ from: user.address })
    } catch (e) {
      console.error(e)
    }

    await getPlayerInfo()

    this.setState({ isForging: false })
  }

  render() {
    const { classes, user, web3 } = this.props
    const { isForging } = this.state
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <MPIContainer>
        <LaserFrame
          size="wide"
        >
          <div>Would like to forge a crystal?</div>
          <div>(Requires 10,000 kg of all 7 commodities)</div>
          <div className={classes.acceptDecline}>
            {isForging ?
              <Loader />
              :
              <Fragment>
                <LaserFrame
                  isButton
                  type="bad"
                >Decline</LaserFrame>
                <LaserFrame
                  isButton
                  type="good"
                  onClick={this.forge}
                >Accept</LaserFrame>
              </Fragment>
            }
          </div>
        </LaserFrame>
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
