import React, { Component } from "react"
import * as THREE from 'three'

class Crystal extends Component {
  componentDidMount = () => {
    this.renderCrystal()
  }

  renderCrystal = () => {
    const { uri } = this.props

    // Extract characters from URI to use for 3d model
    const color = eval('0x' + uri.substr(0, 6))

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(90, 120);

    const div = document.getElementById(uri)
    div.appendChild(renderer.domElement);

    var box = new THREE.SphereGeometry(2, 6, 1);
    var mesh = new THREE.MeshLambertMaterial({
      reflectivity: 1000,
    });
    var cube = new THREE.Mesh(box, mesh);
    scene.add(cube);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    scene.add(directionalLight);

    // Take first 6 characters of URI string and use for the colour
    var light = new THREE.PointLight(color, 25, 100);
    light.position.set(50, 50, 50);
    scene.add(light);

    cam.position.z = 2.75;
    cube.rotation.x = 0.05;
    var render = function() {
      requestAnimationFrame(render);
      cube.rotation.y += 0.01;
      renderer.render(scene, cam);
    };

    render();
  }

  render() {
    const { uri } = this.props

    return (
      <div id={uri}>
      </div>
    )
  }
}
export default Crystal;
