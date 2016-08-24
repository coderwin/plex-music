import Axios from 'axios'
import sortBy from 'thenby'

import Artist from './Artist'
import Album from './Album'

export default function connect(endpoint, token = 'VN2hiSDNxbb5JxTG8RPW') {
  function request(path, query = {}) {
    return Axios.get(`${endpoint}${path}`, {
      params: query,
      headers: {
        Accept: 'application/json',
        'X-Plex-Token': token
      }
    }).then(res => res.data)
  }

  function fetchSections() {
    return request('/library/sections').then(doc =>
      doc._children.map(item => ({
        id: item.key,
        type: item.type,
        name: item.title
      }))
    )
  }

  return request('/').then((info) => {
    return fetchSections().then((sections) => {
      const section = sections.filter(c => c.type === 'artist')[0]
      if (section) {
        return {
          friendlyName: info.friendlyName,
          rate(id, rating) {
            return request('/:/rate', {
              key: id,
              rating,
              identifier: 'com.plexapp.plugins.library'
            })
          },
          artists: {
            findAll(query) {
              return request(`/library/sections/${section.id}/all`, { type: 8, ...query }).then(doc => ({
                artists: doc._children.map(a => Artist.parse(a, { endpoint, token })),
                totalSize: Number(doc.totalSize)
              }))
            }
          },
          tracks: {
            findAllByAlbumId(albumId) {
              return request(`/library/metadata/${albumId}/children`, {
                includeRelated: 0
              }).then((doc) => {
                const tracks = doc._children.map(item => (
                  {
                    id: item.ratingKey,
                    number: item.index,
                    title: item.title.trim(),
                    artistName: item.grandparentTitle.trim(),
                    albumId: item.grandparentRatingKey,
                    duration: item.duration,
                    path: item._children[0]._children[0].file,
                    url: `${endpoint}${item._children[0]._children[0].key}?X-Plex-Token=${encodeURIComponent(token)}`
                  }
                ))

                return tracks.sort(sortBy('path').thenBy('number'))
              })
            }
          },
          albums: {
            find(id) {
              return request(`/library/metadata/${id}`).then(doc => Album.parse(doc.MediaContainer.Directory[0], { endpoint, token }))
            },
            findAll(query) {
              return request(`/library/sections/${section.id}/all`, { type: 9, ...query }).then(doc =>
                doc._children.map(a => Album.parse(a, { endpoint, token }))
              )
            }
          }
        }
      }
    })
  })
}
