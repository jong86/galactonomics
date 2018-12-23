import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import MPIContainer from 'components/screens/planet/MPIContainer'
import refreshCommoditiesOwned from 'utils/refreshCommoditiesOwned'
import Loader from 'components/reusables/Loader'
import Crystal from 'components/reusables/Crystal'
import Sound from 'react-sound';
import aCrystalWasForged from 'assets/sounds/aCrystalWasForged.wav'
import getErrorMsg from 'utils/getErrorMsg'

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

    contracts.crystalReg.forge({ from: user.address })
      .on('transactionHash', () => {
        this.setState({
          buttonText: 'Waiting for confirmation...'
        })
      })
      .on('receipt', () => {
        refreshCommoditiesOwned()
        this.getLatestCrystalURI()
      })
      .on('error', e => {
        setDialogBox(getErrorMsg(e.message), "bad")
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
      const crystalIds = await contracts.crystalReg.crystalsOfOwner(user.address, { from: user.address })
      const lastId = crystalIds[crystalIds.length - 1]
      lastURI = await contracts.crystalReg.crystalURI(lastId, { from:user.address })
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
        <Laserframe
          size="wide"
        >
          <div>Would like to forge a crystal?</div>
          <div>(Requires 10,000 kg of all 7 commodities)</div>
          <div className={classes.acceptDecline}>
              <Fragment>
                <Laserframe
                  isButton={!isLoading}
                  flavour="good"
                  onClick={this.forge}
                >{buttonText}{isLoading && <Loader />}</Laserframe>
              </Fragment>
          </div>
        </Laserframe>
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
