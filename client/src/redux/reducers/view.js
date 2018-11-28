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
      const { content, flavour } = action

      return {
        ...state,
        dialogBoxContent: content,
        dialogBoxFlavour: flavour,
      }
    }

    default: return { ...state }
  }
}