export default (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_INFO': {
      const { info } = action

      return {
        ...state,
        ...info,
      }
    }

    case 'SET_ADDRESS': {
      const { address } = action

      return {
        ...state,
        address,
      }
    }

    default: return { ...state }
  }
}