import React from "react";
import {Image, Text, View, TouchableOpacity, Slider} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";
import Subscribable from "Subscribable";
import {formatDuration} from "./Support";
import PlaybackQueue from "./PlaybackQueue";

Button = React.createClass({
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}
                        style={{padding: 10, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd"}}>
        <Icon name={this.props.iconName} size={18}/>
      </TouchableOpacity>
    )
  }
});

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    return {
      isPlaying: PlaybackQueue.isPlaying,
      currentTime: 0,
      duration: 0,
    }
  },

  componentWillMount() {
    this.addListenerOn(PlaybackQueue.events, 'play', this.handlePlay);
    this.addListenerOn(PlaybackQueue.events, 'pause', this.handlePause);
    this.addListenerOn(PlaybackQueue.events, 'time', this.handleTime);
    this.addListenerOn(PlaybackQueue.events, 'duration', this.handleDuration);
  },

  handleDuration(duration) {
    this.setState({duration: duration})
  },

  handlePause(item) {
    this.setState({isPlaying: false})
  },

  handlePlay(item) {
    this.setState({isPlaying: true})
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
        style={{flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#eee", paddingHorizontal: 10}}>
        <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
          <Text>{formatDuration(this.state.currentTime)}</Text>
          <View style={{width: 10}}></View>
          <Slider style={{flex: 1}} value={this.state.currentTime} maximumValue={this.state.duration}
                  onSlidingComplete={(value) => {this.handleSeek(value)}}
                  onValueChange={() => this.setState({isSeeking: true})}/>
          <View style={{width: 10}}></View>
          <Text>{formatDuration(this.state.duration)}</Text>
        </View>

        <View style={{width: 10}}></View>

        <View style={{flexDirection: "row", alignItems: "center"}}>
          <Button iconName="fast-backward" onPress={() => PlaybackQueue.playPrev() }/>
          <View style={{width: 2}}></View>
          <Button iconName={this.state.isPlaying ? "pause" : "play"} onPress={() => PlaybackQueue.toggle() }/>
          <View style={{width: 2}}></View>
          <Button iconName="fast-forward" onPress={() => PlaybackQueue.playNext() }/>
        </View>
      </View>
    )
  },
});
