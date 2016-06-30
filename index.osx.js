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
  NativeModules,
} from "react-native-desktop";
import ServerScreen from "./src/ServerScreen";
import LoginScreen from "./src/LoginScreen";

console.ignoredYellowBox = ['Warning: In next release empty section headers will be rendered'];

const Application = React.createClass({
  getInitialState() {
    return {}
  },

  handleConnection(connection) {
    this.setState({connection: connection})
  },

  render() {
    if (this.state.connection) {
      return <ServerScreen connection={this.state.connection}/>
    } else {
      return <LoginScreen onConnection={this.handleConnection}/>
    }
  }
});

AppRegistry.registerComponent('Application', () => Application);
