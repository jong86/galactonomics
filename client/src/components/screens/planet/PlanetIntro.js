import React, { Component } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import Sound from 'react-sound';
import Planet from 'components/reusables/Planet'

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
      isMining: false,
      hasValidProof: false,
      miningJustFailed: false,
      isSubmitting: false,
    })
  }

  render() {
    const { soundHasPlayed } = this.state
    const { classes, user, changeScreen } = this.props

    return (
      <div className={classes.PlanetIntro}>
        <h1>Welcome to planet {user.currentPlanet.id}</h1>
        <Laserframe
          isButton
          onClick={() => changeScreen('PlanetHome')}
          flavour="good"
        >Continue >></Laserframe>
        <Planet
          uri={user.currentPlanet.uri}
          x={window.innerWidth / 2}
          y={window.innerHeight / 2}
          radius={128}
        />
        {/* <Sound
          url={planet.song}
          playStatus={!soundHasPlayed && Sound.status.PLAYING}
          volume={75}
          onFinishedPlaying={() => this.setState({ soundHasPlayed: true })}
        /> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    three: state.three,
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
