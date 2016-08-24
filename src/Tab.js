import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native-macos'

const touchableStyle = StyleSheet.create({
  default: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0'
  },
  active: {
    backgroundColor: 'white'
  }
})

const textStyle = StyleSheet.create({
  active: {
    fontWeight: 'bold'
  }
})

export default function (props) {
  return (
    <TouchableOpacity {...props} style={[touchableStyle.default, props.active && touchableStyle.active]}>
      <Text style={props.active && textStyle.active}>{props.title}</Text>
    </TouchableOpacity>
  )
}
