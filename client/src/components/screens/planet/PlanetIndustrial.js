import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import MPIContainer from 'components/screens/planet/MPIContainer'
import sha256 from 'js-sha256'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import MiningPad from 'components/screens/planet/MiningPad'
import Sound from 'react-sound';
import miningSuccess from 'assets/sounds/miningSuccess.wav'
import receivedSomething from 'assets/sounds/receivedSomething.wav'
import { debug } from "util";

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

const AREA_SIZE = 1024

function checkIfHashUnderTarget(hash, target) {
  hash = parseInt('0x' + String(hash), 16)
  target = parseInt(target, 16)
  return hash < target
}

class PlanetIndustrial extends Component {
  componentDidMount = () => {
    this.getCommodity()
    this.getMiningData()
  }

  componentDidUpdate = prevProps => {
    const { setIndustrialState, setDialogBox } = this.props
    const { isMining, nonce, areaStart, areaEnd, areasMined, commodityName } = this.props.industrial

    // When mining is started... (an area is clicked)
    if (!prevProps.industrial.isMining && isMining) {
      window.requestAnimationFrame(this.step)
    }

    // When finished mining an area...
    if (prevProps.industrial.nonce !== nonce && nonce >= areaEnd) {
      setIndustrialState({
        nonce: undefined,
        isMining: false,
        // Array that holds indexes of areas that have been mined
        areasMined: areasMined.concat([areaStart / AREA_SIZE]),
      })
      setDialogBox(`No ${commodityName} was found in that area, \nclick to continue.`)
    }
  }

  getCommodity = async () => new Promise(async (resolve, reject) => {
    const { user, contracts, setIndustrialState } = this.props
    let commodity

    try {
      commodity = await contracts.commodities.get(user.currentPlanet, { from: user.address })
    } catch (e) {
      return reject(e)
    }

    setIndustrialState({
      commodityName: commodity.name,
      commoditySymbol: commodity.symbol,
    })

    resolve()
  })

  getMiningData = async () => new Promise(async (resolve, reject) => {
    const { user, contracts, setIndustrialState } = this.props
    let miningReward, miningTarget, prevMiningHash

    try {
      const response = await contracts.gia.getMiningData({ from: user.address })
      miningReward = response[0]
      miningTarget = response[1]
      prevMiningHash = response[2]
    } catch (e) {
      return reject(e)
    }

    setIndustrialState({
      miningReward, miningTarget, prevMiningHash
    })

    resolve()
  })

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

      if (validProofFound) {
        console.log(hash, miningTarget)

        return setIndustrialState({
          playSuccessSound: true,
          isMining: false,
          hasValidProof: true,
        })
      }

      setIndustrialState({ nonce: nonce + 1 })

      if (isMining)
        window.requestAnimationFrame(this.step)
    }
  }

  stopMining = () => {
    this.props.setIndustrialState({ isMining: false })
  }

  submitProof = async () => {
    let { user, contracts, setIndustrialState, setDialogBox } = this.props
    const { nonce } = this.props.industrial

    setIndustrialState({ isSubmitting: true })

    try {
      await contracts.gia.submitProofOfWork(String(nonce), { from: user.address })
    } catch (e) {
      console.error(e)
    }

    const oldQuant = Number(user.cargoPerCommodity[user.currentPlanet].amount)
    await getPlayerInfo()
    user = this.props.user
    const newQuant = Number(user.cargoPerCommodity[user.currentPlanet].amount)

    // Refresh data
    await this.getCommodity()
    await this.getMiningData()

    setIndustrialState({
      isMining: false,
      hasValidProof: false,
      hash: '',
      nonce: 0,
      isSubmitting: false,
    })

    if (newQuant > oldQuant) {
      setIndustrialState({ playReceivedSound: true })
    } else {
      setDialogBox('Sorry, but your proof-of-work was not accepted', 'bad')
    }
  }

  render() {
    const { classes, industrial, setIndustrialState } = this.props
    const {
      isMining,
      hash,
      hasValidProof,
      isSubmitting,
      commodityName,
      areaStart,
      areaEnd,
      playReceivedSound,
      playSuccessSound,
    } = industrial

    return (
      <MPIContainer>
          <Laserframe
            size="wide"
          >
            {!isMining && !hasValidProof &&
              <Fragment>
                Click an area to start mining for {commodityName}...
                <MiningPad areaSize={AREA_SIZE} />
                <Laserframe
                  flavour='status'
                >
                  {areaStart && areaEnd ? `Area ${areaStart} to ${areaEnd}` : 'Waiting...'}
                </Laserframe>
              </Fragment>
            }
            {isMining &&
              <Fragment>
                <div>
                  Mining in area {areaStart} to {areaEnd}...
                </div>
                <Laserframe flavour='bad'>
                  { hash }
                </Laserframe>
                <Laserframe
                  isButton
                  onClick={this.stopMining}
                >
                  Stop mining
                </Laserframe>
              </Fragment>
            }
            {!isMining && hasValidProof &&
              <Fragment>
                <div>
                  Valid proof of work hash found!
                </div>
                <Laserframe flavour='good'>
                  { hash }
                </Laserframe>
                <Laserframe
                  isButton
                  onClick={this.submitProof}
                >
                  {!isSubmitting ? 'Submit proof of work' : <Fragment>Waiting for validation...<Loader /></Fragment>}
                </Laserframe>
              </Fragment>
            }
          </Laserframe>
          <Sound
            url={miningSuccess}
            playStatus={playSuccessSound && Sound.status.PLAYING}
            volume={10}
            onFinishedPlaying={() => setIndustrialState({ playSuccessSound: false })}
          />
          <Sound
            url={receivedSomething}
            playStatus={playReceivedSound && Sound.status.PLAYING}
            volume={25}
            onFinishedPlaying={() => setIndustrialState({ playReceivedSound: false })}
          />
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
    eth: state.eth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

PlanetIndustrial = connect(mapStateToProps, mapDispatchToProps)(PlanetIndustrial)
PlanetIndustrial = injectSheet(styles)(PlanetIndustrial)
export default PlanetIndustrial;
