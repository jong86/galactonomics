import React from "react";
import injectSheet from 'react-jss'
import colorFromFlavour from 'utils/colorFromFlavour'

const styles = {
  Laserframe: {
    textAlign: "center",
    border: ({ flavour }) => '1px solid ' + colorFromFlavour(flavour),
    color: ({ flavour }) => colorFromFlavour(flavour),
    backgroundColor: ({ active }) => {
      if (!active) return 'rgba(0, 0, 0, 0.75)'
      return '#444'
    },
    width: ({ size }) => {
      switch (size) {
        case 'wide': return 'fill-available'
        case 'small': return 'fit-content'
        case 'wide3': return '33.33333%'
        case 'wide4': return '25%'
      }
    },
    borderRadius: 4,
    padding: '12px',
    margin: '4px',
    cursor: ({ isButton }) => isButton ? 'pointer' : 'default',
    userSelect: 'none',
    '&:hover': {
      color: ({ isButton }) => isButton ? '#000' : null,
      backgroundColor: ({ isButton, flavour }) => isButton ? colorFromFlavour(flavour) : null,
    }
  }
}

class Laserframe extends React.Component {
  render() {
    const { classes, children, onClick } = this.props

    return (
      <div
        className={classes.Laserframe}
        onClick={() => {
          if (onClick) onClick()
        }}
      >
        { children }
      </div>
    )
  }
}

Laserframe = injectSheet(styles)(Laserframe)
export default Laserframe;
