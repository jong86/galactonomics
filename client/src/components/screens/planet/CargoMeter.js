import React from "react";
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'

const styles = {}

let CargoMeter = ({ current, max }) => (
  <Rect>
    Cargo: {current.toString()}/{max.toString()}
  </Rect>
)

CargoMeter = injectSheet(styles)(CargoMeter)
export default CargoMeter;
