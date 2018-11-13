import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import FuelMeter from 'components/screens/planet/FuelMeter'
import planets from 'utils/planets'
import {
  FaBalanceScale,
  FaChartBar,
  FaIndustry,
  FaHammer,
  FaEthereum,
} from 'react-icons/fa';
import { MdBusinessCenter } from 'react-icons/md'
import getPlayerInfo from 'utils/getPlayerInfo'


const styles = {
  PlanetHome: {
    width: 'fill-available',
    flexDirection: 'row',

    '& > div': {
      height: 'fill-available',
      justifyContent: 'flex-start',
    },

    '& > div:nth-child(1)': {
      width: '20%',
    },

    '& > div:nth-child(2)': {
      width: '65%',
    },

    '& > div:nth-child(3)': {
      width: '15%',
    },
  },
  planetImg: {
    width: '60%',
    padding: '12%',
  },
  top3: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    width: 'fill-available',
  },
  icon: {
    margin: '16px',
  },
}

class PlanetHome extends Component {
  state = {};

  componentDidMount = async () => {
    getPlayerInfo()
  }

  render() {
    const { classes, user, changeScreen } = this.props
    const planet = planets.find(planet => planet.id == user.currentPlanet)
    const iconSize = 96

    return (
      <Fragment>
        <div className={classes.PlanetHome}>
          <div>
            <Rect
              onClick={() => changeScreen('Travel')}
              isButton
              type="good"
              size="wide"
              >Travel (Leave {planet.name})</Rect>
            <Rect
              type="status"
              size="wide"
              >Ξ{user.balance}</Rect>
          </div>
          <div className={classes.top3}>
            {planet.id == 255 ?
              <Fragment>
                <Rect
                  onClick={() => changeScreen('TempleMarketplace')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <MdBusinessCenter className={classes.icon} size={iconSize} />
                  Crystal Marketplace
                </Rect>
                <Rect
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaChartBar className={classes.icon}size={iconSize} />
                  Commodity Prices
                </Rect>
                <Rect
                  onClick={() => changeScreen('TempleIndustrial')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaHammer className={classes.icon} size={iconSize} />
                  Forge Byzantian Crystals
                </Rect>
                <Rect
                  onClick={() => changeScreen('ViewCrystals')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaEthereum className={classes.icon} size={iconSize} />
                  View My Crystals
                </Rect>
              </Fragment>
              :
              <Fragment>
                <Rect
                  onClick={() => changeScreen('PlanetMarketplace')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaBalanceScale className={classes.icon} size={iconSize} />
                  Marketplace
                </Rect>
                <Rect
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaChartBar className={classes.icon}size={iconSize} />
                  Commodity Prices
                </Rect>
                <Rect
                  onClick={() => changeScreen('PlanetIndustrial')}
                  isButton
                  type="info"
                  size="wide3"
                  >
                  <FaIndustry className={classes.icon} size={iconSize} />
                  Industrial Operations
                </Rect>
              </Fragment>
            }
          </div>
          <div>
            <FuelMeter
              currentFuel={user.currentFuel}
              maxFuel={user.maxFuel}
              />
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setUserInfo: info => dispatch({ type: 'SET_USER_INFO', info }),
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
