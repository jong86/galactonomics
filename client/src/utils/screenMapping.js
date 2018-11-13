import React from "react"

import Welcome from "components/screens/Welcome"
import SpaceshipDealer from "components/screens/SpaceshipDealer"

import Travel from  "components/screens/Travel"
import Travelling from  "components/screens/Travelling"

import PlanetIntro from  "components/screens/planet/PlanetIntro"
import PlanetHome from  "components/screens/planet/PlanetHome"
import PlanetMarketplace from  "components/screens/planet/PlanetMarketplace"
import PlanetIndustrial from  "components/screens/planet/PlanetIndustrial"
import PlanetPrices from  "components/screens/planet/PlanetPrices"

import TempleMarketplace from  "components/screens/planet/TempleMarketplace"
import TempleIndustrial from  "components/screens/planet/TempleIndustrial"
import ViewCrystals from  "components/screens/planet/ViewCrystals"

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

    case 'TempleMarketplace': return <TempleMarketplace/>
    case 'TempleIndustrial': return <TempleIndustrial/>
    case 'ViewCrystals': return <ViewCrystals/>
    default: break
  }
}