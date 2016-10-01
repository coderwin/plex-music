import sortBy from 'thenby'

import Endpoint from './Endpoint'
import { Track } from '../Model'

export default class TrackEndpoint extends Endpoint {

  async findAllByAlbumId(albumId: string) {
    const doc = await this.connection.request(`/library/metadata/${albumId}/children`, {
      includeRelated: 0
    })

    const tracks = doc._children.map(item => Track.parse(item, this.connection))

    return tracks.sort(sortBy('path').thenBy('number'))
  }
}
