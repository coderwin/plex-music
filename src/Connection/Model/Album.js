import Model from './Model'

export default class Album extends Model {
  rate(rating: number) {
    const { endpoint, token } = this.connection

    return this.connection.request(`${endpoint}/:/rate?X-Plex-Token=${encodeURIComponent(token)}`, {
      params: {
        key: this.id,
        identifier: 'com.plexapp.plugins.library',
        rating
      }
    })
  }

  static parse(item, connection) {
    const { endpoint, token } = connection
    const thumbUrl = item.thumb && (`${endpoint}${item.thumb}`)
    return new this(connection, {
      id: item.ratingKey,
      title: item.title.trim(),
      artistName: item.parentTitle.trim(),
      year: item.year,
      userRating: item.userRating,
      addedAt: item.addedAt * 1000,
      playCount: item.viewCount,
      tag: [],
      genres: item._children.filter(c => c._elementType === 'Genre').map(e => e.tag.trim()),
      artwork: thumbUrl && (`${endpoint}/photo/:/transcode?url=${encodeURIComponent(thumbUrl)}&width=250&height=250&minSize=1&X-Plex-Token=${encodeURIComponent(token)}`)
    })
  }
}
