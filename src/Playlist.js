import React from 'react'
import { observer } from 'mobx-react/native'
import { autobind } from 'core-decorators'
import { Image, ListView, Text, View, TouchableOpacity } from 'react-native-macos'
import { computed, reaction } from 'mobx'

import PlaybackQueue from './PlaybackQueue'

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
})

@observer
@autobind
export default class extends React.Component {
  componentWillMount() {
    reaction(() => PlaybackQueue.activeItem, () => { this.refs.listView.forceUpdate() })
  }

  @computed get dataSource() {
    return dataSource.cloneWithRows(PlaybackQueue.playlist.toJS())
  }

  handlePress(item) {
    PlaybackQueue.playItemAtIndex(PlaybackQueue.playlist.indexOf(item))
  }

  renderRow(row, index) {
    const backgroundColor = row === PlaybackQueue.activeItem ? '#f0f0f0' : 'transparent'

    return (
      <TouchableOpacity onPress={() => { this.handlePress(row) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor, padding: 8 }}>
          <Image style={{ width: 32, height: 32, borderRadius: 4 }} source={{ uri: row.album.artwork }} />
          <View style={{ width: 10 }} />
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ fontWeight: 'bold' }}>{row.track.title}</Text>
            <Text style={{ color: '#888' }}>{row.track.artistName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ListView
        ref="listView"
        style={{ flex: 1 }}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        showsVerticalScrollIndicator
      />
    )
  }
}
