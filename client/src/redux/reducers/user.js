export default (state, action) => {
  switch (action.type) {
    case 'SET_COMMODITIES_OWNED': {
      const { commoditiesOwned } = action

      return {
        ...state,
        commoditiesOwned,
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
      const { id, uri } = action

      return {
        ...state,
        travellingTo: {
          ...state.travellingTo,
          id,
          uri,
        }
      }
    }

    case 'FINISH_TRAVEL': {
      return {
        ...state,
        currentPlanet: state.travellingTo,
      }
    }

    case 'CHANGE_CURRENT_PLANET': {
      const { id, uri } = action

      return {
        ...state,
        currentPlanet: {
          ...state.currentPlanet,
          id,
          uri,
        }
      }
    }

    default: return { ...state }
  }
}