import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import {
  FaBalanceScale,
  FaChartBar,
  FaIndustry,
} from 'react-icons/fa';

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
    const { web3, user } = this.props
    console.log('web3', web3);

    const balance = await web3.eth.getBalance(user.address)
    this.props.setUserInfo({ balance: web3.utils.fromWei(balance) })
  }

  render() {
    const { classes, user } = this.props
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <div className={classes.container}>
        <div>
          <img src={planet.img} className={classes.planetImg} />
          <Rect
            onClick={this.props.goToTravelScreen}
            isButton
            type="good"
            shape="wide"
          >Travel (Leave {planet.name})</Rect>
          <Rect
            type="status"
            shape="wide"
          >Ξ{user.balance}</Rect>
        </div>
        <div>
          <div className={classes.top3}>
            <Rect
              onClick={this.props.goToPlanetMarketplacesScreen}
              isButton
              type="info"
              shape="square3"
            >
              <FaBalanceScale className={classes.icon} size={iconSize} />
              Marketplace
            </Rect>
            <Rect
              onClick={this.props.goToPlanetPricesScreen}
              isButton
              type="info"
              shape="square3"
            >
              <FaChartBar className={classes.icon}size={iconSize} />
              Commodity Prices
            </Rect>
            <Rect
              onClick={this.props.goToPlanetMarketplacesScreen}
              isButton
              type="info"
              shape="square3"
            >
              <FaIndustry className={classes.icon} size={iconSize} />
              Industrial Operations
            </Rect>
          </div>
        </div>
        <div>
          <Rect
            shape="wide"
          >Fuel</Rect>
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

    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    goToPlanetMarketplacesScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetMarketplaces' }),
    goToPlanetPricesScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetPrices' }),
    goToPlanetIndustrialScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIndustrial' }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
