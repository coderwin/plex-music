import Endpoint from './Endpoint'
import { Album } from '../Model'

export default class AlbumEndpoint extends Endpoint {
  find(id: number) {
    return this.connection.request(`/library/metadata/${id}`).then(doc => Album.parse(doc.MediaContainer.Directory[0], this.connection))
  }

  findAll(query: {}) {
    return this.connection.request(`/library/sections/${section.id}/all`, { type: 9, ...query }).then(doc =>
      doc._children.map(a => Album.parse(a, this.connection))
    )
  }
}
