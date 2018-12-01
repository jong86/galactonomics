import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import planets from 'utils/planets'
import Sound from 'react-sound';

const styles = {
  PlanetIntro: {
  }
}

class PlanetIntro extends Component {
  state = {
    soundHasPlayed: false,
  }

  componentDidMount = () => {
    // Reset some state since on a new planet now
    this.props.setIndustrialState({
      areasMined: [],
    })
  }

  render() {
    const { soundHasPlayed } = this.state
    const { classes, user, changeScreen } = this.props
    const planet = planets.find(planet => planet.id == user.currentPlanet)

    return (
      <div className={classes.PlanetIntro}>
        <h1>Welcome to {planet.id != '255' && 'planet '}{planet.name}</h1>
        <Laserframe
          isButton
          onClick={() => changeScreen('PlanetHome')}
          flavour="good"
        >Continue >></Laserframe>
        <img
          src={planet.img}
        />
        <Sound
          url={planet.song}
          playStatus={!soundHasPlayed && Sound.status.PLAYING}
          volume={75}
          onFinishedPlaying={() => this.setState({ soundHasPlayed: true })}
        />
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
    changeScreen: screen => dispatch({ type: 'CHANGE_SCREEN', screen }),
    setIndustrialState: industrialState => dispatch({ type: 'SET_INDUSTRIAL_STATE', industrialState }),
  }
}

PlanetIntro = connect(mapStateToProps, mapDispatchToProps)(PlanetIntro)
PlanetIntro = injectSheet(styles)(PlanetIntro)
export default PlanetIntro;
