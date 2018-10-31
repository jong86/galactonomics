export default (state, action) => {
  switch (action.type) {
    case 'SET_WEB3': {
      return action.web3
    }

    default: return { ...state }
  }
}