import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import LaserFrame from 'components/reusables/LaserFrame'
import CargoMeter from 'components/screens/planet/CargoMeter'

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

    let navLinks
    if (user.currentPlanet != 255) {
      navLinks = [
        { name: 'PlanetHome', label: '<< Back' },
        { name: 'PlanetMarketplace', label: 'Marketplace' },
        { name: 'PlanetPrices', label: 'Prices elsewhere' },
        { name: 'PlanetIndustrial', label: 'Industrial operations' },
      ]
    } else {
      navLinks = [
        { name: 'PlanetHome', label: '<< Back' },
        { name: 'TempleMarketplace', label: 'Crystal marketplace' },
        { name: 'PlanetPrices', label: 'Prices elsewhere' },
        { name: 'TempleIndustrial', label: 'Forge Crystals' },
        { name: 'TempleViewCrystals', label: 'View My Crystals' },
      ]
    }

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
              <LaserFrame
                flavour="status"
                size="wide"
                >Ξ{user.balance}</LaserFrame>
              <div style={{ marginTop: '20%', width: '100%' }}>
                {sideButtons && sideButtons.map((sideButton, i) => (
                  <LaserFrame
                    key={i}
                    isButton
                    onClick={sideButton.fn}
                    size="wide"
                  >{sideButton.label}</LaserFrame>
                ))}
              </div>
            </div>
          </div>
          <div>
            {/* Bottom row */}
            {navLinks.map((link, i) =>
              <LaserFrame
                key={i}
                isButton
                active={currentScreen === link.name}
                size="wide4"
                onClick={() => changeScreen(link.name)}
              >{link.label}</LaserFrame>
            )}
          </div>
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
