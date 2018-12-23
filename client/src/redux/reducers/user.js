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
      const { currentPlanet } = action
      
      return {
        ...state,
        currentPlanet,
      }
    }

    default: return { ...state }
  }
}