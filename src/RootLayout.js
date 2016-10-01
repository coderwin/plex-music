import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'
import { autobind } from 'core-decorators'
import { Text, View } from 'react-native-macos'

import Icon from 'react-native-vector-icons/FontAwesome'
import ServerScreen from './ServerScreen'
import LoginScreen from './LoginScreen'
import Connection from './Connection'

@observer
@autobind
export default class RootLayout extends React.Component {
  @observable connection: Connection;

  handleConnection(connection: Connection) {
    this.connection = connection
  }

  handleDisconnect() {
    this.connection = null
  }

  render() {
    if (this.connection) {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ flexDirection: 'row', height: 37, alignItems: 'center', paddingHorizontal: 16 }}>
            <View style={{ flex: 1 }} />
            <Text style={{ fontWeight: 'bold' }}>{this.connection.friendlyName}</Text>
            <View style={{ width: 16 }} />
            <Icon name="eject" size={18} onPress={this.handleDisconnect} />
          </View>
          <View style={{ height: 1, backgroundColor: '#ddd' }} />
          <ServerScreen connection={this.connection} />
        </View>
      )
    }

    return <LoginScreen ref="login" onConnection={this.handleConnection} />
  }
}
