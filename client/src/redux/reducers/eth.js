export default (state, action) => {
  switch (action.type) {
    case 'SET_ETH_STATE': {
      const { ethState } = action

      return {
        ...state,
        ...ethState,
      }
    }

    default: return { ...state }
  }
}