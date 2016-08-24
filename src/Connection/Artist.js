export default class Artist {
  static parse(item, connection) {
    const { endpoint, token } = connection
    const thumbUrl = item.thumb && (`${endpoint}${item.thumb}`)
    return new this({
      id: item.ratingKey,
      name: item.title.trim(),
      addedAt: item.addedAt * 1000,
      artwork: thumbUrl && (`${endpoint}/photo/:/transcode?url=${encodeURIComponent(thumbUrl)}&width=250&height=250&minSize=1&X-Plex-Token=${encodeURIComponent(token)}`)
    })
  }
}
