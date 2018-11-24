import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import MPIContainer from 'components/screens/planet/MPIContainer'
import sha256 from 'js-sha256'

const styles = {
  acceptDecline: {
    flexDirection: 'row',
  }
}

let nonce = 0

class PlanetIndustrial extends Component {
  constructor() {
    super()
    this.state = {
      isMining: false,
      hash: '',
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
      miningAmount: commodity.miningAmount.toString(),
      miningTarget: commodity.miningTarget.toString(),
      commodityName: commodity.name,
      commoditySymbol: commodity.symbol,
    })
  }

  startMining = () => {
    this.setState({ isMining: true })
    window.requestAnimationFrame(this.step)
  }

  step = () => {
    const hash = sha256(String(nonce))
    this.setState({ hash })

    nonce++

    if (this.state.isMining)
      window.requestAnimationFrame(this.step)
  }

  stopMining = () => {
    this.setState({ isMining: false })
  }

  render() {
    const { classes, user, web3, industrial } = this.props
    const {
      miningAmount,
      miningTarget,
      commodityName,
      commoditySymbol,
    } = industrial
    const planet = planets.find(planet => planet.id == user.currentPlanet)
    const { isMining, hash } = this.state

    return (
      <MPIContainer>
          <Rect
            size="wide"
          >
            {!isMining ?
              <Rect
                isButton
                onClick={this.startMining}
              >
                Mine
              </Rect>
              :
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
