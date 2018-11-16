import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import uuid from 'utils/uuid'
import Dialog from 'components/reusables/Dialog'
import SellOrder from 'components/reusables/SellOrder'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'
import * as THREE from 'three'


const styles = {
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    '& > div:first-child': {
      flex: '0.2',
    },
    '& > div:last-child': {
      flex: '0.8',
    },
  }
}

class ViewCrystals extends Component {
  constructor() {
    super()
    this.state = {
      crystals: [],
    }
  }

  componentDidMount = () => {
    this.crystalsOfOwner()
  }

  componentDidUpdate = (_, prevState) => {
    if (prevState.crystals.length !== this.state.crystals.length) {
      this.renderCrystal()
    }
  }

  renderCrystal = () => {
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();

    const div = document.getElementById(1)
    renderer.setSize(150, 100);
    div.appendChild( renderer.domElement );

    var box = new THREE.SphereGeometry(2, 10, -30);
    var mesh = new THREE.MeshBasicMaterial({
    wireframe: false,
      color: 0x562399
    });
    var cube = new THREE.Mesh(box, mesh);
    scene.add(cube);
    cam.position.z = 3;
    var render = function () {
      requestAnimationFrame( render );
      cube.rotation.y += 0.01;
      renderer.render(scene, cam);
    };

    render();
  }

  crystalsOfOwner = async () => {
    const { contracts, user } = this.props
    const crystals = []

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      if (crystalIds && crystalIds.length) {
        for (let id of crystalIds) {
          crystals.push({
            id: id.toString(),
            uri: await contracts.temple.crystalURI(id, { from:user.address })
          })
        }
      }
    } catch (e) {
      console.error(e)
    }

    this.setState({ crystals })
  }

  render() {
    const { classes } = this.props
    const { crystals } = this.state

    return (
      <MPIContainer>
        <div className={classes.container}>
          {crystals.map((crystal, i) =>
            <div key={i} id="1">
              {crystal.id}-{crystal.uri}
            </div>
          )}
        </div>
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
  }
}

ViewCrystals = connect(mapStateToProps, mapDispatchToProps)(ViewCrystals)
ViewCrystals = injectSheet(styles)(ViewCrystals)
export default ViewCrystals;
