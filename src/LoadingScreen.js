import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native-macos'

export default class LoadingScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
        <View>
          <ActivityIndicator size="large" style={{ marginBottom: 20 }} />
          {this.props.message && <Text>{this.props.message}</Text>}
        </View>
      </View>
    )
  }
}
