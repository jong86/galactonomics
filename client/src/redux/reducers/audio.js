export default (state, action) => {
  switch (action.type) {
    case 'SET_AUDIO_STATE': {
      const { audioState } = action

      return {
        ...state,
        ...audioState,
      }
    }

    default: return { ...state }
  }
}