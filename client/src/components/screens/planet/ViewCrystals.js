import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import Laserframe from 'components/reusables/Laserframe'
import MPIContainer from 'components/screens/planet/MPIContainer'
import handleChange from 'utils/handleChange'
import Loader from 'components/reusables/Loader'
import Crystal from 'components/reusables/Crystal'

const styles = {
  crystalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    '& > div': {
      border: '1px solid grey',
      padding: 8,
    }
  },
  sellBox: {
    '& > div:nth-child(3)': {
      marginBottom: '1em',
    },
  },
}

class ViewCrystals extends Component {
  constructor() {
    super()
    this.state = {
      crystals: [],
      sellAmount: '',
      sellPrice: '',
      isSellBoxVisible: false,
      isLoading: false,
      selectedCrystalId: null,
    }
    this.handleChange = handleChange.bind(this)
  }

  componentDidMount = () => {
    this.crystalsOfOwner()
  }

  crystalsOfOwner = async () => {
    const { contracts, user } = this.props
    const crystals = []

    this.setState({ isLoading: true })

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      if (crystalIds && crystalIds.length) {
        for (let id of crystalIds) {
          crystals.push({
            id: id.toString(),
            uri: await contracts.temple.crystalURI(id, { from:user.address })
          })
        }
      }
    } catch (e) {
      console.error(e)
    }

    console.log('crystals', crystals);

    this.setState({
      crystals: crystals.reverse(),
      isLoading: false
    })
  }

  onClickSell = () => {
    const { selectedCrystalId, sellPrice, crystals } = this.state
    const { classes } = this.props
    const crystal = crystals.find(crystal => crystal.id === selectedCrystalId)

    this.props.setDialogBox(
      <div className={classes.sellBox}>
        <div>
          Are you sure you want to sell this crystal?
        </div>
        <Crystal uri={crystal.uri} />
        <div>
          Id {selectedCrystalId}
        </div>
        <div>
          <div>Price</div>
          <input name="sellPrice" defaultValue={sellPrice} type="number" onChange={this.handleChange}></input>
        </div>
        <Laserframe
          flavour="info"
          isButton
          onClick={this.sell}
        >Ok</Laserframe>
      </div>,
      'info',
      true,
    )
  }

  sell = async () => {
    const { contracts, user } = this.props
    const { selectedCrystalId, sellPrice } = this.state

    try {
      await contracts.temple.sell(selectedCrystalId, sellPrice, { from: user.address })
    } catch (e) {
      console.error(e)
    }

    this.crystalsOfOwner()
    this.props.setDialogBox(null)
  }

  render() {
    const { classes } = this.props
    const {
      crystals,
      isLoading,
      selectedCrystalId,
    } = this.state

    const sideButtons = [
      { fn: this.onClickSell, label: 'Sell' },
    ]

    return (
      <MPIContainer sideButtons={sideButtons}>
        {isLoading ?
          <Fragment>
            <Loader />
            Loading crystals...
          </Fragment>
          :
          <div className={classes.container}>
            {crystals.map((crystal, i) =>
              <div
                key={i}
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
                <Crystal uri={crystal.uri} />
              </div>
            )}
          </div>
        }
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
    setDialogBox: (content, flavour, noDefaultButton) =>
      dispatch({ type: 'SET_DIALOG_BOX', content, flavour, noDefaultButton }),
  }
}

ViewCrystals = connect(mapStateToProps, mapDispatchToProps)(ViewCrystals)
ViewCrystals = injectSheet(styles)(ViewCrystals)
export default ViewCrystals;
