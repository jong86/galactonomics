import React, { Component } from "react"
import * as THREE from 'three'

class Planet extends Component {
  componentDidMount = () => {
    this.renderPlanet()
  }

  renderPlanet = () => {
    const { uri, renderer } = this.props

    // Extract characters from URI to use for 3d model
    const color = parseInt(uri.substr(2, 6), 16)
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256
    const zoom = ((parseInt(uri.substr(12, 2), 16) / 256) * 0.5) + 0.75

    var scene = new THREE.Scene();

    // Create camera
    var camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50

    // Create the shape
    var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Create light source
    var light = new THREE.RectAreaLight(0xffffff, 4, 750, 1000);
    light.position.set(-300, -300, 250);
    light.lookAt( 0, 0, 0 );
    scene.add(light);

    renderer.render(scene, camera);
  }

  render() {
    return null
  }
}
export default Planet;
