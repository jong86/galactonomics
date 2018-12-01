import React, { Fragment } from "react";
import injectSheet from 'react-jss'
import commodities from 'utils/commodities'
import Laserframe from 'components/reusables/Laserframe'

const styles = {
  CargoMeter: {
    flexDirection: 'row',
  },
}

let CargoMeter = ({ classes, current = 0, max = 0, cargoPerCommodity = [] }) => (
  <div className={classes.CargoMeter}>
    <Laserframe>
      {"Total cargo: " + current.toString()}/{max.toString() + " kg"}
    </Laserframe>
    {cargoPerCommodity.map((commodity, i) =>
      <Laserframe key={i} flavour="dark">
        {commodities[i].symbol} {commodity.amount}
      </Laserframe>
    )}
  </div>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
