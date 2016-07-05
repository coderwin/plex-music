import React from "react";
import {Image, Text, View, TouchableOpacity, Slider} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";

export default React.createClass({
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}
                        style={{padding: 10, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd"}}>
        {this.props.iconName && <Icon name={this.props.iconName} size={18}/>}
      </TouchableOpacity>
    )
  }
});