import { AppRegistry } from 'react-native-macos'
import RootLayout from './src/RootLayout'

console.ignoredYellowBox = ['Warning: In next release empty section headers will be rendered']

AppRegistry.registerComponent('PlexMusic', () => RootLayout)
