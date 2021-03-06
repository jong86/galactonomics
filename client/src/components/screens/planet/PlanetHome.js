import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
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
            <Laserframe
              onClick={() => changeScreen('Travel')}
              isButton
              flavour="good"
              size="wide"
            >Travel (Leave {planet.name})</Laserframe>
            <Laserframe
              flavour="status"
              size="wide"
            >Ξ{user.balance}</Laserframe>
          </div>
          <div className={classes.top3}>
            {planet.id == 255 ?
              <Fragment>
                <Laserframe
                  onClick={() => changeScreen('TempleMarketplace')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <MdBusinessCenter size={iconSize} />
                  Crystal Marketplace
                </Laserframe>
                <Laserframe
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaChartBar size={iconSize} />
                  Commodity Prices
                </Laserframe>
                <Laserframe
                  onClick={() => changeScreen('TempleIndustrial')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaHammer size={iconSize} />
                  Forge Crystals
                </Laserframe>
                <Laserframe
                  onClick={() => changeScreen('TempleViewCrystals')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaEthereum size={iconSize} />
                  View My Crystals
                </Laserframe>
              </Fragment>
              :
              <Fragment>
                <Laserframe
                  onClick={() => changeScreen('PlanetMarketplace')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaBalanceScale size={iconSize} />
                  Marketplace
                </Laserframe>
                <Laserframe
                  onClick={() => changeScreen('PlanetPrices')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaChartBar className={classes.icon}size={iconSize} />
                  Commodity Prices
                </Laserframe>
                <Laserframe
                  onClick={() => changeScreen('PlanetIndustrial')}
                  isButton
                  flavour="info"
                  size="wide3"
                >
                  <FaIndustry size={iconSize} />
                  Industrial Operations
                </Laserframe>
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
