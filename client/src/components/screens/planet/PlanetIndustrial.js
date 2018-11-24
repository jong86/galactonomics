import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import sha256 from 'js-sha256'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'

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
  constructor() {
    super()
    this.state = {
      isMining: false,
      hash: '',
      isSubmitting: false,
      nonce: 3500,
    }
  }

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
    this.setState({ isMining: true })
    window.requestAnimationFrame(this.step)
  }

  step = () => {
    const { user } = this.props
    const { nonce } = this.state
    const { miningTarget, prevMiningHash } = this.props.industrial

    const hash = sha256(
      nonce.toString() +
      user.currentPlanet.toString() +
      prevMiningHash +
      user.address.substring(2).toLowerCase()
    )
    this.setState({ hash })

    console.log('nonce', nonce);

    const validProofFound = checkIfHashUnderTarget(hash, miningTarget)

    if (validProofFound)
      return this.setState({
        isMining: false,
        hasValidProof: true,
      })

    this.setState({ nonce: nonce + 1 })

    if (this.state.isMining)
      window.requestAnimationFrame(this.step)
  }

  stopMining = () => {
    this.setState({ isMining: false })
  }

  submitProof = async () => {
    const { user, contracts, setIndustrialState } = this.props
    const { nonce } = this.state

    try {
      await contracts.gia.submitProofOfWork(String(nonce), { from: user.address })
    } catch (e) {
      console.error(e)
    }

    getPlayerInfo()
    this.getCommodity()
    this.setState({ isMining: false, hasValidProof: false, hash: '', nonce: 0, })
  }

  render() {
    const { classes, user, web3, industrial } = this.props
    const {
      miningReward,
      miningTarget,
      commodityName,
      commoditySymbol,
    } = industrial
    const planet = planets.find(planet => planet.id == user.currentPlanet)
    const { isMining, hash, hasValidProof, isSubmitting } = this.state

    return (
      <MPIContainer>
          <Rect
            size="wide"
          >
            {!isMining && !hasValidProof &&
              <Rect
                isButton
                onClick={this.startMining}
              >
                Mine
              </Rect>
            }
            {isMining &&
              <Fragment>
                <div>
                  Mining...
                </div>
                <Rect type='bad'>
                  { hash }
                </Rect>
                <Rect
                  isButton
                  onClick={this.stopMining}
                >
                  Stop mining
                </Rect>
              </Fragment>
            }
            {!isMining && hasValidProof &&
              <Fragment>
              <div>
                Valid proof of work hash found!
              </div>
              <Rect type='good'>
                { hash }
              </Rect>
              <Rect
                isButton
                onClick={this.submitProof}
              >
                {!isSubmitting ? 'Submit proof of work' : <Loader />}
              </Rect>
            </Fragment>
            }
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

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
