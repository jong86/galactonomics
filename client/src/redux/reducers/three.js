export default (state, action) => {
  switch (action.type) {
    case 'SET_RENDERER': {
      const { renderer } = action

      return {
        ...state,
        renderer,
      }
    }

    default: return { ...state }
  }
}