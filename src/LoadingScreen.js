import React from "react";
import {View, Text, ActivityIndicatorIOS} from "react-native-desktop";

export default React.createClass({
  render() {
    return (
      <View
        style={{flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "space-around"}}>
        <View>
          <ActivityIndicatorIOS size="large" style={{marginBottom: 20}}/>
          {this.props.message && <Text>{this.props.message}</Text>}
        </View>
      </View>
    )
  }
});