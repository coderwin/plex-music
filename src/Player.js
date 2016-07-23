import React from "react";
import {Image, Text, View, TouchableOpacity, Slider} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";
import Subscribable from "Subscribable";
import PlaybackQueue from "./PlaybackQueue";
import SeekBar from './SeekBar'
import PlaybackButtons from './PlaybackButtons'

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    return {
      currentTime: 0,
      duration: 0,
    }
  },

  componentWillMount() {
    this.addListenerOn(PlaybackQueue.events, 'time', this.handleTime);
    this.addListenerOn(PlaybackQueue.events, 'duration', this.handleDuration);
  },

  handleDuration(duration) {
    this.setState({duration: duration})
  },

  handleSeek(time) {
    PlaybackQueue.seekTo(time)
    this.setState({isSeeking: false})
  },

  handleTime(time) {
    if (!this.state.isSeeking) {
      this.setState({currentTime: time})
    }
  },

  pause() {
    PlaybackQueue.pause()
  },

  resume() {
    PlaybackQueue.resume()
  },

  togglePlayback() {
    PlaybackQueue.toggle()
  },

  render() {
    return (
      <View
        style={{flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", paddingHorizontal: 10}}>
        <SeekBar style={{flex: 1}} currentTime={this.state.currentTime} duration={this.state.duration} onSlidingComplete={(value) => this.handleSeek(value)} onValueChange={() => this.setState({isSeeking: true})} />
        <View style={{width: 10}}></View>
        <PlaybackButtons />
      </View>
    )
  },
});
