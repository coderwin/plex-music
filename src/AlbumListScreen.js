import React from "react";
import {Image, TouchableOpacity, StyleSheet, ListView, Text, TextInput, View, DeviceEventEmitter} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";
import PlaybackQueue from "./PlaybackQueue";
import LoadingScreen from "./LoadingScreen";
import _ from "lodash";
import Subscribable from "Subscribable";

export default React.createClass({
  mixins: [Subscribable.Mixin],

  filterAlbums(albums, value) {
    if (value) {
      return albums.filter(a => a.title.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0 || a.artistName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0);
    } else {
      return albums
    }
  },

  getInitialState() {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true
    })

    return {
      offset: 0,
      pageSize: 100,
      albums: [],
      dataSource: dataSource.cloneWithRows([]),
    };
  },

  componentWillMount() {
    this.handleSearch = _.debounce(this.handleSearch, 100)
    this.addListenerOn(DeviceEventEmitter, 'Search', this.handleSearch);

    this.setState({isLoading: true});
    this.props.connection.albums.findAll().then((res) => {
      this.setState({
        isLoading: false,
        albums: res.albums,
        dataSource: this.state.dataSource.cloneWithRows(res.albums)
      })
    });
  },

  handlePress(row) {
    this.props.connection.tracks.findAllByAlbumId(row.id).then((tracks) => {
      const items = tracks.map(t => {
        return {track: t, album: row}
      });
      PlaybackQueue.replace(items, true);
    })
  },

  performRate(row, rating) {
    row.rate(rating).then(() => {
      row.userRating = rating
      this.setState({dataSource: this.state.dataSource.cloneWithRows(this.filterAlbums(this.state.albums, this.state.filter))})
    })
  },

  handleStar(row, rating) {
    if (row.userRating == rating) {
      this.performRate(row, 0)
    } else {
      this.performRate(row, rating)
    }
  },

  renderStar(row, index) {
    return <Icon onPress={() => { this.handleStar(row, index + 1)} } suppressHighlighting={true} key={index}
                 style={{margin: 2}} name={index <= row.userRating - 1 ? "star" : "star-o"} size={18}/>
  },

  renderRow(row) {
    return (
      <TouchableOpacity onPress={() => { this.handlePress(row) }}>
        <View
          style={{flexDirection: "row", alignItems: "center", padding: 8}}>
          <Image style={{width: 48, height: 48, borderRadius: 4}} source={{uri: row.artwork}}/>
          <View style={{width: 10}}/>
          <View style={{flex: 1, flexDirection: "column"}}>
            <Text style={{fontWeight: "bold"}}>{row.title}</Text>
            <Text style={{color: "#888"}}>{row.artistName}</Text>
          </View>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Text style={{marginRight: 10}}>{row.year}</Text>
            {Array.from(Array(5).keys()).map((i) => this.renderStar(row, i))}
          </View>
        </View>
      </TouchableOpacity>
    )
  },

  renderSeparator(_, index) {
    return <View key={index} style={{height: 1, backgroundColor: "#ddd"}}/>
  },

  handleSearch(value) {
    this.setState({filter: value}, () => {
      const matches = this.filterAlbums(this.state.albums, value)
      this.refs.listView.scrollTo({x: 0, y: 0});
      this.setState({dataSource: this.state.dataSource.cloneWithRows(matches)});
    });
  },

  render() {
    if (this.state.isLoading) {
      return <LoadingScreen message="Fetching albums..."/>
    } else {
      return (
        <View style={{flex: 1}}>
          <ListView ref="listView" dataSource={this.state.dataSource} renderRow={this.renderRow}
                    renderSeparator={this.renderSeparator}
          />
        </View>
      )

    }
  }
});
