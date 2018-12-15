import React, { Component } from "react"
import { connect } from 'react-redux'
import * as THREE from 'three'

function convertDomPosToThreePos(x, y, camera) {
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

function removeEntity(renderer, scene, camera, name) {
  var selectedObject = scene.getObjectByName(name);
  scene.remove(selectedObject);
  renderer.render(scene, camera);
}

class Planet extends Component {
  componentDidMount = () => {
    this.renderPlanet()
  }

  componentWillUnmount = () => {
    const { uri } = this.props
    const { scene, camera, renderer } = this.props.three
    removeEntity(renderer, scene, camera, uri)
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
    const planet = new THREE.Mesh(geometry, material)
    planet.name = uri

    // To convert DOM pixels to threeJS coords
    const pos = convertDomPosToThreePos(x, y, camera);

    planet.position.x = pos.x
    planet.position.y = pos.y
    planet.position.z = pos.z
    scene.add(planet);

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

Planet = connect(mapStateToProps)(Planet)
export default Planet
