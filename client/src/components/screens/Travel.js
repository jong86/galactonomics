import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import planets from 'utils/planets'

const PWIDTH = 128

const styles = {
  container: {
  },
  planets: {
    width: '100%',
  },
  planet: {
    position: 'absolute',
    cursor: 'pointer',
    '&:hover > div': {
      opacity: 1.0,
    },
    '& > div': {
      opacity: 0.5,
    },
  },
}

class Travel extends Component {
  state = {};

  travelToPlanet = async planetId => {
    const { contracts, user } = this.props

    try {
      await contracts.gta.travelToPlanet(planetId, { from: user.address })
    } catch (e) {
      return console.error(e.toString())
    }

    // Wait until TravelComplete event is heard, then set currentPlanet again in state
    // so that the correct planet is shown in PlanetIntro
    this.props.goToPlanetIntroScreen()
  }

  render() {
    const { classes, user } = this.props

    return (
      <div className={classes.container}>
        <h1>Travel</h1>
        <div className={classes.planets}>
          {planets.map((planet, i) =>
            <div
              key={i}
              className={classes.planet}
              style={{
                left: ((window.innerWidth / 100) * planet.x) - (PWIDTH / 2),
                bottom: ((window.innerHeight / 100) * planet.y),
              }}
              onClick={() => this.travelToPlanet(i)}
            >
              <img
                src={planet.img}
                width={PWIDTH}
              />
              <div>
                { planet.name }
              </div>
              {i == user.currentPlanet && '(current)'}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToPlanetIntroScreen: () => dispatch({ type: 'CHANGE_SCREEN', screen: 'PlanetIntro' }),
  }
}

Travel = connect(mapStateToProps, mapDispatchToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
