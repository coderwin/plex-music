import React from 'react';
import {Image, Button, Text, View, TouchableOpacity, Slider} from "react-native-desktop";
import Subscribable from "Subscribable";
import PlaybackQueue from "./PlaybackQueue";
import Icon from "react-native-vector-icons/FontAwesome";

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    return {
      isPlaying: PlaybackQueue.isPlaying,
    }
  },

  handlePlay(item) {
    this.setState({isPlaying: true})
  },

  handlePause(item) {
    this.setState({isPlaying: false})
  },

  componentWillMount() {
    this.addListenerOn(PlaybackQueue.events, 'play', this.handlePlay);
    this.addListenerOn(PlaybackQueue.events, 'pause', this.handlePause);

    Icon.getImageSource('fast-backward', 16, 'black').then((source) => {
      this.setState({prevIcon: source});
    });

    Icon.getImageSource('pause', 16, 'black').then((source) => {
      this.setState({pauseIcon: source});
    });

    Icon.getImageSource('play', 16, 'black').then((source) => {
      this.setState({playIcon: source});
    });

    Icon.getImageSource('fast-forward', 16, 'black').then((source) => {
      this.setState({nextIcon: source});
    });
  },

  render() {
    return (
      <View style={{flexDirection: "row", alignItems: "center"}}>
        <Button style={{width: 64, height: 54}} image={this.state.prevIcon} bezelStyle='rounded' onClick={() => PlaybackQueue.playPrev() } />
        <Button style={{width: 64, height: 64, marginHorizontal: -8}} image={this.state.isPlaying ? this.state.pauseIcon : this.state.playIcon} bezelStyle='rounded' onClick={() => PlaybackQueue.toggle() } />
        <Button style={{width: 64, height: 54}} image={this.state.nextIcon} bezelStyle='rounded' onClick={() => PlaybackQueue.playNext() } />
      </View>
    )
  },
});
