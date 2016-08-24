import React from 'react'
import Axios from 'axios'
import { DOMParser } from 'xmldom'
import UUID from 'uuid'

import { View, TextInput, Button, AsyncStorage } from 'react-native-macos'

import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react/native'

import { autobind } from 'core-decorators'

import DeviceList from './DeviceList'
import LoadingScreen from './LoadingScreen'


@autobind
@observer
export default class LoginScreen extends React.Component {
  static propTypes = {
    onConnection: React.PropTypes.func.isRequired
  }

  @observable isLoading = false
  @observable isLoggedIn = false
  @observable devices = []
  @observable loginParams = {
    login: '',
    password: ''
  }

  componentWillMount() {
    this.getLoginParams()
  }

  async getClientIdentifier() {
    const value = await AsyncStorage.getItem('X-Plex-Client-Identifier')
    if (value) {
      return value
    }

    const newValue = UUID.v4()
    await AsyncStorage.setItem('X-Plex-Client-Identifier', newValue)
    return newValue
  }

  async getLoginParams() {
    const loginParams = await AsyncStorage.getItem('loginParams')
    if (loginParams) {
      this.loginParams = JSON.parse(loginParams)
      this.performLogin()
    }
  }

  async login(params) {
    const headers = {
      'X-Plex-Client-Identifier': await this.getClientIdentifier(),
      'X-Plex-Device-Name': 'Plex Music',
      'X-Plex-Product': 'Plex Music',
      'X-Plex-Device': 'OSX',
      Accept: 'application/json'
    }

    return Axios.post('https://plex.tv/api/v2/users/signin', params, { headers })
  }

  async performLogin() {
    this.isLoading = true
    try {
      const auth = await this.login(toJS(this.loginParams))
      const res = await Axios.get('https://plex.tv/api/resources', { params: { 'X-Plex-Token': auth.data.authToken, Accept: 'application/json' }, headers: { Accept: 'application/json' } })
      const doc = new DOMParser().parseFromString(res.data)

      this.devices = [...doc.getElementsByTagName('Device')].map(device => ({
        name: device.getAttribute('name'),
        product: device.getAttribute('product'),
        productVersion: device.getAttribute('productVersion'),
        platform: device.getAttribute('platform'),
        platformVersion: device.getAttribute('platformVersion'),
        clientIdentifier: device.getAttribute('clientIdentifier'),
        createdAt: parseInt(device.getAttribute('createdAt')) * 1000,
        lastSeenAt: parseInt(device.getAttribute('lastSeenAt')) * 1000,
        provides: device.getAttribute('provides'),
        owned: parseInt(device.getAttribute('owned')),
        accessToken: device.getAttribute('accessToken'),
        httpsRequired: parseInt(device.getAttribute('httpsRequired')),
        synced: parseInt(device.getAttribute('synced')),
        relay: parseInt(device.getAttribute('relay')),
        publicAddressMatches: parseInt(device.getAttribute('publicAddressMatches')),
        presence: parseInt(device.getAttribute('presence')),
        connections: Array.from(device.getElementsByTagName('Connection')).map(connection => ({
          protocol: connection.getAttribute('protocol'),
          address: connection.getAttribute('address'),
          port: parseInt(connection.getAttribute('port')),
          uri: connection.getAttribute('uri'),
          local: parseInt(connection.getAttribute('local'))
        }))
      })).filter(d => d.presence && d.provides === 'server')

      console.log(this.devices)

      await AsyncStorage.setItem('loginParams', JSON.stringify(this.loginParams))
      this.isLoading = false
      this.isLoggedIn = true
    } catch (err) {
      this.isLoading = false
      // await AsyncStorage.removeItem('loginParams')
      alert(err)
    }
  }

  render() {
    if (this.isLoading) {
      return <LoadingScreen message="Connecting..." />
    }

    if (this.isLoggedIn) {
      return <DeviceList devices={this.devices} onConnection={this.props.onConnection} />
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
            onClick={() => this.performLogin()}
            title="Connect"
          />
        </View>
      </View>
    )
  }
}
