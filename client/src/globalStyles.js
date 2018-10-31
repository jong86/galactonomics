export default {
  '@global': {
    body: {
      backgroundColor: 'black',
      color: 'white',
      fontFamily: 'Verdana',
    },
    div: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    },
  },

  '@keyframes vibrate1': {
    '0%': {
      '-webkit-transform': 'translate(0)',
              'transform': 'translate(0)',
    },
    '20%': {
      '-webkit-transform': 'translate(-2px, 2px)',
              'transform': 'translate(-2px, 2px)',
    },
    '40%': {
      '-webkit-transform': 'translate(-2px, -2px)',
              'transform': 'translate(-2px, -2px)',
    },
    '60%': {
      '-webkit-transform': 'translate(2px, 2px)',
              'transform': 'translate(2px, 2px)',
    },
    '80%': {
      '-webkit-transform': 'translate(2px, -2px)',
              'transform': 'translate(2px, -2px)',
    },
    '100%': {
      '-webkit-transform': 'translate(0)',
              'transform': 'translate(0)',
    },
  }
}