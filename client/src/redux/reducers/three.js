export default (state, action) => {
  switch (action.type) {
    case 'SET_RENDERER': {
      const { renderer } = action

      return {
        ...state,
        renderer,
      }
    }

    case 'SET_SCENE': {
      const { scene } = action

      return {
        ...state,
        scene,
      }
    }

    case 'SET_CAMERA': {
      const { camera } = action

      return {
        ...state,
        camera,
      }
    }

    default: return { ...state }
  }
}