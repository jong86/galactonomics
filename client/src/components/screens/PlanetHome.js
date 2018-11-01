import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Button from 'components/reusables/Button'
import planets from 'utils/planets'

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
    width: '100%',
  },
}

class PlanetHome extends Component {
  state = {};

  render() {
    const { classes, user } = this.props
    const planet = planets[user.currentPlanet]

    return (
      <div className={classes.container}>
        <div>
          <img src={planet.img} className={classes.planetImg} />
          <Button
            onClick={this.props.goToTravelScreen}
            type="good"
            shape="wide"
          >Leave {planet.name}</Button>
        </div>
        <div>
          2
        </div>
        <div>
          3
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToTravelScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'Travel' }),
    goToPlanetMarketplacesScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetMarketplaces' }),
    goToPlanetPricesScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetPrices' }),
    goToPlanetIndustrialScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIndustrial' }),
  }
}

PlanetHome = connect(mapStateToProps, mapDispatchToProps)(PlanetHome)
PlanetHome = injectSheet(styles)(PlanetHome)
export default PlanetHome;
