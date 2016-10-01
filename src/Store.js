import Account from './Account'
import UUID from 'uuid'
import { observable, action } from 'mobx'
import { AsyncStorage } from 'react-native-macos'

export default class Store {
  account: Account = new Account();
  @observable isLoading: boolean;

  @action async getLoginParams() {
    const loginParams = await AsyncStorage.getItem('loginParams')
    if (loginParams) {
      return JSON.parse(loginParams)
    }
    return null
  }

  @action async getClientIdentifier() {
    const value = await AsyncStorage.getItem('X-Plex-Client-Identifier')
    if (value) {
      return value
    }

    const newValue = UUID.v4()
    await AsyncStorage.setItem('X-Plex-Client-Identifier', newValue)
    return newValue
  }
}
