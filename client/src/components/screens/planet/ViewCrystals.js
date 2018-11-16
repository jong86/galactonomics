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

class ViewCrystals extends Component {
  componentDidMount = () => {
    this.crystalsOfOwner()
  }

  crystalsOfOwner = async () => {
    const { contracts, user } = this.props
    const crystals = []

    try {
      const crystalIds = await contracts.temple.crystalsOfOwner(user.address, { from: user.address })
      if (crystalIds && crystalIds.length) {
        for (let id of crystalIds) {
          crystals.push({
            id,
            uri: await contracts.temple.crystalURI(id, { from:user.address })
          })
        }
      }
    } catch (e) {
      console.error(e)
    }

    console.log('crystals', crystals);
  }

  render() {
    const { classes } = this.props

    return (
      <MPIContainer>
        <div className={classes.container}>
          Viewing my crystals
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
    setAlertBoxContent: content => dispatch({ type: 'SET_ALERT_BOX_CONTENT', content }),
  }
}

ViewCrystals = connect(mapStateToProps, mapDispatchToProps)(ViewCrystals)
ViewCrystals = injectSheet(styles)(ViewCrystals)
export default ViewCrystals;
