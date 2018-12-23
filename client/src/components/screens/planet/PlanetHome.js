import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import {
  FaBalanceScale,
  FaChartBar,
  FaIndustry,
  FaHammer,
  FaEthereum,
} from 'react-icons/fa';
import { MdBusinessCenter, MdDirectionsWalk } from 'react-icons/md'
import refreshCommoditiesOwned from 'utils/refreshCommoditiesOwned'
import Planet from 'components/reusables/Planet'

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
    refreshCommoditiesOwned()
  }

  render() {
    const { classes, user, changeScreen } = this.props
    const iconSize = 48

    return (
      <Fragment>
        <div className={classes.PlanetHome}>
          <div>
            <Laserframe
              onClick={() => changeScreen('Travel')}
              isButton
              flavour="good"
              size="wide"
            >Travel (Leave {user.currentPlanet.id})</Laserframe>
            <Laserframe
              flavour="status"
              size="wide"
            >Ξ{user.balance}</Laserframe>
          </div>
          <div className={classes.top3}>
            {/* Regular planet links: */}
            <Laserframe
              onClick={() => changeScreen('MineCommodities')}
              isButton
              flavour="info"
              size="wide"
            >
              <FaIndustry size={iconSize} />
              Mine Commodities
            </Laserframe>
            <Laserframe
              onClick={() => changeScreen('CommodityMarket')}
              isButton
              flavour="info"
              size="wide"
            >
              <FaBalanceScale size={iconSize} />
              Commodity Market
            </Laserframe>
            <Laserframe
              onClick={() => changeScreen('ViewCargo')}
              isButton
              flavour="info"
              size="wide"
            >
              <FaBalanceScale size={iconSize} />
              View My Cargo
            </Laserframe>
            <Laserframe
              onClick={() => changeScreen('CrystalMarket')}
              isButton
              flavour="special"
              size="wide"
            >
              <MdBusinessCenter size={iconSize} />
              Crystal Market
            </Laserframe>
            <Laserframe
              onClick={() => changeScreen('ForgeCrystal')}
              isButton
              flavour="special"
              size="wide"
            >
              <FaHammer size={iconSize} />
              Forge Crystal
            </Laserframe>
            <Laserframe
              onClick={() => changeScreen('ViewCrystals')}
              isButton
              flavour="special"
              size="wide"
            >
              <FaEthereum size={iconSize} />
              View My Crystals
            </Laserframe>
          </div>
          <Planet
            uri={user.currentPlanet.uri}
            x={window.innerWidth / 2}
            y={window.innerHeight}
            radius={320}
          />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    web3: state.web3,
    travel: state.travel,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
