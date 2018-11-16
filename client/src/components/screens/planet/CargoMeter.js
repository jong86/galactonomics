import React, { Fragment } from "react";
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'

const styles = {
  CargoMeter: {
    flexDirection: 'row',
  },
}

let CargoMeter = ({ classes, current = 0, max = 0, cargoPerCommodity = [] }) => (
  <div className={classes.CargoMeter}>
    <Rect>
      {"Total cargo: " + current.toString()}/{max.toString() + " kg"}
    </Rect>
    {cargoPerCommodity.map(commodity =>
      <Rect type="dark">
        {commodity.symbol} {commodity.amount}
      </Rect>
    )}
  </div>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
