export default (state, action) => {
  switch (action.type) {
    case 'SET_USER_INFO': {
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

    case 'SET_TRAVELLING_TO': {
      const { travellingTo } = action

      return {
        ...state,
        travellingTo,
      }
    }

    default: return { ...state }
  }
}