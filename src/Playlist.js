import React from "react";
import Subscribable from "Subscribable";
import {Image, ListView, Text, View, TouchableOpacity} from "react-native-desktop";
import PlaybackQueue from "./PlaybackQueue";

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true
    });

    return {
      dataSource: dataSource.cloneWithRows(PlaybackQueue.playlist),
    };
  },

  componentWillMount() {
    this.addListenerOn(PlaybackQueue.events, 'change', this.handleChange);
    this.addListenerOn(PlaybackQueue.events, 'play', this.handlePlay);
    this.addListenerOn(PlaybackQueue.events, 'stop', this.handleStop);
  },

  handleChange(playlist) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(Array.prototype.slice.call(playlist).reverse())
    })
  },

  handlePlay(item) {
    this.setState({activeItem: item})
  },

  handlePress(item) {
    PlaybackQueue.playItemAtIndex(PlaybackQueue.playlist.indexOf(item));
  },

  handleStop(item) {
    this.setState({activeItem: null})
  },

  renderRow(row) {
    const backgroundColor = this.state.activeItem == row ? "#eee" : null;

    return (
      <TouchableOpacity onPress={() => { this.handlePress(row) }}>
        <View
          style={{flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#ddd", backgroundColor: backgroundColor, padding: 8}}>
          <Image style={{width: 32, height: 32, borderRadius: 4}} source={{uri: row.album.artwork}}/>
          <View style={{width: 10}}/>
          <View style={{flexDirection: "column"}}>
            <Text style={{fontWeight: "bold"}}>{row.track.title}</Text>
            <Text style={{color: "#888"}}>{row.track.artistName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  },

  render() {
    return <ListView style={{flex: 1}} dataSource={this.state.dataSource} renderRow={this.renderRow}
                     showsVerticalScrollIndicator={true}/>
  }
});
