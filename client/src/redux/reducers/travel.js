export default (state, action) => {
  switch (action.type) {
    case 'SET_TRAVEL_STATE': {
      const { travelState } = action

      return {
        ...state,
        ...travelState,
      }
    }

    default: return { ...state }
  }
}