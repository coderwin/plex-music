import React from "react";
import {
  Image,
  AppRegistry,
  StyleSheet,
  ListView,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback
} from "react-native-desktop";

import Subscribable from "Subscribable";
import Playlist from "./Playlist";
import NowPlaying from "./NowPlaying";
import AlbumListScreen from "./AlbumListScreen";
import Player from "./Player";
import PlaybackQueue from "./PlaybackQueue";

class NavButton extends React.Component {
  render() {
    return (
      <TouchableHighlight
        style={styles.button}
        underlayColor="#B5B5B5"
        onPress={this.props.onPress}>
        <Text style={styles.buttonText}>{this.props.text}</Text>
      </TouchableHighlight>
    );
  }
}

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    return {
      isPlaying: PlaybackQueue.isPlaying
    }
  },

  componentWillMount() {
    this.addListenerOn(PlaybackQueue.events, 'play', this.handlePlay);
    this.addListenerOn(PlaybackQueue.events, 'stop', this.handleStop);
  },

  handlePlay(item) {
    this.setState({isPlaying: true})
  },

  handleStop(item) {
    this.setState({isPlaying: false})
  },

  renderToolbar() {
    return (
      <View style={{flexDirection: 'row', height: 37, paddingHorizontal: 8}}>
        <View style={{flex: 1}}/>
        <Text style={{fontWeight: "bold"}}>{this.props.connection.friendlyName}</Text>
      </View>
    )
  },

  renderPlayerBar() {
    if (this.state.isPlaying) {
      return (
        <View style={{flexDirection: 'row', borderTopWidth: 1, borderColor: "#ddd"}}>
          <NowPlaying />
          <Player />
        </View>
      );
    }
  },

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {this.renderToolbar()}

        <View style={{flex: 1}}>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: "white"}}>
            <AlbumListScreen connection={this.props.connection}/>
            <View style={{width: 1, backgroundColor: "#ddd"}}/>
            <Playlist />
          </View>

          {this.renderPlayerBar()}
        </View>
      </View>
    );
  }
});
