import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import MPIContainer from 'components/screens/planet/MPIContainer'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import Crystal from 'components/reusables/Crystal'
import Sound from 'react-sound';
import aCrystalWasForged from 'assets/sounds/aCrystalWasForged.wav'
import getRevertMsg from 'utils/getRevertMsg'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

const defaultButtonText = 'Forge'

class TempleIndustrial extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      playSound: false,
      buttonText: defaultButtonText,
    }
  }

  forge = async () => {
    const { contracts, user, setDialogBox } = this.props

    this.setState({
      isLoading: true,
      buttonText: 'Waiting for signature...'
    })

    contracts.temple.forge({ from: user.address })
      .on('transactionHash', () => {
        this.setState({
          buttonText: 'Waiting for confirmation...'
        })
      })
      .on('receipt', () => {
        getPlayerInfo()
        this.getLatestCrystalURI()
      })
      .on('error', e => {
        setDialogBox(getRevertMsg(e.message), "bad")
        this.setState({
          isLoading: false,
          buttonText: 'Forge',
        })
      })
  }

  getLatestCrystalURI = async () => {
    const { contracts, user } = this.props
    let lastURI

    this.setState({
      isLoading: true
    })

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      const lastId = crystalIds[crystalIds.length - 1]
      lastURI = await contracts.temple.crystalURI(lastId, { from:user.address })
    } catch (e) {
      console.error(e)
    }

    this.setState({
      crystalURI: lastURI,
      isLoading: false,
      playSound: true,
      buttonText: defaultButtonText,
    }, () => {
      this.props.setDialogBox(
        <Fragment>
          You have forged a new crystal!
          {lastURI && <Crystal uri={lastURI} />}
        </Fragment>,
        'good',
      )
    })
  }

  render() {
    const { classes } = this.props
    const { isLoading, playSound, buttonText } = this.state

    return (
      <MPIContainer>
        <LaserFrame
          size="wide"
        >
          <div>Would like to forge a crystal?</div>
          <div>(Requires 10,000 kg of all 7 commodities)</div>
          <div className={classes.acceptDecline}>
              <Fragment>
                <LaserFrame
                  isButton={!isLoading}
                  flavour="good"
                  onClick={this.forge}
                >{buttonText}{isLoading && <Loader />}</LaserFrame>
              </Fragment>
          </div>
        </LaserFrame>
        <Sound
          url={aCrystalWasForged}
          playStatus={playSound && Sound.status.PLAYING}
          volume={25}
          onFinishedPlaying={() => this.setState({ playSound: false })}
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
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

TempleIndustrial = connect(mapStateToProps, mapDispatchToProps)(TempleIndustrial)
TempleIndustrial = injectSheet(styles)(TempleIndustrial)
export default TempleIndustrial;
