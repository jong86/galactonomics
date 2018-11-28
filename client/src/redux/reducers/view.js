export default (state, action) => {
  switch (action.type) {
    case 'CHANGE_SCREEN': {
      const { screen } = action

      return {
        ...state,
        currentScreen: screen,
      }
    }

    case 'SET_DIALOG_BOX': {
      const { content, flavour, noDefaultButton } = action

      return {
        ...state,
        dialogBox: {
          ...state.dialogBox,
          content,
          flavour,
          noDefaultButton,
        }
      }
    }

    default: return { ...state }
  }
}