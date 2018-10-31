export default (state, action) => {
  switch (action.type) {
    case 'ADD_CONTRACT': {
      const { name, instance } = action

      return {
        ...state,
        [name]: instance,
      }
    }

    default: return { ...state }
  }
}