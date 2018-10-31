import React from "react";
import Welcome from "../components/screens/Welcome"
import SpaceshipDealer from "../components/screens/SpaceshipDealer"
import Travel from  "../components/screens/Travel"

export default screen => {
  switch(screen) {
    case 'Welcome': return <Welcome />
    case 'SpaceshipDealer': return <SpaceshipDealer/>
    case 'Travel': return <Travel/>
    default: break
  }
}