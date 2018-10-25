  # Galactonomics
  * Economic simulation game set in space, created using smart contracts on Ethereum. Players can purchase a spaceship, travel to 7 planets, and produce and trade commodities on those planets.

  ### Basic overview:
  * Spaceships:
    * Ownership of one is required to play the game (can be purchased with ether)
    * Have a cargo capacity that cannot be exceeded
    * Have fuel that gets depleted and will require refilling
  * Planets:
    * Player has two main options on a planet: produce a commodity, or trade a commodity.
    * Each planet has one of 7 commodities that can be produced there
  * Producing commodities:
    * E.g: player sends 10 eth to contract. The `industrialService` server hears this event and begins sending `mint` transactions for player, over course of 10 blocks. (The inclusion of this server is a UX vs. decentralization trade-off. I want the production to happen over time, but the only other way I can think of to do this *over time* and *not* bug the user with a Metamask pop-up every block, would be to store the private key in the browser and sign the mint transactions automatically, which I'd say is a lot less secure than one trusted server)
    * The commodity that is produced on a planet cannot be sold there, but can be sold on the other 6 planets (this gives players more of a reason to travel to other planets).
    * Every time a player invests in commodity-production, the commodity's `costOfProduction` changes -- 'base' will increase, but also fluctuate randomly (this is to make production not always a worthwhile action)
  * Trading commodities:
    * Player can create a sell-order on a planet
    * Player can purchase a sell-order on a planet

---

## Project structure:
* a ‘player’ is defined as a user that owns a spaceship token
* ‘owner’ is whoever deployed the contract (industrialService server will have owner’s private key)

### GalacticTransitAuthority contract
* functions:
  * buySpaceship() [permissions: non-player] — returns true on successs so GCA can use that to know if to emit event (same for most of these)
  * travelToPlanet(_planetId) [permissions: player]
  * getInfo() [permissions: player] — returns cargo % of ship, name, currentPlanet, … (all data needed for gui display)
* ERC721
* handles ship ownership
* handles ship movements
* stores ship attributes (cargo available %)
* creates array of length 7 called ‘planets’, that contains ‘planet’ struct with info on each planet (name, commodity)

### GalacticIndustrialAuthority contract
* functions:
  * mintCommodityFor(_for, _commodityId, _amount) [permissions: owner]
  * getCommodities() [permissions: player, owner] — returns list of commodities with their data (for use on front-end)
  * setMiningCostFor(_commodityId, _cost, _amountPerBlock) [permissions: owner]

### GalacticEconomicAuthority contract
* functions:
  * createSellOrder(_planetId, _commodityId, _amount, _price) [permissions: player] — adds sellOrder to list of sell orders, transfers commodity to GEA for escrow until someone buys it (a player can only have one sell order per commodity per planet); player must be ON the planet they are selling on
  * buySellOrder(_planetId, _orderId) [permissions: player] — transfers ownership of specified commodity (+ quantity) from playerA to playerB (also need to handle transfer of ether); player/buyer must be on the planet
  * getSellOrders(_planetId) [permissions: player] - returns list of orders on a planet (for front-end)
  * getSellOrder(_planetId, orderId) [permissions: player] - returns data on an order
* handles trading commodities between players
* if player wants to buy, player chooses which sell order to buy (keeps it simple for now)
* creates array of length 7 called ‘planetMarketplaces’ with structs containing marketplace info (sellOrders for each planet)

### Commodity contract (one deployed for each commodity
* ERC20, mintable, has a name, decimal places: 0
* Need to have some checks (not sure if these would knock it out of compliance with ERC20?):
  1. Spaceship ownership required,
  2. Cargo capacity available

### industrialService server
* hears event of investment made for mining, then begins to send transactions every block to mint the commodity for the player


---


### Commodities and their planets:
* Fermented Gookala Eggs (Mondopia) -- commodity[0] <-> planet[0]
* Mufasta Goop (Zyrgon)
* Byzantimum Crystals (Ribos)
* Superalloy Sprockets (Mustafar)
* Arrakian Worm Milk (Arrakis)
* Auxilliary Omnireceptors (Kronos)
* L-337 Nanobulators (4546B)

### Images required
* 7 planets (ex. gazillionaire galaxy-like)
* title screen (pixelated Galactonomics image)