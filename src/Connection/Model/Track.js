import Model from './Model'

export default class Track extends Model {
  static parse(item, connection) {
    const { endpoint, token } = connection
    return new this(connection, {
      id: item.ratingKey,
      number: item.index,
      title: item.title.trim(),
      artistName: item.grandparentTitle.trim(),
      albumId: item.grandparentRatingKey,
      duration: item.duration,
      path: item._children[0]._children[0].file,
      url: `${endpoint}${item._children[0]._children[0].key}?X-Plex-Token=${encodeURIComponent(token)}`
    })
  }
}
