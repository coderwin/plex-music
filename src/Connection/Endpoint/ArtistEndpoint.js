import Endpoint from './Endpoint'

import { Artist } from '../Model'

export default class ArtistEndpoint extends Endpoint {
  findAll(query: {}) {
    const doc = this.connection.request(`/library/sections/${section.id}/all`, { type: 8, ...query })

    return ({
      artists: doc._children.map(a => Artist.parse(a, this.connection)),
      totalSize: Number(doc.totalSize)
    })
  }
}
