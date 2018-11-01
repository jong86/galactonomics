export default (state, action) => {
  switch (action.type) {
    case 'CHANGE_SCREEN': {
      const { screen } = action

      return {
        ...state,
        currentScreen: screen,
      }
    }

    case 'SET_DIALOG_CONTENT': {
      const { content } = action

      return {
        ...state,
        dialogContent: content,
      }
    }

    default: return { ...state }
  }
}