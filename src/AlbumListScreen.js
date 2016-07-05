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
  alphabetically: firstBy("alphabetically", {ignoreCase: true}).thenBy("year", {direction: -1}).thenBy("title", {ignoreCase: true}),
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
    this.props.connection.albums.findAll().then((res) => {
      this.setState({
        isLoading: false,
        albums: res.albums,
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
      });
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
          <View style={{width: 10}}/>
          <View style={{flex: 1, flexDirection: "column", alignItems: "flex-end"}}>
            <Text style={{color: "#888"}}>{row.year}</Text>
            {row.genres.length > 0 && <Text style={{color: "#888", fontSize: 12}}>{row.genres.join(", ")}</Text>}
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
      <View style={{flexDirection: "column", backgroundColor: "#fbfbfb"}}>
        <View style={{flexDirection: "row"}}>
          {Object.keys(this.tabs).map((key) => this.renderTab(key, this.tabs[key]))}
        </View>
        <View style={{height: 1, backgroundColor: "#ddd"} }/>
        <View style={{flex: 1, flexDirection: "column", padding: 8}}>
          <TextInput style={{flex: 1, height: 23}} onChangeText={this.handleSearch}/>
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
