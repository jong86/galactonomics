import telegrama from 'fonts/telegrama.woff'

export default {
  '@global': {
    body: {
      backgroundColor: 'black',
      color: 'white',
      fontFamily: 'telegrama',
      margin: 0,
    },
    div: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
      'backdrop-filter': 'blur(20px)',
    },
  },
  '@font-face': {
    fontFamily: 'telegrama',
    src: `url(${telegrama}) format("woff")`,
  },

  App: {
    width: '100%',
    minHeight: '100vh',
    justifyContent: 'flex-start',

    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 0%',
    backgroundSize: '100%',
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