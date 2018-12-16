import * as THREE from 'three'

export function convertDomPosToThreePos(x, y, camera) {
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

export function removeEntity(renderer, scene, camera, name) {
  var selectedObject = scene.getObjectByName(name);
  scene.remove(selectedObject);
  renderer.render(scene, camera);
}