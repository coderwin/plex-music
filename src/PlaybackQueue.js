import { observable, computed, transaction } from 'mobx'
import { DeviceEventEmitter, NativeModules } from 'react-native-macos'
import { autobind } from 'core-decorators'

const { AudioPlayer } = NativeModules

@autobind
class PlaybackQueue {
  @observable currentTime = 0
  @observable duration = 0
  @observable activeIndex = -1
  @observable playlist = []
  @observable isPlaying = false

  @computed get activeItem() {
    return this.playlist[this.activeIndex]
  }

  constructor() {
    DeviceEventEmitter.addListener('AudioPlayerDidFinishPlaying', this.playNext)
  }

  startInterval() {
    this.interval = setInterval(() => {
      AudioPlayer.getCurrentTime((e, time) => {
        this.currentTime = time
      })
      AudioPlayer.getDuration((e, duration) => {
        this.duration = duration
      })
    }, 1000)
  }

  stopInterval() {
    clearInterval(this.interval)
  }

  pause() {
    AudioPlayer.pause()
    this.stopInterval()
    this.isPlaying = false
  }

  resume() {
    if (this.activeItem) {
      this.startInterval()
      AudioPlayer.resume()
      this.isPlaying = true
    }
  }

  stop() {
    this.pause()
    this.activeIndex = -1
  }

  playItemAtIndex(index) {
    const item = this.playlist[index]
    if (item) {
      this.activeIndex = index
      AudioPlayer.play(item.track.url)
      this.isPlaying = true
      this.startInterval()
    } else {
      this.stop()
      this.stopInterval()
    }
  }

  playPrev() {
    this.playItemAtIndex(this.activeIndex - 1)
  }

  playNext() {
    this.playItemAtIndex(this.activeIndex + 1)
  }

  toggle() {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.resume()
    }
  }

  seekTo(time) {
    AudioPlayer.setCurrentTime(time)
  }

  replace(playlist, shouldPlay = false) {
    this.stop()
    transaction(() => {
      this.playlist.replace(playlist)
    })

    if (shouldPlay) {
      this.playItemAtIndex(0)
    }
  }
}

export default new PlaybackQueue()
