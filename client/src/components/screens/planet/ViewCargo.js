import React, { Component, Fragment } from "react"
import { connect } from 'react-redux'
import injectSheet from 'react-jss'
import MPIContainer from 'components/screens/planet/MPIContainer'
import Loader from 'components/reusables/Loader'
import Laserframe from 'components/reusables/Laserframe'
import Commodity from 'components/reusables/Commodity'
import ellipAddr from 'utils/ellipAddr'
import Measure from 'react-measure'
import getPlayerInfo from 'utils/getPlayerInfo'

const styles = {}

class ViewCargo extends Component {
  state = {
    offsets: [],
  }

  componentDidMount = async () => {
  }

  render() {
    const { classes, user } = this.props
    const { isLoading, offsets } = this.state

    return (
      <MPIContainer>
        {user.commoditiesOwned.map((commodity, i) => (
          <Measure
            offset
            onResize={contentRect => {
              this.setState({
                offsets: offsets.concat([contentRect.offset]),
              })
            }}
          >
            {({ measureRef }) => {
              console.log('offsets', offsets);
              return (
                <div ref={measureRef}>
                  <Laserframe size="wide">
                    {offsets[i] && <Commodity
                      x={offsets[i].left + 20}
                      y={offsets[i].top + offsets[i].height / 2}
                      uri={commodity.uri}
                    />}
                    {'     '}{' - '}
                    {'ID: ' + commodity.id}{' - '}
                    {'URI: ' + ellipAddr(commodity.uri)}{' - '}
                    {'Amount: ' + commodity.amount}
                  </Laserframe>
                </div>
              )
            }}
          </Measure>
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
  }
}

ViewCargo = connect(mapStateToProps, mapDispatchToProps)(ViewCargo)
ViewCargo = injectSheet(styles)(ViewCargo)
export default ViewCargo;
