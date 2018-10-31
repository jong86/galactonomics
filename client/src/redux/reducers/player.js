export default (state, action) => {
  switch (action.type) {
    case 'SET_INFO': {
      const { info } = action

      return {
        ...state,
        ...info,
      }
    }

    default: {
      return { ...state }
    }
  }
}