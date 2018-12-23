export default (state, action) => {
  switch (action.type) {
    case 'SET_TRAVEL_STATE': {
      const { travelState } = action

      return {
        ...state,
        ...travelState,
      }
    }

    case 'SET_VISIBLE_PLANETS': {
      const { visiblePlanets } = action

      return {
        ...state,
        ...visiblePlanets,
      }
    }

    case 'CHANGE_SECTOR': {
      const { newSector } = action

      return {
        ...state,
        sector: newSector,
      }
    }

    default: return { ...state }
  }
}