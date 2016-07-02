import React from "react";
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  ListView,
  Text,
  TextInput,
  View,
  DeviceEventEmitter
} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";
import PlaybackQueue from "./PlaybackQueue";
import LoadingScreen from "./LoadingScreen";
import _ from "lodash";
import Subscribable from "Subscribable";

export default React.createClass({
  mixins: [Subscribable.Mixin],

  getInitialState() {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true
    })

    return {
      albums: [],
      onlyStarred: false,
      dataSource: dataSource.cloneWithRows([]),
    };
  },

  componentWillMount() {
    this.handleSearch = _.debounce(this.handleSearch, 100)

    this.setState({isLoading: true});
    this.props.connection.albums.findAll().then((res) => {
      this.setState({
        isLoading: false,
        albums: res.albums,
        dataSource: this.state.dataSource.cloneWithRows(this.filterAlbums(res.albums, this.state.filter, this.state.onlyStarred))
      })
    });
  },

  filterAlbums(albums, value, onlyStarred = false) {
    return albums.filter(a => {
        return (onlyStarred ? a.userRating > 0 : true) && (value ? (a.title.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0 || a.artistName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) >= 0) : true)
      }
    ).reverse()
  },

  handleOnlyStarredPress() {
    this.setState({
      onlyStarred: !this.state.onlyStarred,
      dataSource: this.state.dataSource.cloneWithRows(this.filterAlbums(this.state.albums, this.state.filter, !this.state.onlyStarred))
    })
  },

  handlePress(row) {
    this.props.connection.tracks.findAllByAlbumId(row.id).then((tracks) => {
      const items = tracks.map(t => {
        return {track: t, album: row}
      });
      PlaybackQueue.replace(items, true);
    })
  },

  handleSearch(value) {
    this.setState({filter: value}, () => {
      const matches = this.filterAlbums(this.state.albums, value, this.state.onlyStarred)
      this.refs.listView.scrollTo({x: 0, y: 0});
      this.setState({dataSource: this.state.dataSource.cloneWithRows(matches)});
    });
  },

  handleStar(row, rating) {
    if (row.userRating == rating) {
      this.performRate(row, 0)
    } else {
      this.performRate(row, rating)
    }
  },

  performRate(row, rating) {
    row.rate(rating).then(() => {
      row.userRating = rating
      this.setState({dataSource: this.state.dataSource.cloneWithRows(this.filterAlbums(this.state.albums, this.state.filter, this.state.onlyStarred))})
    })
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

  renderStar(row, index) {
    return <Icon onPress={() => { this.handleStar(row, index + 1)} } suppressHighlighting={true} key={index}
                 style={{margin: 2}} name={index <= row.userRating - 1 ? "star" : "star-o"} size={18}/>
  },

  renderToolbar() {
    return (
      <View style={{flexDirection: "row", backgroundColor: "#fbfbfb", alignItems: "center", padding: 8}}>
        <TextInput style={{flex: 1, height: 23}} onChangeText={this.handleSearch} />
        <View style={{width: 8}}/>
        <Icon name={this.state.onlyStarred ? "star" : "star-o"} size={16} onPress={this.handleOnlyStarredPress}/>
      </View>
    )
  },

  render() {
    if (this.state.isLoading) {
      return <LoadingScreen message="Fetching albums..."/>
    } else {
      return (
        <View style={{flex: 1}}>
          {this.renderToolbar()}
          <View style={{height: 1, backgroundColor: "#ddd"} }/>
          <ListView ref="listView" dataSource={this.state.dataSource} renderRow={this.renderRow}
                    renderSeparator={this.renderSeparator}
          />
        </View>
      )
    }
  }
});
