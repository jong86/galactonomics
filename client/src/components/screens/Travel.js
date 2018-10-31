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

const planets = [
  { name: "Mondopia", img: imgPlanet0, x: 5, y: 5 },
  { name: "Zyrgon",   img: imgPlanet1, x: 2.25, y: 2.5 },
  { name: "Ribos",    img: imgPlanet2, x: 0.25, y: 0.5 },
  { name: "Mustafar", img: imgPlanet3, x: 4, y: 1 },
  { name: "Arrakis",  img: imgPlanet4, x: 6, y: 3 },
  { name: "Kronos",   img: imgPlanet5, x: 0.5, y: 4 },
  { name: "4546B",    img: imgPlanet6, x: 2, y: 5.5 },
]

const styles = {
  container: {
  },
  planets: {
    width: '100%',
  },
  planet: {
    position: 'absolute',
  }
}

class Travel extends Component {
  state = {};


  render() {
    const { classes } = this.props

    console.log('window.innerWidth', window.innerWidth);

    return (
      <div className={classes.container}>
        <h1>Travel</h1>
        <div className={classes.planets}>
          {planets.map((planet, i) =>
            <img
              key={i}
              className={classes.planet}
              src={planet.img}
              width="128"
              style={{
                left: (window.innerWidth / 7) * planet.x,
                bottom: (window.innerHeight / 7) * planet.y,
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {

  }
}

Travel = connect(mapStateToProps)(Travel)
Travel = injectSheet(styles)(Travel)
export default Travel;
