import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
<<<<<<< HEAD
=======
import planets from 'utils/planets'
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8
import MPIContainer from 'components/screens/planet/MPIContainer'
import sha256 from 'js-sha256'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import MiningPad from 'components/screens/planet/MiningPad'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

<<<<<<< HEAD
const AREA_SIZE = 1024

=======
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8
function checkIfHashUnderTarget(hash, target) {
  hash = parseInt('0x' + String(hash), 16)
  target = parseInt(target, 16)
  return hash < target
}

class PlanetIndustrial extends Component {
  componentDidMount = () => {
    this.getCommodity()
  }

  componentDidUpdate = prevProps => {
<<<<<<< HEAD
    const { setIndustrialState, setAlertBoxContent } = this.props
    const { isMining, nonce, areaStart, areaEnd, areasMined, commodityName } = this.props.industrial
=======
    const { setIndustrialState } = this.props
    const { isMining, nonce, areaStart, areaEnd } = this.props.industrial
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8

    // When mining is started... (an area is clicked)
    if (!prevProps.industrial.isMining && isMining) {
      window.requestAnimationFrame(this.step)
    }

    // When finished mining an area...
    if (prevProps.industrial.nonce !== nonce && nonce >= areaEnd) {
      setIndustrialState({
        nonce: undefined,
        isMining: false,
<<<<<<< HEAD
        // Array that holds indexes of areas that have been mined
        areasMined: areasMined.concat([areaStart / AREA_SIZE]),
      })
      setAlertBoxContent(`No ${commodityName} was found in that area, \nclick to continue.`)
=======
      })
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8
    }
  }

  getCommodity = async () => {
    const { user, contracts, setIndustrialState } = this.props
    let commodity

    try {
      commodity = await contracts.commodities.get(user.currentPlanet, { from: user.address })
    } catch (e) {
      return console.error(e)
    }

    setIndustrialState({
      commodityName: commodity.name,
      commoditySymbol: commodity.symbol,
      miningReward: commodity.miningReward.toString(),
      miningTarget: commodity.miningTarget.toString(),
      timesMined: commodity.timesMined.toString(),
      prevMiningHash: commodity.prevMiningHash,
    })
  }

  step = () => {
    const { user, setIndustrialState } = this.props
    const { miningTarget, prevMiningHash, nonce, isMining } = this.props.industrial

    if (typeof nonce === 'number') {
      const hash = sha256(
        nonce.toString() +
        user.currentPlanet.toString() +
        prevMiningHash +
        user.address.substring(2).toLowerCase()
      )
      setIndustrialState({ hash })

      const validProofFound = checkIfHashUnderTarget(hash, miningTarget)

      if (validProofFound)
        return setIndustrialState({
          isMining: false,
          hasValidProof: true,
        })

        setIndustrialState({ nonce: nonce + 1 })

      if (isMining)
        window.requestAnimationFrame(this.step)
    }
  }

  stopMining = () => {
    this.props.setIndustrialState({ isMining: false })
  }

  submitProof = async () => {
    const { user, contracts, setIndustrialState } = this.props
    const { nonce } = this.props.industrial

    try {
      await contracts.gia.submitProofOfWork(String(nonce), { from: user.address })
    } catch (e) {
      console.error(e)
    }

    getPlayerInfo()
    this.getCommodity()
    setIndustrialState({ isMining: false, hasValidProof: false, hash: '', nonce: 0, })
  }

  render() {
    const { classes, user, industrial } = this.props
    const {
      isMining,
      hash,
      hasValidProof,
      isSubmitting,
<<<<<<< HEAD
      commodityName,
=======
      miningReward,
      miningTarget,
      commodityName,
      commoditySymbol,
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8
      areaStart,
      areaEnd,
    } = industrial

    return (
      <MPIContainer>
          <LaserFrame
            size="wide"
          >
            {!isMining && !hasValidProof &&
              <Fragment>
<<<<<<< HEAD
                Click an area to start mining for {commodityName}...
                <MiningPad areaSize={AREA_SIZE} />
=======
                Click an area to start mining...
                <MiningPad />
>>>>>>> dcad89e8ac1e39da820e27829a687e98ea4c21e8
                <LaserFrame
                  type='status'
                >
                  {areaStart && areaEnd ? `Area ${areaStart} to ${areaEnd}` : 'Waiting...'}
                </LaserFrame>
              </Fragment>
            }
            {isMining &&
              <Fragment>
                <div>
                  Mining in area {areaStart} to {areaEnd}...
                </div>
                <LaserFrame type='bad'>
                  { hash }
                </LaserFrame>
                <LaserFrame
                  isButton
                  onClick={this.stopMining}
                >
                  Stop mining
                </LaserFrame>
              </Fragment>
            }
            {!isMining && hasValidProof &&
              <Fragment>
              <div>
                Valid proof of work hash found!
              </div>
              <LaserFrame type='good'>
                { hash }
              </LaserFrame>
              <LaserFrame
                isButton
                onClick={this.submitProof}
              >
                {!isSubmitting ? 'Submit proof of work' : <Loader />}
              </LaserFrame>
            </Fragment>
            }
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

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
