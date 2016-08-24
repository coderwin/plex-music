import React from 'react'
import firstBy from 'thenby'
import { observer } from 'mobx-react/native'
import { observable, computed } from 'mobx'
import { autobind, debounce } from 'core-decorators'
import { Image, TouchableOpacity, ListView, Text, TextInput, View } from 'react-native-macos'
import Icon from 'react-native-vector-icons/FontAwesome'

import PlaybackQueue from './PlaybackQueue'
import LoadingScreen from './LoadingScreen'
import Tab from './Tab'

type PredicateSet = {
  artist: string,
  year: string,
  genre: string
}

const orderFn = {
  alphabetically: firstBy('artistName', { ignoreCase: true }).thenBy('year', { direction: -1 }).thenBy('title', { ignoreCase: true }),
  userRating: firstBy('userRating', { direction: -1 }).thenBy('artistName', { ignoreCase: true }).thenBy('year', { direction: -1 }).thenBy('title', { ignoreCase: true }),
  recentlyAdded: firstBy('addedAt', { direction: -1 })
}

const match = {
  string: source => text => text ? source.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) >= 0 : true,
  array: source => text => source.some(s => match.string(s)(text))
}

const predicateFn = {
  artist: row => match.string(row.artistName),
  year: row => match.string(row.year),
  genre: row => match.array(row.genres)
}

const filterFn = {
  query: row => value => (match.string(row.title)(value) || match.string(row.artistName)(value)),
  predicates: row => values => Object.keys(predicateFn).every(key => (values[key] ? predicateFn[key](row)(values[key]) : true))
}

const tabs = {
  alphabetically: 'Alphabetically',
  recentlyAdded: 'Recently added',
  userRating: 'Rating'
}

const dataSource = new ListView.DataSource({
  rowHasChanged: (row1, row2) => row1 !== row2
})

@observer
@autobind
export default class AlbumListScreen extends React.Component {
  props: {
    connection: Object
  }

  componentWillMount() {
    this.isLoading = true
    this.props.connection.albums.findAll().then((albums) => {
      this.albums = albums
      this.isLoading = false
    })
  }

  @observable isLoading = false
  @observable albums = []
  @observable filter = {
    query: '',
    order: 'alphabetically',
    predicates: {}
  }

  @computed get matches() {
    return this.albums
      .filter(row => Object.keys(filterFn).every(key => filterFn[key](row)(this.filter[key])))
      .sort(orderFn[this.filter.order])
  }

  @computed get dataSource() {
    return dataSource.cloneWithRows(this.matches)
  }

  handlePress(row) {
    this.props.connection.tracks.findAllByAlbumId(row.id).then((tracks) => {
      const items = tracks.map(t => ({ track: t, album: row }))
      PlaybackQueue.replace(items, true)
    })
  }

  @debounce
  handleSearch(text: string) {
    const predicates = {}
    const query = [/(\w+):(\w+)/g, /(\w+):"([^"]+)"/g, /(\w+):'([^']+)'/g].reduce((_query, regex) => (
      _query.replace(regex, (_, key, value) => {
        predicates[key] = value
        return ''
      })
    ), text)

    this.performFilterAndSort({ query: query.trim(), predicates }, true)
  }


  handleClear() {
    this.refs.input.setNativeProps({ text: '' })
    this.performFilterAndSort({ query: null, predicates: {} }, true)
  }


  handleStar(row, rating) {
    if (row.userRating === rating) {
      this.performRate(row, 0)
    } else {
      this.performRate(row, rating)
    }
  }


  performRate(row, rating) {
    row.rate(rating).then(() => {
      row.userRating = rating
      this.performFilterAndSort()
    })
  }


  performFilterAndSort(filter = {}, shouldScrollToTop = false) {
    this.filter = { ...this.filter, ...filter }
    if (shouldScrollToTop) {
      this.refs.listView.scrollTo({ x: 0, y: 0 })
    }
  }

  replaceQueryAndPredicates(text: string, predicates: PredicateSet) {
    this.refs.input.setNativeProps({ text })
    this.performFilterAndSort({ query: null, predicates })
  }

  handleArtistNamePress(artistName: string) {
    this.replaceQueryAndPredicates(`artist:"${artistName}"`, { artist: artistName })
  }

  handleYearPress(year: string) {
    this.replaceQueryAndPredicates(`year:${year}`, { year })
  }

  handleGenrePress(genre: string) {
    this.replaceQueryAndPredicates(`genre:"${genre}"`, { genre })
  }

  renderGenre(genre: string, index: number, row) {
    return (
      <View key={genre} style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => this.handleGenrePress(genre)}>
          <Text style={{ color: '#888', fontSize: 12 }}>{genre}{index !== row.genres.length - 1 && '/'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderRow(row) {
    return (
      <TouchableOpacity onPress={() => { this.handlePress(row) }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
        >
          <Image style={{ width: 48, height: 48, borderRadius: 4 }} source={{ uri: row.artwork }} />
          <View style={{ width: 10 }} />
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text style={{ fontWeight: 'bold' }}>{row.title}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => this.handleArtistNamePress(row.artistName)}>
                <Text style={{ color: '#888' }}>{row.artistName}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => this.handleYearPress(row.year)}>
                <Text style={{ color: '#888', fontSize: 12 }}>{row.year}</Text>
              </TouchableOpacity>
            </View>
            {row.genres.length > 0 && <View style={{ flexDirection: 'row' }}>{row.genres.map((g, i) => this.renderGenre(g, i, row))}</View>}
          </View>
          <View style={{ width: 15 }} />
          <View style={{ flexDirection: 'row' }}>
            {Array.from(Array(5).keys()).map(i => this.renderStar(row, i))}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderSeparator(_, index) {
    return <View key={index} style={{ height: 1, backgroundColor: '#ddd' }} />
  }

  renderStar(row, index) {
    return (
      <Icon
        key={index}
        onPress={() => { this.handleStar(row, index + 1) }}
        style={{ margin: 2 }}
        name={index <= row.userRating - 1 ? 'star' : 'star-o'}
        size={18}
        suppressHighlighting
      />
    )
  }

  renderTab(key, title) {
    return (
      <Tab
        key={key}
        active={this.filter.order === key}
        title={title}
        onPress={() => this.performFilterAndSort({ order: key }, true)}
      />
    )
  }

  renderToolbar() {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
          {Object.keys(tabs).map(key => this.renderTab(key, tabs[key]))}
        </View>
        <View style={{ height: 1, backgroundColor: '#ddd' }} />
        <View style={{ flex: 1, flexDirection: 'row', padding: 8, alignItems: 'center' }}>
          <TextInput
            ref="input"
            placeholder="Search..."
            placeholderTextColor="#888"
            focusRingType="none"
            bezeled={false} clearButtonMode="always"
            style={{ flex: 1, fontSize: 16, backgroundColor: 'transparent' }} onChangeText={this.handleSearch}
          />
          <View style={{ width: 10 }} />
          {(this.filter.query || Object.keys(this.filter.predicates).length > 0) &&
            <Icon name="times-circle" size={16} color="#888" onPress={this.handleClear} />}
        </View>
      </View>
    )
  }

  render() {
    if (this.isLoading) {
      return <LoadingScreen message="Fetching albums..." />
    }

    return (
      <View style={{ flex: 1 }}>
        {this.renderToolbar()}
        <View style={{ height: 1, backgroundColor: '#ddd' }} />
        <ListView
          ref="listView"
          dataSource={this.dataSource}
          renderRow={this.renderRow}
          renderSeparator={this.renderSeparator}
          showsVerticalScrollIndicator
        />
      </View>
    )
  }
}
