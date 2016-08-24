import React from 'react'
import { observer } from 'mobx-react/native'
import { Text, View, Slider } from 'react-native-macos'

import { formatDuration } from './Support'

export default class SeekBar extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text>{formatDuration(this.props.currentTime)}</Text>
        <View style={{ width: 10 }} />
        <Slider
          style={{ flex: 1 }}
          value={this.props.currentTime}
          maximumValue={this.props.duration}
          onSlidingComplete={this.props.onSlidingComplete}
          onValueChange={this.props.onValueChange}
        />
        <View style={{ width: 10 }} />
        <Text>{formatDuration(this.props.duration)}</Text>
      </View>
    )
  }
}
