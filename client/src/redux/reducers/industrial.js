export default (state, action) => {
  switch (action.type) {
    case 'SET_INDUSTRIAL_STATE': {
      const { industrialState } = action

      return {
        ...state,
        ...industrialState,
      }
    }

    default: return { ...state }
  }
}