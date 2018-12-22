import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import MPIContainer from 'components/screens/planet/MPIContainer'
import sha256 from 'js-sha256'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import MiningPad from 'components/screens/planet/MiningPad'
import Sound from 'react-sound'
import miningSuccess from 'assets/sounds/miningSuccess.wav'
import receivedSomething from 'assets/sounds/receivedSomething.wav'
import mining from 'assets/sounds/mining.wav'
import miningFail from 'assets/sounds/miningFail.wav'
import getErrorMsg from 'utils/getErrorMsg'
import Commodity from 'components/reusables/Commodity'
import ellipAddr from 'utils/ellipAddr'
import Measure from 'react-measure'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

const AREA_SIZE = 768

function checkIfHashUnderTarget(hash, target) {
  hash = parseInt('0x' + String(hash), 16)
  target = parseInt(target, 16)
  return hash < target
}

class MineCommodities extends Component {
  state = {}

  componentDidMount = () => {
    this.getMiningData()
  }

  componentDidUpdate = prevProps => {
    const { setIndustrialState, setDialogBox } = this.props
    const { isMining, nonce, areaStart, areaEnd, areasMined, commodityName } = this.props.industrial

    // When mining is started... (an area is clicked)
    if (!prevProps.industrial.isMining && isMining) {
      setIndustrialState({
        miningJustFailed: false,
        playMiningSound: true,
      })
      window.requestAnimationFrame(this.step)
    }

    // When finished mining an area (i.e., mining has failed in the area)...
    if (prevProps.industrial.nonce !== nonce && nonce >= areaEnd) {
      setIndustrialState({
        nonce: undefined,
        isMining: false,
        // Array that holds indexes of areas that have been mined
        areasMined: areasMined.concat([areaStart / AREA_SIZE]),
        miningJustFailed: true,
        areaStart: undefined,
        areaEnd: undefined,
        playMiningSound: false,
        playMiningFailSound: true,
      })
      // setDialogBox(`No ${commodityName} was found in that area, \nclick to continue.`)
    }
  }

  getMiningData = async () => new Promise(async (resolve, reject) => {
    const { user, contracts, setIndustrialState } = this.props
    let commodity

    try {
      commodity = await contracts.commodityReg.getMiningData(user.currentPlanet.id, { from: user.address })
    } catch (e) {
      return reject(e)
    }

    setIndustrialState({
      miningReward: commodity.miningReward,
      miningTarget: commodity.miningTarget,
      prevMiningHash: commodity.prevMiningHash,
      uri: commodity.uri,
    })

    resolve()
  })

  step = () => {
    const { user, setIndustrialState } = this.props
    const { miningTarget, prevMiningHash, nonce, isMining } = this.props.industrial


    if (typeof nonce === 'number') {
      const hash = sha256(
        nonce.toString() +
        user.currentPlanet.id.toString() +
        prevMiningHash +
        user.address.substring(2).toLowerCase()
      )

      setIndustrialState({ hash })

      const validProofFound = checkIfHashUnderTarget(hash, miningTarget)

      if (validProofFound) {
        return setIndustrialState({
          playSuccessSound: true,
          playMiningSound: false,
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
    this.props.setIndustrialState({
      isMining: false,
      playMiningSound: false,
    })
  }

  submitProof = async () => {
    let { user, contracts, setIndustrialState, setDialogBox } = this.props
    const { nonce } = this.props.industrial

    setIndustrialState({ isSubmitting: true })

    try {
      await contracts.commodityReg.submitPOW(String(nonce), { from: user.address })
    } catch (e) {
      setIndustrialState({
        isMining: false,
        hasValidProof: false,
        hash: '',
        nonce: 0,
        isSubmitting: false,
      })
      return setDialogBox(getErrorMsg(e.toString()), 'bad')
    }

    // Refresh data
    this.getMiningData()
    getPlayerInfo()


    setIndustrialState({
      isMining: false,
      hasValidProof: false,
      hash: '',
      nonce: 0,
      isSubmitting: false,
    })
  }

  render() {
    const { classes, industrial, setIndustrialState, user } = this.props
    const {
      isMining,
      hash,
      hasValidProof,
      isSubmitting,
      areaStart,
      areaEnd,
      playReceivedSound,
      playSuccessSound,
      playMiningFailSound,
      playMiningSound,
      miningReward,
      miningJustFailed,
    } = industrial
    const { offset } = this.state

    const statusBarText = (() => {
      if (areaStart && areaEnd) {
        return `Area ${areaStart} to ${areaEnd}`
      } else if (miningJustFailed) {
        return `No commodity was found in that area`
      }  else {
        return 'Waiting...'
      }
    })()

    return (
      <MPIContainer>
        <Laserframe
          size="wide"
        >
          {!isMining && !hasValidProof &&
            <Fragment>
              <Measure
                offset
                onResize={contentRect => {
                  this.setState({
                    offset: contentRect.offset,
                  })
                }}
              >
                {({ measureRef }) => (
                  <div ref={measureRef}>
                    <div>
                      Click an area to start mining for {ellipAddr(user.currentPlanet.uri)}
                      {offset && <Commodity
                        uri={user.currentPlanet.uri}
                        x={offset.left + offset.width + (offset.width * 0.1)}
                        y={offset.top + (offset.height * 0.5)}
                      />}
                    </div>
                    <div>
                      ({miningReward ? miningReward.toString() : '0'} kg will be received after a succcesful mining operation)
                    </div>
                  </div>
                )}
              </Measure>
              <MiningPad areaSize={AREA_SIZE} />
              <Laserframe
                flavour={miningJustFailed ? 'bad' : 'status'}
              >
                {statusBarText}
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
          volume={6}
          onFinishedPlaying={() => setIndustrialState({ playSuccessSound: false })}
        />
        <Sound
          url={receivedSomething}
          playStatus={playReceivedSound && Sound.status.PLAYING}
          volume={10}
          onFinishedPlaying={() => setIndustrialState({ playReceivedSound: false })}
        />
        <Sound
          url={mining}
          playStatus={playMiningSound && Sound.status.PLAYING}
          volume={15}
          loop={true}
          onFinishedPlaying={() => setIndustrialState({ playMiningSound: false })}
        />
        <Sound
          url={miningFail}
          playStatus={playMiningFailSound && Sound.status.PLAYING}
          volume={10}
          onFinishedPlaying={() => setIndustrialState({ playMiningFailSound: false })}
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

MineCommodities = connect(mapStateToProps, mapDispatchToProps)(MineCommodities)
MineCommodities = injectSheet(styles)(MineCommodities)
export default MineCommodities;
