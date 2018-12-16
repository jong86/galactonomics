import React, { Component } from "react"
import { connect } from 'react-redux'
import * as THREE from 'three'
import { convertDomPosToThreePos, removeEntity } from 'utils/threeUtils'

class Commodity extends Component {
  componentDidMount = () => {
    this.renderCommodity()
  }

  componentWillUnmount = () => {
    const { uri } = this.props
    const { scene, camera, renderer } = this.props.three.fg
    removeEntity(renderer, scene, camera, uri)
  }

  renderCommodity = () => {
    const { uri, x, y } = this.props
    const { scene, camera, renderer } = this.props.three.fg

    // Extract characters from URI to use for 3d model
    const color = parseInt(uri.substr(2, 6), 16)
    const metalness = parseInt(uri.substr(7, 2), 16) / 256
    const roughness = parseInt(uri.substr(9, 2), 16) / 256
    const zoom = ((parseInt(uri.substr(12, 2), 16) / 256) * 0.5) + 0.75

    // Create the shape
    const geometry = new THREE.BoxGeometry(16, 16, 16)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
    const cube = new THREE.Mesh(geometry, material)
    cube.name = uri

    // To convert DOM pixels to threeJS coords
    const pos = convertDomPosToThreePos(x, y, camera);

    cube.position.x = pos.x
    cube.position.y = pos.y
    cube.position.z = pos.z
    scene.add(cube);

    cube.rotation.z = 0.2
    var render = function() {
      requestAnimationFrame(render);
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    render();
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

Commodity = connect(mapStateToProps)(Commodity)
export default Commodity
