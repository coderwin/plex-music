import Axios from 'axios'
import { DOMParser } from 'xmldom'
import { AsyncStorage } from 'react-native-macos'
import { observable, action } from 'mobx'

import Device from './Device'

export type LoginParams = {login: string, password: string}

export default class Account {
  @observable devices: Array<Device>
  @observable isLoggedIn: boolean = false;

  @action async login(params: LoginParams, clientIdentifier: string) {
    const auth = await this.performLogin(params, clientIdentifier)

    if (auth) {
      this.devices = await this.fetchDevices(auth.authToken)
      await AsyncStorage.setItem('loginParams', JSON.stringify(params))
      this.isLoggedIn = true
    }
  }

  async fetchDevices(authToken: string) {
    const res = await Axios.get('https://plex.tv/api/resources', { params: { 'X-Plex-Token': authToken, Accept: 'application/json' }, headers: { Accept: 'application/json' } })
    const doc = new DOMParser().parseFromString(res.data)
    return [...doc.getElementsByTagName('Device')].map(device => Device.parse(device)).filter(d => d.presence && d.provides === 'server')
  }

  async performLogin(params: LoginParams, clientIdentifier: string) {
    return Axios.post('https://plex.tv/api/v2/users/signin', params, {
      headers: {
        'X-Plex-Client-Identifier': clientIdentifier,
        'X-Plex-Device-Name': 'Plex Music',
        'X-Plex-Product': 'Plex Music',
        'X-Plex-Device': 'OSX',
        Accept: 'application/json'
      }
    })
  }
}
