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
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0.25);
    renderer.setSize(90, 120);

    const div = document.getElementById(uri)
    div.appendChild(renderer.domElement);

    var box = new THREE.SphereGeometry(2, 6, 2);
    var mesh = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
    var cube = new THREE.Mesh(box, mesh);
    scene.add(cube);

    var light = new THREE.PointLight(0xffffff, 8, 0, 2);
    light.position.set(300, 300, 250);
    scene.add(light);

    var light2 = new THREE.RectAreaLight(0xffffff, 4, 750, 1000);
    light2.position.set(-300, -300, 250);
    light2.lookAt( 0, 0, 0 );
    scene.add(light2);

    cam.position.z = 2.75;

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
