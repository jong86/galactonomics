import React from "react";
import Welcome from "components/screens/Welcome"
import SpaceshipDealer from "components/screens/SpaceshipDealer"
import Travel from  "components/screens/Travel"
import Travelling from  "components/screens/Travelling"
import PlanetIntro from  "components/screens/PlanetIntro"
import PlanetHome from  "components/screens/PlanetHome"
import PlanetMarketplace from  "components/screens/PlanetMarketplace"
import PlanetIndustrial from  "components/screens/PlanetIndustrial"
import PlanetPrices from  "components/screens/PlanetPrices"

export default screen => {
  switch(screen) {
    case 'Welcome': return <Welcome />
    case 'SpaceshipDealer': return <SpaceshipDealer/>
    case 'Travel': return <Travel/>
    case 'Travelling': return <Travelling/>
    case 'PlanetIntro': return <PlanetIntro/>
    case 'PlanetHome': return <PlanetHome/>
    case 'PlanetMarketplace': return <PlanetMarketplace/>
    case 'PlanetIndustrial': return <PlanetIndustrial/>
    case 'PlanetPrices': return <PlanetPrices/>
    default: break
  }
}