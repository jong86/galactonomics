import React from "react"

import Welcome from "components/screens/Welcome"
import Travel from  "components/screens/Travel"
import PlanetIntro from  "components/screens/planet/PlanetIntro"
import PlanetHome from  "components/screens/planet/PlanetHome"
import CommodityMarket from  "components/screens/planet/CommodityMarket"
import MineCommodities from  "components/screens/planet/MineCommodities"
import ViewCargo from  "components/screens/planet/ViewCargo"
import CrystalMarket from  "components/screens/planet/CrystalMarket"
import ForgeCrystal from  "components/screens/planet/ForgeCrystal"
import ViewCrystals from  "components/screens/planet/ViewCrystals"

export default screen => {
  switch(screen) {
    case 'Welcome': return <Welcome />
    case 'Travel': return <Travel/>
    case 'PlanetIntro': return <PlanetIntro/>
    case 'PlanetHome': return <PlanetHome/>
    case 'CommodityMarket': return <CommodityMarket/>
    case 'MineCommodities': return <MineCommodities/>
    case 'ViewCargo': return <ViewCargo/>
    case 'CrystalMarket': return <CrystalMarket/>
    case 'ForgeCrystal': return <ForgeCrystal/>
    case 'ViewCrystals': return <ViewCrystals/>
    default: break
  }
}