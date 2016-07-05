import React from "react";
import {Image, Text, View, TouchableWithoutFeedback} from "react-native-desktop";
import PlaybackQueue from "./PlaybackQueue";
import Subscribable from "Subscribable";

export default React.createClass({
  mixins: [Subscribable.Mixin],
  getInitialState() {
    return {
      item: PlaybackQueue.playlist[PlaybackQueue.activeIndex]
    }
  },

  componentWillMount(){
    this.addListenerOn(PlaybackQueue.events, 'play', this.handlePlay);
  },

  handlePlay(activeItem) {
    this.setState({item: activeItem})
  },

  render() {
    const item = this.state.item
    if (item) {
      return (
        <View
          style={{flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", padding: 10}}>
          <Image style={{width: 64, height: 64, borderRadius: 4}} source={{uri: item.album.artwork}}/>
          <View style={{width: 10}}/>
          <View style={{flexDirection: "column"}}>
            <Text style={{fontWeight: "bold"}}>{item.track.title}</Text>
            <Text>{item.album.title}</Text>
            <Text style={{color: "#888"}}>{item.track.artistName}</Text>
          </View>
        </View>
      )
    } else {
      return <View style={{flex: 1}}/>
    }
  },
});
