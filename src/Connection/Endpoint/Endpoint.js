import Connection from '..'

export default class Endpoint {
  connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
  }
}
