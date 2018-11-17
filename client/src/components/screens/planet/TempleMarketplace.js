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
  }
}

class TempleMarketplace extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      crystals: [],
    }
  }

  componentDidMount = () => {
    this.getCrystalsForSale()
  }

  getCrystalsForSale = async () => {
    const { contracts, user } = this.props
    let crystals
    try {
      crystals = await contracts.temple.getCrystalsForSale({ from: user.address })
    } catch (e) {
      console.error(e)
    }
    console.log('crystals', crystals);
  }

  onClickBuy = async () => {
  }

  buy = async () => {
    const { contracts, user } = this.props
    const { selectedCrystalId } = this.state
    try {
      await contracts.temple.buy(selectedCrystalId, { from: user })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { classes } = this.props
    const { crystals } = this.state

    const sideButtons = [
      { fn: this.onClickBuy, label: 'Buy' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          Temple Marketplace
        </div>
        {crystals.map(crystal => (
          <div>
            a crystal here
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
