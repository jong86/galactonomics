export default (state, action) => {
  switch (action.type) {
    case 'ADD_CONTRACT': {
      const { name, contract } = action

      return {
        ...state,
        [name]: contract,
      }
    }

    default: {
      return { ...state }
    }
  }
}