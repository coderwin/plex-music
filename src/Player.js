import React from 'react'
import { View } from 'react-native-macos'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import PlaybackQueue from './PlaybackQueue'

import SeekBar from './SeekBar'
import PlaybackButtons from './PlaybackButtons'

@observer
export default class Player extends React.Component {
  @observable isSeeking = false

  handleSeek(time) {
    PlaybackQueue.seekTo(time)
  }

  pause() {
    PlaybackQueue.pause()
  }

  resume() {
    PlaybackQueue.resume()
  }

  togglePlayback() {
    PlaybackQueue.toggle()
  }

  render() {
    const { currentTime, duration } = PlaybackQueue
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 10 }}>
        <SeekBar style={{ flex: 1 }} currentTime={currentTime} duration={duration} onSlidingComplete={value => this.handleSeek(value)} onValueChange={() => { this.isSeeking = true }} />
        <View style={{ width: 10 }} />
        <PlaybackButtons />
      </View>
    )
  }
}
