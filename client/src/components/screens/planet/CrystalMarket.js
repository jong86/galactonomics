import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import MPIContainer from 'components/screens/planet/MPIContainer'
import Crystal from 'components/reusables/Crystal'

const styles = {
  container: {
    width: '100%',
    '& > div:first-child': {
      flex: '0.2',
    },
    '& > div:last-child': {
      flex: '0.8',
    },
  },
  crystalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    '& > div': {
      border: '1px solid grey',
      padding: 8,
    }
  }
}

class TempleMarketplace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      crystals: [],
      selectedCrystalId: null,
      isLoading: false,
    }
  }

  componentDidMount = () => {
    this.getCrystalsForSale()
  }

  getCrystalsForSale = async () => {
    const { contracts, user } = this.props

    try {
      // Get the IDs of each crystal for sale, then get their URIs
      const crystalIds = await contracts.crystalAuthority.getCrystalsForSale({ from: user.address })
      if (crystalIds.length) {
        const crystals = []

        for (let id of crystalIds) {
          crystals.push({
            id: id.toString(),
            uri: await contracts.crystalAuthority.crystalURI(id, { from: user.address }),
          })
        }

        for (let [i, crystal] of crystals.entries()) {
          const sellData = await contracts.crystalAuthority.getCrystalSellData(crystal.id, { from: user.address })
          crystals[i].price = sellData.price.toString()
          crystals[i].seller = sellData.seller
        }

        this.setState({ crystals })
      }
    } catch (e) {
      console.error(e)
    }
  }

  buy = async () => {
    const { contracts, user } = this.props
    const { crystals, selectedCrystalId } = this.state
    const crystal = crystals[crystals.findIndex(crystal => crystal.id === selectedCrystalId)]
    try {
      await contracts.crystalAuthority.buy(selectedCrystalId, { from: user.address, value: crystal.price })
    } catch (e) {
      console.error(e)
    }
    this.getCrystalsForSale()
  }

  render() {
    const { classes } = this.props
    const {
      crystals,
      selectedCrystalId,
    } = this.state

    const sideButtons = [
      { fn: this.buy, label: 'Buy' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          {crystals.length === 0 && 'There are no crystals for sale right now'}
          {crystals.map(crystal => (
            <div
              key={crystal.id}
              className={classes.crystalRow}
              onClick={() => this.setState({ selectedCrystalId: crystal.id })}
            >
              <div style={{
                backgroundColor: selectedCrystalId === crystal.id ? '#fff' : null,
                color: selectedCrystalId === crystal.id ? '#000' : null,
              }}>
                {crystal.id}
              </div>
              <div>
                {crystal.uri}
              </div>
              <div>
                {crystal.price}
              </div>
              <div>
                {crystal.seller}
              </div>
              <Crystal uri={crystal.uri} />
            </div>
          ))}
        </div>
      </MPIContainer>
    )
  }
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    user: state.user,
    web3: state.web3,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setDialogBox: (content, flavour)=> dispatch({ type: 'SET_DIALOG_BOX', content, flavour }),
  }
}

TempleMarketplace = connect(mapStateToProps, mapDispatchToProps)(TempleMarketplace)
TempleMarketplace = injectSheet(styles)(TempleMarketplace)
export default TempleMarketplace;
