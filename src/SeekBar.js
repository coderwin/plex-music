import React from 'react';
import {Image, Text, View, TouchableOpacity, Slider} from "react-native-desktop";
import {formatDuration} from "./Support";

export default React.createClass({
  render(){
    return (
      <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
        <Text>{formatDuration(this.props.currentTime)}</Text>
        <View style={{width: 10}}></View>
        <Slider style={{flex: 1}} value={this.props.currentTime} maximumValue={this.props.duration}
                onSlidingComplete={this.props.onSlidingComplete}
                onValueChange={this.props.onValueChange} />
        <View style={{width: 10}}></View>
        <Text>{formatDuration(this.props.duration)}</Text>
      </View>
    )
  }
})
