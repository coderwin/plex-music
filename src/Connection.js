import Axios from "axios";
import sortBy from "thenby";

export default function connect(endpoint) {
  function request(path, query = {}) {
    return Axios.get(`${endpoint}${path}`, {
      params: query,
      headers: {'Accept': 'application/json'}
    }).then(res => {
      return res.data
    });
  };

  function fetchSections() {
    return request("/library/sections").then(doc => {
      return doc._children.map(item => ({
        id: item.key,
        type: item.type,
        name: item.title
      }));
    });
  };

  function buildAlbum(item) {
    var thumbUrl = item.thumb && (`${endpoint}${item.thumb}`);
    return {
      id: item.ratingKey,
      title: item.title.trim(),
      artistName: item.parentTitle.trim(),
      year: item.year,
      userRating: item.userRating,
      addedAt: item.addedAt * 1000,
      playCount: item.viewCount,
      tag: [],
      genres: item._children.filter((c) => c._elementType == "Genre").map(e => e.tag.trim()),
      artwork: thumbUrl && (`${endpoint}/photo/:/transcode?url=${encodeURIComponent(thumbUrl)}&width=250&height=250&minSize=1`),
      rate(value) {
        return Axios.get(`${endpoint}/:/rate`, {
          params: {
            key: this.id,
            identifier: "com.plexapp.plugins.library",
            rating: value
          }
        })
      }
    };
  };

  function buildArtist(item) {
    var thumbUrl = item.thumb && (`${endpoint}${item.thumb}`);
    return {
      id: item.ratingKey,
      name: item.title.trim(),
      addedAt: item.addedAt * 1000,
      artwork: thumbUrl && (`${endpoint}/photo/:/transcode?url=${encodeURIComponent(thumbUrl)}&width=250&height=250&minSize=1`)
    };
  };

  return request(`/`).then((info) => {
    return fetchSections().then(sections => {
      var section;
      if (section = sections.filter(c => c.type === "artist")[0]) {
        return {
          friendlyName: info.friendlyName,
          rate(id, rating) {
            return request("/:/rate", {
              key: id,
              rating: rating,
              identifier: "com.plexapp.plugins.library"
            });
          },
          artists: {
            findAll(query) {
              return request(`/library/sections/${section.id}/all`, {type: 8, ...query}).then(doc => {
                return {
                  artists: doc._children.map(buildArtist),
                  totalSize: Number(doc.totalSize)
                };
              });
            }
          },
          tracks: {
            findAllByAlbumId(albumId) {
              return request(`/library/metadata/${albumId}/children`, {
                includeRelated: 0
              }).then(doc => {
                const tracks = doc._children.map(item => {
                  return {
                    id: item.ratingKey,
                    number: item.index,
                    title: item.title.trim(),
                    artistName: item.grandparentTitle.trim(),
                    albumId: item.grandparentRatingKey,
                    duration: item.duration,
                    path: item._children[0]._children[0].file,
                    url: `${endpoint}${item._children[0]._children[0].key}`
                  }
                })

                return tracks.sort(sortBy("path").thenBy("number"))
              });
            }
          },
          albums: {
            find(id) {
              return request(`/library/metadata/${id}`).then(doc => buildAlbum(doc.MediaContainer.Directory[0]));
            },
            findAll(query) {
              return request(`/library/sections/${section.id}/all`, {type: 9, ...query}).then(doc => {
                return doc._children.map(buildAlbum)
              });
            }
          }
        };
      }
    })
  });
}
