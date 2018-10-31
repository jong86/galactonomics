export default (state, action) => {
  switch (action.type) {
    case 'CHANGE_SCREEN': {
      const { screen } = action

      return {
        ...state,
        currentScreen: screen,
      }
    }

    default: {
      return { ...state }
    }
  }
}