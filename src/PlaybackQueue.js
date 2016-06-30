EventEmitter = require('EventEmitter')
import {DeviceEventEmitter, NativeModules} from "react-native-desktop";
const {AudioPlayer} = NativeModules;

const events = new EventEmitter()

setInterval(() => {
  AudioPlayer.getCurrentTime((e, time) => {
    events.emit("time", time)
  })
  AudioPlayer.getDuration((e, duration) => {
    events.emit("duration", duration)
  })
}, 100);

PlaybackQueue = {
  events: events,
  isPlaying: false,
  activeIndex: -1,
  playlist: [],

  pause() {
    AudioPlayer.pause()
    this.events.emit("pause")
    this.isPlaying = false
  },

  resume() {
    AudioPlayer.resume()
    this.events.emit("play", this.playlist[this.activeIndex])
    this.isPlaying = true
  },

  stop() {
    this.pause()
    this.events.emit("stop")
    this.activeIndex = -1
  },

  playItemAtIndex(index) {
    if (item = this.playlist[index]) {
      this.isPlaying = true
      this.activeIndex = index
      AudioPlayer.play(item.track.url)
      this.events.emit("play", item)
    } else {
      this.stop()
    }
  },

  playPrev() {
    this.playItemAtIndex(this.activeIndex - 1)
  },

  playNext() {
    this.playItemAtIndex(this.activeIndex + 1)
  },

  toggle(){
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume()
    }
  },

  seekTo() {
    AudioPlayer.setCurrentTime(time)
  },

  replace(playlist, shouldPlay = false) {
    this.events.emit("change", playlist)
    this.playlist = playlist
    if (shouldPlay) {
      this.playItemAtIndex(0)
    }
  }
}

DeviceEventEmitter.addListener('AudioPlayerDidFinishPlaying', PlaybackQueue.stop);

export default PlaybackQueue


