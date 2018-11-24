import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
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
    '@global': {
      svg: {
        margin: '16px',
      }
    }
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
            <LaserFrame
              onClick={() => changeScreen('Travel')}
              isButton
              type="good"
              size="wide"
            >Travel (Leave {planet.name})</LaserFrame>
            <LaserFrame
              type="status"
              size="wide"
            >Ξ{user.balance}</LaserFrame>
          </div>
          <div className={classes.top3}>
            {planet.id == 255 ?
              <Fragment>
                <LaserFrame
                  onClick={() => changeScreen('TempleMarketplace')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <MdBusinessCenter size={iconSize} />
                  Crystal Marketplace
                </LaserFrame>
                <LaserFrame
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaChartBar size={iconSize} />
                  Commodity Prices
                </LaserFrame>
                <LaserFrame
                  onClick={() => changeScreen('TempleIndustrial')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaHammer size={iconSize} />
                  Forge Byzantian Crystals
                </LaserFrame>
                <LaserFrame
                  onClick={() => changeScreen('ViewCrystals')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaEthereum size={iconSize} />
                  View My Crystals
                </LaserFrame>
              </Fragment>
              :
              <Fragment>
                <LaserFrame
                  onClick={() => changeScreen('PlanetMarketplace')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaBalanceScale size={iconSize} />
                  Marketplace
                </LaserFrame>
                <LaserFrame
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaChartBar className={classes.icon}size={iconSize} />
                  Commodity Prices
                </LaserFrame>
                <LaserFrame
                  onClick={() => changeScreen('PlanetIndustrial')}
                  isButton
                  type="info"
                  size="wide3"
                >
                  <FaIndustry size={iconSize} />
                  Industrial Operations
                </LaserFrame>
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
