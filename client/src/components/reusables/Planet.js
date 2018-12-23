import React, { Component } from "react"
import { connect } from 'react-redux'
import * as THREE from 'three'
import { convertDomPosToThreePos, removeEntity } from 'utils/threeUtils'

class Planet extends Component {
  componentDidMount = () => {
    this.renderPlanet()
  }

  componentWillUnmount = () => {
    const { uri } = this.props
    const { scene, camera, renderer } = this.props.three.bg
    removeEntity(renderer, scene, camera, uri)
  }

  renderPlanet = () => {
    const { uri, x, y, radius } = this.props
    const { scene, camera, renderer } = this.props.three.bg
    // debugger
    // Extract characters from URI to use for 3d model
    const color = parseInt(uri.substr(2, 6), 16)
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256
    const zoom = ((parseInt(uri.substr(12, 2), 16) / 256) * 0.5) + 0.75

    // Create the shape
    const geometry = new THREE.SphereGeometry(radius, 16, 16)
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
