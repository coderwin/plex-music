import React from "react";
import {
  Image,
  TouchableOpacity,
  StyleSheet,
  ListView,
  Text,
  TextInput,
  View,
  InteractionManager,
  DeviceEventEmitter
} from "react-native-desktop";
import Icon from "react-native-vector-icons/FontAwesome";
import PlaybackQueue from "./PlaybackQueue";
import LoadingScreen from "./LoadingScreen";
import Tab from "./Tab";
import _ from "lodash";
import Subscribable from "Subscribable";
import firstBy from "thenby";

const orderFn = {
  alphabetically: firstBy("artistName", {ignoreCase: true}).thenBy("year", {direction: -1}).thenBy("title", {ignoreCase: true}),
  userRating: firstBy("userRating", {direction: -1}).thenBy("artistName", {ignoreCase: true}).thenBy("year", {direction: -1}).thenBy("title", {ignoreCase: true}),
  recentlyAdded: firstBy("addedAt", {direction: -1})
}

const match = {
  string: (source) => (text) => text ? source.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) >= 0 : true,
  array: (source) => (text) => source.some((s) => match.string(s)(text))
}

const predicateFn = {
  artist: (row) => match.string(row.artistName),
  year: (row) => match.string(row.year),
  genre: (row) => match.array(row.genres),
}

const filterFn = {
  query: (row) => (value) => (match.string(row.title)(value) || match.string(row.artistName)(value)),
  predicates: (row) => (values) => Object.keys(predicateFn).every((key) => values[key] ? predicateFn[key](row)(values[key]) : true)
}

export default React.createClass({
  mixins: [Subscribable.Mixin],

  tabs: {
    alphabetically: "Alphabetically",
    recentlyAdded: "Recently added",
    userRating: "Rating",
  },

  getInitialState() {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => true
    })

    return {
      albums: [],

      filter: {
        query: null,
        order: "alphabetically",
        predicates: {}
      },
      dataSource: dataSource.cloneWithRows([]),
    };
  },

  componentWillMount() {
    this.handleSearch = _.debounce(this.handleSearch, 100)

    this.setState({isLoading: true});
    this.props.connection.albums.findAll().then((albums) => {
      this.setState({
        isLoading: false,
        albums: albums,
      }, () => this.performFilterAndSort())
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

  handleSearch(text) {
    const predicates = {}
    const query = text.replace(/((\w+):(\w+)|(\w+):"([^"]+)"|(\w+):'([^']+)")/g, (match, _, key, value) => {
      predicates[key] = value
      return ""
    })
    this.performFilterAndSort({query: query.trim(), predicates: predicates}, true)
  },

  handleClear() {
    this.refs.input.setNativeProps({text: ""})
    this.performFilterAndSort({query: null, predicates: {}}, true)
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
      this.performFilterAndSort()
    })
  },

  performFilterAndSort(filter = {}, shouldScrollToTop = false) {
    this.setState({filter: {...this.state.filter, ...filter}}, () => {
      const {query, order} = this.state.filter

      const matches = this.state.albums
        .filter((row) => Object.keys(filterFn).every((key) => filterFn[key](row)(this.state.filter[key])))
        .sort(orderFn[order]);

      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(matches.reverse())
      }, () => {
        if (shouldScrollToTop) {
          this.refs.listView.scrollTo({x: 0, y: 0})
        }
      })
    })
  },

  replaceQueryAndPredicates(text, predicates) {
    this.refs.input.setNativeProps({text: text})
    this.performFilterAndSort({query: null, predicates: predicates})
  },

  handleArtistNamePress(artistName) {
    this.replaceQueryAndPredicates(`artist:"${artistName}"`, {artist: artistName})
  },

  handleYearPress(year) {
    this.replaceQueryAndPredicates(`year:${year}`, {year: year})
  },

  handleGenrePress(genre) {
    this.replaceQueryAndPredicates(`genre:"${genre}"`, {genre: genre})
  },

  renderGenre(genre, index, row) {
    return (
      <View key={genre} style={{flexDirection: "row"}}>
        <TouchableOpacity onPress={() => this.handleGenrePress(genre)}>
          <Text style={{color: "#888", fontSize: 12}}>{genre}{index != row.genres.length - 1 && "/"}</Text>
        </TouchableOpacity>
      </View>
    )
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
            <View style={{flexDirection: "row"}}>
              <TouchableOpacity onPress={() => this.handleArtistNamePress(row.artistName)}>
                <Text style={{color: "#888"}}>{row.artistName}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{width: 10}}/>
          <View style={{flex: 1, flexDirection: "column", alignItems: "flex-end"}}>
            <View style={{flexDirection: "row"}}>
              <TouchableOpacity onPress={() => this.handleYearPress(row.year)}>
                <Text style={{color: "#888", fontSize: 12}}>{row.year}</Text>
              </TouchableOpacity>
            </View>
            {row.genres.length > 0 && <View style={{flexDirection: "row"}}>{row.genres.map((g, i) => this.renderGenre(g, i, row))}</View>}
          </View>
          <View style={{width: 15}}/>
          <View style={{flexDirection: "row"}}>
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

  renderTab(key, title) {
    return <Tab key={key} active={this.state.filter.order == key} title={title}
                onPress={() => this.performFilterAndSort({order: key},  true)}/>
  },

  renderToolbar() {
    const {order} = this.state.filter

    return (
      <View style={{flexDirection: "column"}}>
        <View style={{flexDirection: "row", backgroundColor: "#f0f0f0"}}>
          {Object.keys(this.tabs).map((key) => this.renderTab(key, this.tabs[key]))}
        </View>
        <View style={{height: 1, backgroundColor: "#ddd"} }/>
        <View style={{flex: 1, flexDirection: "row", padding: 8, alignItems: "center"}}>
          <TextInput ref="input" placeholder="Search..." placeholderTextColor="#888" focusRingType="none"
                     bezeled={false} clearButtonMode="always"
                     style={{flex: 1, fontSize: 16, backgroundColor: "transparent"}} onChangeText={this.handleSearch}/>
          <View style={{width: 10}}/>
          {(this.state.filter.query || Object.keys(this.state.filter.predicates).length > 0) &&
          <Icon name="times-circle" size={16} color="#888" onPress={this.handleClear}/>}
        </View>
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
                    renderSeparator={this.renderSeparator} showsVerticalScrollIndicator={true}
          />
        </View>
      )
    }
  }
});
