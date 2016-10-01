export default class Connection {
  constructor(props) {
    Object.assign(this, props)
  }

  static parse(connection) {
    return new this({
      protocol: connection.getAttribute('protocol'),
      address: connection.getAttribute('address'),
      port: parseInt(connection.getAttribute('port')),
      uri: connection.getAttribute('uri'),
      local: parseInt(connection.getAttribute('local'))
    })
  }
}
