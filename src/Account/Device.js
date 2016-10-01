import Connection from './Connection'

export default class Device {
  name: string
  product: string
  productVersion: string
  platform: string
  platformVersion: string
  clientIdentifier: string
  clientIdentifier: string
  connections: Array<Connection>

  constructor(props: {}) {
    Object.assign(this, props)
  }

  static parse(device) {
    return new this({
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
      connections: Array.from(device.getElementsByTagName('Connection')).map(item => Connection.parse(item))
    })
  }
}
