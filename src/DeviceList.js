import React from 'react'
import { autobind } from 'core-decorators'
import { propTypes } from 'mobx-react/native'

import { View } from 'react-native-macos'

import DeviceListItem from './DeviceListItem'

@autobind
export default class DeviceList extends React.Component {
  static propTypes = {
    onConnection: React.PropTypes.func.isRequired,
    devices: propTypes.arrayOrObservableArray.isRequired
  }

  renderItem(device) {
    return <DeviceListItem key={device.clientIdentifier} device={device} onConnection={this.props.onConnection} />
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 37, flexDirection: 'column', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
        {this.props.devices.map(this.renderItem)}
      </View>
    )
  }
}
