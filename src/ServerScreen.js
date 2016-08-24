import React from 'react'
import { View } from 'react-native-macos'
import { observer } from 'mobx-react/native'

import PlaybackQueue from './PlaybackQueue'
import Playlist from './Playlist'
import NowPlaying from './NowPlaying'
import AlbumListScreen from './AlbumListScreen'
import Player from './Player'

@observer
export default class ServerScreen extends React.Component {
  renderPlayerBar() {
    if (PlaybackQueue.activeItem) {
      return (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#ddd' }}>
          <NowPlaying />
          <Player />
        </View>
      )
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
          <AlbumListScreen connection={this.props.connection} />
          <View style={{ width: 1, backgroundColor: '#ddd' }} />
          <Playlist />
        </View>

        {this.renderPlayerBar()}
      </View>
    )
  }
}
