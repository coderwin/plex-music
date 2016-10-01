import React from 'react'

import { View, TextInput, Button, AsyncStorage } from 'react-native-macos'

import { observable, action } from 'mobx'
import { observer, inject } from 'mobx-react/native'

import { autobind } from 'core-decorators'

import DeviceList from './DeviceList'
import LoadingScreen from './LoadingScreen'

import Store from './Store'
import Account from './Account'
import Device from './Account/Device'
import Connection from './Connection'

@autobind
@observer
@inject('store')
export default class LoginScreen extends React.Component {
  props: {
    store: Store,
    onConnection: (connection: Connection) => *
  }

  @observable loginParams = {
    login: '',
    password: ''
  }

  componentWillMount() {
    this.performAutoLogin()
  }

  async performAutoLogin() {
    const loginParams = await this.props.store.getLoginParams()
    if (loginParams) {
      await this.performLogin(loginParams)
    }
  }

  async performLogin(loginParams) {
    const clientIdentifier = await this.props.store.getClientIdentifier()
    this.props.store.account.login(loginParams, clientIdentifier)
  }

  render() {
    const { store } = this.props

    if (store.isLoading) {
      return <LoadingScreen message="Connecting..." />
    }

    if (store.account.isLoggedIn) {
      return <DeviceList devices={store.account.devices} onConnection={this.props.onConnection} />
    }

    return (
      <View style={{ flex: 1, paddingTop: 37, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
        <View style={{ width: 300, flexDirection: 'column', alignItems: 'center' }}>
          <TextInput
            style={{ flex: 1, fontSize: 18, borderWidth: 0, height: 32 }}
            value={this.loginParams.login}
            placeholder={'Address'}
            onChangeText={(value) => { this.loginParams.login = value }}
          />
          <TextInput
            style={{ flex: 1, fontSize: 18, borderWidth: 0, height: 32 }}
            value={this.loginParams.password}
            placeholder={'Address'}
            onChangeText={(value) => { this.loginParams.password = value }}
          />
          <Button
            bezelStyle="rounded"
            style={{ marginTop: 10, width: 100, height: 40 }}
            onClick={() => store.login(this.loginParams)}
            title="Connect"
          />
        </View>
      </View>
    )
  }
}
