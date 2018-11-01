import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import FuelMeter from 'components/screens/planet/FuelMeter'
import planets from 'utils/planets'
import {
  FaBalanceScale,
  FaChartBar,
  FaIndustry,
} from 'react-icons/fa';
import getPlayerInfo from 'utils/getPlayerInfo'

const styles = {
  container: {
    display: 'grid',
    height: '100%',
    width: 'fill-available',
    gridTemplateColumns: '1.25fr 2.5fr 0.75fr',
    gridTemplateRows: '1fr',
    gridGap: '1px 1px',
    gridTemplateAreas: ". . .",
    alignItems: 'start',
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
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <div className={classes.container}>
        <div>
          <img src={planet.img} className={classes.planetImg} />
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
        <div>
          <div className={classes.top3}>
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
          </div>
        </div>
        <div>
          <FuelMeter
            currentFuel={user.currentFuel}
            maxFuel={user.maxFuel}
          />
        </div>
      </div>
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
