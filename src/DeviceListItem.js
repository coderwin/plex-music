import React from 'react'
import moment from 'moment'
import { autobind } from 'core-decorators'

import { View, Text, TouchableOpacity } from 'react-native-macos'

import connect from './Connection'

@autobind
export default class DeviceListItem extends React.Component {
  props: {
    onConnection: () => *,
    device: Object
  }

  async onPress() {
    const { device } = this.props
    const { uri } = device.connections.find(c => device.publicAddressMatches && c.local)
    try {
      const connection = await connect(uri, device.accessToken)
      this.props.onConnection(connection)
    } catch (err) {
      alert(err)
    }
  }

  render() {
    const { device } = this.props
    return (
      <TouchableOpacity key={device.clientIdentifier} onPress={this.onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'column', marginRight: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{device.name}</Text>
            <Text>{moment(device.lastSeenAt).fromNow()}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14 }}>{device.product} ({device.productVersion})</Text>
            <Text style={{ fontSize: 12 }}>{device.platform} ({device.platformVersion})</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}
