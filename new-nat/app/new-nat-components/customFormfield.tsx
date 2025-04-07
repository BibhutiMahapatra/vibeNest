import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";

const CustomFormfield = ({
  label,
  placeholder,
  value,
  handleChangeText,
  multiline,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <Text style={{ color: "#FFFF", paddingTop: 10, paddingLeft: 10 }}>
          {label}
        </Text>
        <View style={styles.fieldCls}>
          <TextInput
            style={styles.inputColor}
            placeholder={placeholder}
            value={value}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            multiline={multiline}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomFormfield;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldCls: {
    backgroundColor: "black",
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    borderColor: "#353535",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    paddingLeft: 10,
  },
  inputColor: {
    color: "#FFFF",
    fontWeight: "400",
  },
});
