import React from "react";
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'

const styles = {}

let CargoMeter = ({ current = 0, max = 0 }) => (
  <Rect>
    Cargo: {current.toString()}/{max.toString()}
  </Rect>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
