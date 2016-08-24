import React from 'react'
import { observer } from 'mobx-react/native'

import { Button, View } from 'react-native-macos'
import Icon from 'react-native-vector-icons/FontAwesome'

import PlaybackQueue from './PlaybackQueue'

@observer
export default class PlaybackButtons extends React.Component {
  state = {}

  componentWillMount() {
    Icon.getImageSource('fast-backward', 16, 'black').then((source) => {
      this.setState({ prevIcon: source })
    })

    Icon.getImageSource('pause', 16, 'black').then((source) => {
      this.setState({ pauseIcon: source })
    })

    Icon.getImageSource('play', 16, 'black').then((source) => {
      this.setState({ playIcon: source })
    })

    Icon.getImageSource('fast-forward', 16, 'black').then((source) => {
      this.setState({ nextIcon: source })
    })
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Button style={{ width: 64, height: 54 }} image={this.state.prevIcon} bezelStyle="rounded" onClick={() => PlaybackQueue.playPrev()} />
        <Button style={{ width: 64, height: 64, marginHorizontal: -8 }} image={PlaybackQueue.isPlaying ? this.state.pauseIcon : this.state.playIcon} bezelStyle="rounded" onClick={() => PlaybackQueue.toggle()} />
        <Button style={{ width: 64, height: 54 }} image={this.state.nextIcon} bezelStyle="rounded" onClick={() => PlaybackQueue.playNext()} />
      </View>
    )
  }
}