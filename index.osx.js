import React from "react";
import {
  Image,
  AppRegistry,
  StyleSheet,
  ListView,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  AsyncStorage,
  NativeModules
} from "react-native-desktop";

import Icon from "react-native-vector-icons/FontAwesome";
import ServerScreen from "./src/ServerScreen";
import LoginScreen from "./src/LoginScreen";

console.ignoredYellowBox = ['Warning: In next release empty section headers will be rendered'];

const Application = React.createClass({
  getInitialState() {
    return {}
  },
  componentWillMount() {
    AsyncStorage.getItem("previousAddress", (err, address) => {
      if (address) {
        this.refs.login.performConnect(address)
      }
    });
  },

  handleConnection(connection) {
    this.setState({connection: connection})
  },
  handleDisconnect() {
    console.log("handleDisconnect")
    this.setState({connection: null})
  },
  render(){
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        {this.renderToolbar()}
        <View style={{height: 1, backgroundColor: "#ddd"} }/>
        {this.renderContent()}
      </View>
    )
  },
  renderToolbar() {
    if (this.state.connection) {
      return (
        <View style={{flexDirection: 'row', height: 37, alignItems: "center", paddingHorizontal: 16}}>
          <View style={{flex: 1}}/>
          <Text style={{fontWeight: "bold"}}>{this.state.connection.friendlyName}</Text>
          <View style={{width: 16}}/>
          <Icon name="eject" size={18} onPress={this.handleDisconnect}/>
        </View>
      )
    } else {
      <View style={{flex: 1}}/>
    }
  },
  renderContent() {
    if (this.state.connection) {
      return <ServerScreen connection={this.state.connection}/>
    } else {
      return <LoginScreen ref="login" onConnection={this.handleConnection} />
    }
  }
});

AppRegistry.registerComponent('Application', () => Application);
