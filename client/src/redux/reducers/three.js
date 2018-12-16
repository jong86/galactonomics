export default (state, action) => {
  switch (action.type) {
    case 'INIT_BG': {
      const { renderer, scene, camera } = action

      return {
        ...state,
        bg: {
          renderer,
          scene,
          camera,
        }
      }
    }

    case 'INIT_FG': {
      const { renderer, scene, camera } = action

      return {
        ...state,
        fg: {
          renderer,
          scene,
          camera,
        }
      }
    }

    default: return { ...state }
  }
}