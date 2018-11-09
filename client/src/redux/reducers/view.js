export default (state, action) => {
  switch (action.type) {
    case 'CHANGE_SCREEN': {
      const { screen } = action

      return {
        ...state,
        currentScreen: screen,
      }
    }

    case 'SET_ALERT_BOX_CONTENT': {
      const { content } = action

      return {
        ...state,
        alertBoxContent: content,
      }
    }

    default: return { ...state }
  }
}