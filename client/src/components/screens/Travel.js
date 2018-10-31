import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'

import imgPlanet0 from 'assets/planet0.png'
import imgPlanet1 from 'assets/planet1.png'
import imgPlanet2 from 'assets/planet2.png'
import imgPlanet3 from 'assets/planet3.png'
import imgPlanet4 from 'assets/planet4.png'
import imgPlanet5 from 'assets/planet5.png'
import imgPlanet6 from 'assets/planet6.png'

const PWIDTH = 128

const planets = [
  // Positions are 0-100% of window dimension
  { name: "Mondopia", img: imgPlanet0, x: 70, y: 70 },
  { name: "Zyrgon",   img: imgPlanet1, x: 32, y: 42 },
  { name: "Ribos",    img: imgPlanet2, x: 8,  y: 3 },
  { name: "Mustafar", img: imgPlanet3, x: 53, y: 16 },
  { name: "Arrakis",  img: imgPlanet4, x: 82, y: 29 },
  { name: "Kronos",   img: imgPlanet5, x: 94, y: 57 },
  { name: "4546B",    img: imgPlanet6, x: 18, y: 78 },
]

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
    console.log("Hyperdrive activating...")
    console.log("Current speed: 5.39 x 10^11 kph") // Estimate of what speed to get to Mars in 15 seconds

    const { contracts, user } = this.props

      try {
        await contracts.gta.travelToPlanet(planetId, { from: user.address })
      } catch (e) {
        return console.error(e)
      }

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
