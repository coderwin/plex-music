import Axios from "axios";
import {DOMParser} from "xmldom";
import sortBy from "thenby";

export default function connect(endpoint) {
  function request(path, query = {}) {
    return Axios.get(`${endpoint}${path}`, {
      params: query
    }).then(res => {
      return (new DOMParser).parseFromString(res.data).documentElement
    });
  };

  function fetchSections() {
    return request("/library/sections").then(doc => {
      return Array.prototype.slice.call(doc.getElementsByTagName("Directory")).map(item => ({
        id: item.getAttribute("key"),
        type: item.getAttribute("type"),
        name: item.getAttribute("title")
      }));
    });
  };

  function buildAlbum(item) {
    var thumbUrl = item.getAttribute("thumb") && (`${endpoint}${item.getAttribute("thumb")}`);
    return {
      id: item.getAttribute("ratingKey"),
      title: item.getAttribute("title"),
      artistName: item.getAttribute("parentTitle"),
      year: item.getAttribute("year"),
      userRating: item.getAttribute("userRating"),
      addedAt: item.getAttribute("addedAt") * 1000,
      playCount: item.getAttribute("viewCount"),
      tag: [],
      genres: Array.prototype.slice.call(item.getElementsByTagName("Genre")).map(e => e.getAttribute("tag")),
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
    var thumbUrl = item.getAttribute("thumb") && (`${endpoint}${item.getAttribute("thumb")}`);
    return {
      id: item.getAttribute("ratingKey"),
      name: item.getAttribute("title"),
      addedAt: item.getAttribute("addedAt") * 1000,
      artwork: thumbUrl && (`${endpoint}/photo/:/transcode?url=${encodeURIComponent(thumbUrl)}&width=250&height=250&minSize=1`)
    };
  };

  return request(`/`).then((info) => {
    return fetchSections().then(sections => {
      var section;
      if (section = sections.filter(c => c.type === "artist")[0]) {
        return {
          friendlyName: info.getAttribute("friendlyName"),
          rate(id, rating) {
            return request("/:/rate", {
              key: id,
              rating: rating,
              identifier: "com.plexapp.plugins.library"
            });
          },
          artists: {
            findAll(query) {
              return request(`/library/sections/${section.id}/all`, Object.assign({
                sort: "titleSort:asc"
              }, query, {
                type: 8
              })).then(doc => {
                return {
                  artists: doc.MediaContainer.Directory.map(buildArtist),
                  totalSize: Number(doc.MediaContainer.getAttribute("totalSize"))
                };
              });
            }
          },
          tracks: {
            findAllByAlbumId(albumId) {
              return request(`/library/metadata/${albumId}/children`, {
                includeRelated: 0
              }).then(doc => {
                const tracks = Array.prototype.slice.call(doc.getElementsByTagName("Track")).map(item => {
                  return {
                    id: item.getAttribute("ratingKey"),
                    number: item.getAttribute("index"),
                    title: item.getAttribute("title"),
                    artistName: item.getAttribute("grandparentTitle"),
                    albumId: item.getAttribute("grandparentRatingKey"),
                    duration: item.getAttribute("duration"),
                    path: item.getElementsByTagName("Part")[0].getAttribute("file"),
                    url: `${endpoint}${item.getElementsByTagName("Media")[0].getElementsByTagName("Part")[0].getAttribute("key")}`
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
              return request(`/library/sections/${section.id}/all`, Object.assign({
                sort: "artist.titleSort,album.year:asc"
              }, query, {
                type: 9
              })).then(doc => {
                return {
                  albums: Array.prototype.slice.call(doc.getElementsByTagName("Directory")).map(buildAlbum),
                  totalSize: Number(doc.getAttribute("totalSize"))
                };
              });
            }
          }
        };
      }
    })
  });
}
