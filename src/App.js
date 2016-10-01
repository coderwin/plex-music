import React from 'react'
import { observer, Provider } from 'mobx-react/native'

import Store from './Store'
import RootLayout from './RootLayout'

const store = new Store()

@observer
export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <RootLayout />
      </Provider>
    )
  }
}
