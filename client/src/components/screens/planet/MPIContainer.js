import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import CargoMeter from 'components/screens/planet/CargoMeter'
import Planet from 'components/reusables/Planet'

const styles = {
  MPIContainer: {
    minHeight: '100vh',
    width: 'fill-available',
    '& > div': {
      width: 'fill-available',
    },
    '& > div:first-child': {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      '& > div:first-child': {
        flex: 1,
      },
      '& > div:last-child': {
        flex: 0.2,
      },
    },
    '& > div:last-child': {
      flexDirection: 'row',
    },
  },
}

class MPIContainer extends Component {
  render() {
    const { classes, user, changeScreen, currentScreen, sideButtons, cargoPerCommodity } = this.props

    const navLinks = [
      { name: 'PlanetHome', label: '<< Back' },
      { name: 'CommodityMarket', label: 'Commodity Market' },
      { name: 'MineCommodities', label: 'Mine Commodities' },
      { name: 'ForgeCrystal', label: 'Forge Crystal' },
      { name: 'CrystalMarket', label: 'Crystal Market' },
      { name: 'ViewCrystals', label: 'View My Crystals' },
    ]

    return (
      <Fragment>
        <div className={classes.MPIContainer}>
          <div>
            {/* Top Row */}
            <div>
              {/* Top-left */}
              <CargoMeter current={user.currentCargo} max={user.maxCargo} cargoPerCommodity={user.cargoPerCommodity} />
              {/* Main screen content goes here */}
              <Fragment>{this.props.children}</Fragment>
            </div>
            <div >
              {/* Top-right */}
              <Laserframe
                flavour="status"
                size="wide"
                >Ξ{user.balance}</Laserframe>
              <div style={{ marginTop: '20%', width: '100%' }}>
                {sideButtons && sideButtons.map((sideButton, i) => (
                  <Laserframe
                    key={i}
                    isButton
                    onClick={sideButton.fn}
                    size="wide"
                  >{sideButton.label}</Laserframe>
                ))}
              </div>
            </div>
          </div>
          <div>
            {/* Bottom row */}
            {navLinks.map(link => (
              <Laserframe
                isButton
                onClick={() => changeScreen(link.name)}
              >{link.label}</Laserframe>
            ))}
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
    currentScreen: state.view.currentScreen,
    contracts: state.contracts,
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

MPIContainer = connect(mapStateToProps, mapDispatchToProps)(MPIContainer)
MPIContainer = injectSheet(styles)(MPIContainer)
export default MPIContainer;
