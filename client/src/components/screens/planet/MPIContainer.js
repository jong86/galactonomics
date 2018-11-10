import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import planets from 'utils/planets'
import CargoMeter from 'components/screens/planet/CargoMeter'
import PlanetBackground from "./PlanetBackground"

const styles = {
  outer: {
    height: '100%',
    width: 'fill-available',
    '& > div': {
      width: 'fill-available',
    },
    '& > div:first-child': {
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

const navLinks = [
  { name: 'PlanetHome', label: '<< Back' },
  { name: 'PlanetMarketplace', label: 'Marketplace' },
  { name: 'PlanetPrices', label: 'Prices elsewhere' },
  { name: 'PlanetIndustrial', label: 'Industrial operations' },
]

class MPIContainer extends Component {
  state = {};

  render() {
    const { classes, user, changeScreen, currentScreen, sideButtons } = this.props
    const planet = planets[user.currentPlanet]
    const iconSize = 96

    return (
      <Fragment>
        <PlanetBackground />
        <div className={classes.outer}>
          <div>
            <div>
              <CargoMeter current={user.currentCargo} max={user.maxCargo} />
              <Fragment>
                { this.props.children }
              </Fragment>
            </div>
            <div >
              <Rect
                type="status"
                size="wide"
              >Ξ{user.balance}</Rect>
              <div style={{ marginTop: '20%', width: '100%' }}>
                {sideButtons && sideButtons.map((sideButton, i) => (
                  <Rect
                    key={i}
                    isButton
                    onClick={sideButton.fn}
                    size="wide"
                  >
                    {sideButton.label}
                  </Rect>
                ))}
              </div>
            </div>
          </div>
          <div className={classes.navigation}>
            {/* Bottom row */}
            {navLinks.map((link, i) =>
              <Rect
                key={i}
                isButton
                active={currentScreen === link.name}
                size="wide4"
                onClick={() => changeScreen(link.name)}
              >{link.label}</Rect>
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
