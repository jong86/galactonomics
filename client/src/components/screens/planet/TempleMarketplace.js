import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Rect from 'components/reusables/Rect'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import uuid from 'utils/uuid'
import Dialog from 'components/reusables/Dialog'
import SellOrder from 'components/reusables/SellOrder'
import getPlayerInfo from 'utils/getPlayerInfo'
import Loader from 'components/reusables/Loader'

const styles = {
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    '& > div:first-child': {
      flex: '0.2',
    },
    '& > div:last-child': {
      flex: '0.8',
    },
  },
  crystal: {
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
      const crystalIds = await contracts.temple.getCrystalsForSale({ from: user.address })
      if (crystalIds.length) {
        const crystals = []

        for (let id of crystalIds) {
          crystals.push({
            id: id.toString(),
            uri: await contracts.temple.crystalURI(id, { from: user.address }),
          })
        }

        this.setState({ crystals })
      }
    } catch (e) {
      console.error(e)
    }
  }

  buy = async () => {
    const { contracts, user } = this.props
    const { selectedCrystalId } = this.state
    try {
      await contracts.temple.buy(selectedCrystalId, { from: user.address })
    } catch (e) {
      console.error(e)
    }
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
          Temple Marketplace
        </div>
        {crystals.map((crystal, i) => (
          <div
            key={crystal.id}
            className={classes.crystal}
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
            {/* <div id={i}>
            </div> */}
          </div>
        ))}
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
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
  }
}

TempleMarketplace = connect(mapStateToProps, mapDispatchToProps)(TempleMarketplace)
TempleMarketplace = injectSheet(styles)(TempleMarketplace)
export default TempleMarketplace;
