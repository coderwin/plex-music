import React from "react";
import Axios from "axios";

import {
  AsyncStorage,
  Image,
  TouchableOpacity,
  StyleSheet,
  ListView,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback
} from "react-native-desktop";
import connect from "./Connection";
import LoadingScreen from "./LoadingScreen";

export default React.createClass({
  getInitialState() {
    return {
      isLoading: false,
      address: "http://127.0.0.1:32400"
    }
  },

  componentWillMount() {
    AsyncStorage.getItem("previousAddress", (err, address) => {
      if (address) {
        this.performConnect(address)
      }
    });
  },

  performConnect(address) {
    this.setState({isLoading: true})
    connect(address).then(this.props.onConnection, (e) => {
      this.setState({isLoading: false})
      alert("Connection error.")
    }).then(() => {
      AsyncStorage.setItem("previousAddress", address)
    });
  },

  handleConnectPress() {
    performConnect(this.state.address)
  },

  performLogin() {
    // TODO
    // GET /api/v2/user HTTP/1.1

    // X-Plex-Client-Identifier:f926e8da-97bf-4751-b525-b83c27f66ccd
    // X-Plex-Device:OSX
    // X-Plex-Device-Name:Plex Web (Chrome)
    // X-Plex-Device-Screen-Resolution:2560x906,2560x1440
    // X-Plex-Platform:Chrome
    // X-Plex-Platform-Version:51.0
    // X-Plex-Product:Plex Web
    // X-Plex-Token:VN2hiSDNxbb5JxTG8RPW
    // X-Plex-Version:2.7.2

    // <user email="knoopx@gmail.com" id="181771" uuid="e43f59c5577ebb60" username="knoopx" title="knoopx" locale="" emailOnlyAuth="0" cloudSyncDevice="" thumb="https://plex.tv/users/e43f59c5577ebb60/avatar" authToken="VN2hiSDNxbb5JxTG8RPW" mailingListStatus="unsubscribed" mailingListActive="0" scrobbleTypes="" lastSignInAt="1467319285" restricted="0" home="0" guest="0" queueEmail="queue+sMy9nPSqHkXxRvGYgrUH@save.plex.tv" queueUid="61788f1adea1856d" homeSize="1" certificateVersion="2" rememberExpiresAt="1468528537">
    //   <profile autoSelectAudio="1" defaultAudioLanguage="es" defaultSubtitleLanguage="en" autoSelectSubtitle="0"/>
    //   <entitlements>
    //     <entitlement id="xbox_one"/>
    //   </entitlements>
    // </user>

    Axios.post("https://plex.tv/users/sign_in.json", {
      "user[login]": "knoopx",
      "user[password]": "kn11px",
      remember_me: "1"
    }).then((res) => {
      console.log(res.data);
      // https://plex.tv/api/v2/user
    }, (res) => {
      console.log(res.data)
    })
  },

  render() {
    if (this.state.isLoading) {
      return <LoadingScreen message="Connecting..."/>
    } else {
      return (
        <View
          style={{flex: 1, paddingTop: 37, flexDirection: "column", alignItems: "center", justifyContent: "space-around"}}>
          <View style={{width: 300, flexDirection: "column", alignItems:"center"}}>
            <TextInput
              style={{flex: 1, fontSize: 18, borderWidth: 0, height: 32}}
              value={this.state.address}
              placeholder={'Address'}
              onChangeText={(value) => this.setState({address: value})}
            />
            <TouchableOpacity style={{flex: 1, marginTop: 10, padding: 10, backgroundColor: "white"}}
                              onPress={this.handleConnectPress}>
              <Text style={{fontWeight: "bold"}}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }
});
