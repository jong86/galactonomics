import React, { Component } from "react"
import { connect } from 'react-redux'
import * as THREE from 'three'

class CProjectMousePosToXYPlaneHelper
{
    constructor()
    {
        this.m_vPos = new THREE.Vector3();
        this.m_vDir = new THREE.Vector3();
    }

    Compute(x, y, camera, vOutPos)
    {
        let vPos = this.m_vPos;
        let vDir = this.m_vDir;

        vPos.set(
            -1.0 + 2.0 * x / window.innerWidth,
            -1.0 + 2.0 * y / window.innerHeight,
            0.5
        ).unproject( camera );

        // Calculate a unit vector from the camera to the projected position
        vDir.copy( vPos ).sub( camera.position ).normalize();

        // Project onto z=0
        let flDistance = -camera.position.z / vDir.z;
        vOutPos.copy( camera.position ).add( vDir.multiplyScalar( flDistance ) );
    }
}

class Planet extends Component {
  render() {
    const { uri, x, y } = this.props
    const { scene, camera, renderer } = this.props.three

    // Extract characters from URI to use for 3d model
    const color = parseInt(uri.substr(2, 6), 16)
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256
    const zoom = ((parseInt(uri.substr(12, 2), 16) / 256) * 0.5) + 0.75

    // Create the shape
    var geometry = new THREE.SphereGeometry(24, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
    var sphere = new THREE.Mesh(geometry, material);

    // To convert DOM pixels to threeJS coords
    let Helper = new CProjectMousePosToXYPlaneHelper();
    let vProjectedMousePos = new THREE.Vector3();
    Helper.Compute(x, y, camera, vProjectedMousePos);

    sphere.position.x = vProjectedMousePos.x
    sphere.position.y = -vProjectedMousePos.y
    sphere.position.z = vProjectedMousePos.z
    scene.add(sphere);

    renderer.render(scene, camera);

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
