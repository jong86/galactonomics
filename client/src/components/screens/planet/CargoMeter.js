import React from "react"
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'

const styles = {
  CargoMeter: {
    flexDirection: 'row',
  },
}

let CargoMeter = ({ classes, current = 0, max = 0 }) => (
  <div className={classes.CargoMeter}>
    <Laserframe>
      {"Total cargo: " + current.toString()}/{max.toString() + " kg"}
    </Laserframe>
  </div>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
