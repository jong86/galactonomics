import React, { Fragment } from "react";
import injectSheet from 'react-jss'
import commodities from 'utils/commodities'
import LaserFrame from 'components/reusables/LaserFrame'

const styles = {
  CargoMeter: {
    flexDirection: 'row',
  },
}

let CargoMeter = ({ classes, current = 0, max = 0, cargoPerCommodity = [] }) => (
  <div className={classes.CargoMeter}>
    <LaserFrame>
      {"Total cargo: " + current.toString()}/{max.toString() + " kg"}
    </LaserFrame>
    {cargoPerCommodity.map((commodity, i) =>
      <LaserFrame key={i} flavour="dark">
        {commodities[i].symbol} {commodity.amount}
      </LaserFrame>
    )}
  </div>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
