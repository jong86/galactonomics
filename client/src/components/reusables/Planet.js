import React, { Component } from "react"
import { connect } from 'react-redux'
import * as THREE from 'three'

function convertDomPosToThreePos(x, y, camera) {
  console.log('x, y, y', x, y, camera);
  const vPos = new THREE.Vector3()

  vPos.set(
    -1.0 + 2.0 * x / window.innerWidth,
    -(-1.0 + 2.0 * y / window.innerHeight),
    0,
  ).unproject(camera)

  // Calculate a unit vector from the camera to the projected position
  const vDir = vPos.clone()
  vDir.sub(camera.position)
  vDir.normalize()

  // Project onto z=0
  const flDistance = -camera.position.z / vDir.z

  // Return vector
  const vOutPos = camera.position.clone()
  vOutPos.add(vDir.multiplyScalar(flDistance))

  return vOutPos
}

class Planet extends Component {
  componentDidMount = () => {
    this.renderPlanet()
  }

  componentWillUnmount = () => {
    this.clearPlanet()
  }

  clearPlanet = () => {
    const { renderer } = this.props.three
    renderer.clear()
  }

  renderPlanet = () => {
    const { uri, x, y } = this.props
    const { scene, camera, renderer } = this.props.three

    // Extract characters from URI to use for 3d model
    const color = parseInt(uri.substr(2, 6), 16)
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256
    const zoom = ((parseInt(uri.substr(12, 2), 16) / 256) * 0.5) + 0.75

    // Create the shape
    const geometry = new THREE.SphereGeometry(24, 16, 16)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
    const sphere = new THREE.Mesh(geometry, material)

    // To convert DOM pixels to threeJS coords
    const pos = convertDomPosToThreePos(x, y, camera);

    sphere.position.x = pos.x
    sphere.position.y = pos.y
    sphere.position.z = pos.z
    scene.add(sphere);

    renderer.render(scene, camera);
  }

  render() {
    return null
  }
}

const mapStateToProps = state => {
  return {
    three: state.three,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setTravelState: travelState => dispatch({ type: 'SET_TRAVEL_STATE', travelState }),
  }
}

Planet = connect(mapStateToProps, mapDispatchToProps)(Planet)
export default Planet
