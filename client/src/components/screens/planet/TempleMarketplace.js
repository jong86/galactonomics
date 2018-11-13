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
      sellAmount: '',
      sellPrice: '',

      isSellBoxVisible: false,

      isLoading: false,
    }

    this.handleChange = handleChange.bind(this)
  }

  onClickBuy = async () => {
  }

  onClickSell = () => {
  }

  render() {
    const { classes } = this.props
    const {
      sellAmount,
      sellPrice,
      isSellBoxVisible,
      isLoading,
    } = this.state

    const sideButtons = [
      { fn: this.onClickBuy, label: 'Buy' },
      { fn: this.onClickSell, label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        <div className={classes.container}>
          Temple Marketplace
        </div>

        {/* Sell box */}
        <Dialog type="status" isVisible={isSellBoxVisible}>
          <div>
            Sell your level __ Byzantian Crystal with ID __________________
          </div>
          <label htmlFor="sellAmount">
            Amount
            <input name="sellAmount" defaultValue={sellAmount} type="number" onChange={this.handleChange}></input>
          </label>
          <label htmlFor="sellPrice">
            Price
            <input name="sellPrice" defaultValue={sellPrice} type="number" onChange={this.handleChange}></input>
          </label>
          <Rect
            type="status"
            isButton
            onClick={this.createSellOrder}
          >Ok</Rect>
        </Dialog>
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
