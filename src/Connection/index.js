import Axios from 'axios'

import { SectionEndpoint, AlbumEndpoint, ArtistEndpoint, TrackEndpoint } from './Endpoint'

export default class Connection {
  endpoint: string
  token: string
  friendlyName: string

  albums: AlbumEndpoint
  artists: ArtistEndpoint
  sections: SectionEndpoint
  tracks: TrackEndpoint

  constructor(endpoint: string, token: string) {
    this.endpoint = endpoint
    this.token = token
    this.albums = new AlbumEndpoint(this)
    this.artists = new ArtistEndpoint(this)
    this.sections = new SectionEndpoint(this)
    this.tracks = new TrackEndpoint(this)
    this.connect()
  }

  async connect() {
    const info = await this.request('/')
    this.friendlyName = info.friendlyName
  }

  async request(path: string, query = {}) {
    const { endpoint, token } = this
    const res = await Axios.get(`${endpoint}${path}`, {
      params: query,
      headers: {
        Accept: 'application/json',
        'X-Plex-Token': token
      }
    })

    return res.data
  }
}
