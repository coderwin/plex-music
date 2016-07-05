import {TouchableOpacity, Text, View, StyleSheet} from "react-native-desktop";

const style = StyleSheet.create({
    touchable: {
      default: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#f0f0f0"
      },
      active: {
        backgroundColor: "white"
      }
    },
    text: {
      active: {
        fontWeight: "bold",
      }
    }
  }
)

export default function (props) => {
  return <TouchableOpacity {...props} style={[style.touchable.default, props.active && style.touchable.active]}>
    <Text style={props.active && style.text.active}>{style.text.title}</Text>
  </TouchableOpacity>
}