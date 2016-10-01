import Connection from '..'

export default class Model {
  connection: Connection
  props: {}
  constructor(connection: Connection, props: {}) {
    this.connection = connection
    Object.assign(this, props)
  }
}
