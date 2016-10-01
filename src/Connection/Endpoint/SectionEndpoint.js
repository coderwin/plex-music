import Endpoint from './Endpoint'
import { Section } from '../Model'

export default class SectionEndpoint extends Endpoint {
  async findAll() {
    const doc = await this.connection.request('/library/sections')
    return doc._children.map(Section.parse)
  }
}
