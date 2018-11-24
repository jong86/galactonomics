import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import planets from 'utils/planets'
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

function checkIfHashUnderTarget(hash, target) {
  hash = parseInt('0x' + String(hash), 16)
  target = parseInt(target, 16)
  return hash < target
}

class PlanetIndustrial extends Component {
  componentDidMount = () => {
    this.getCommodity()
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

  startMining = () => {
    this.props.setIndustrialState({ isMining: true })
    window.requestAnimationFrame(this.step)
  }

  step = () => {
    const { user, setIndustrialState } = this.props
    const { miningTarget, prevMiningHash, nonce, isMining } = this.props.industrial

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
    const { classes, user, web3, industrial } = this.props
    const {
      isMining,
      hash,
      hasValidProof,
      isSubmitting,
      miningReward,
      miningTarget,
      commodityName,
      commoditySymbol,
    } = industrial
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <MPIContainer>
          <LaserFrame
            size="wide"
          >
            {!isMining && !hasValidProof &&
              <Fragment>
                <MiningPad />
                <LaserFrame
                  isButton
                  onClick={this.startMining}
                >
                  Mine
                </LaserFrame>
              </Fragment>
            }
            {isMining &&
              <Fragment>
                <div>
                  Mining...
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
