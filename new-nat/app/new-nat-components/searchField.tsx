import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";

const Searchfield = ({ placeholder, onSearch }) => {
  // const [form, setForm] = useState({
  //     searchValue: "",
  //   });

  // const handleSearch = (text) => {
  //   setSearchValue(text);
  //   if (onSearch) {
  //     onSearch(text);
  //   }
  // };

  return (
    <View>
      <View style={styles.fieldCls}>
        <TextInput
          style={styles.inputColor}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          // value={form.searchValue}
          onChangeText={(e) => onSearch(e)}
        />
        <View>
          <Image
            style={{ width: 20 }}
            resizeMode="contain"
            source={require("../../assets/icons/search.png")}
          />
        </View>
      </View>
    </View>
  );
};

export default Searchfield;

const styles = StyleSheet.create({
  fieldCls: {
    backgroundColor: "black",
    width: "100%",
    height: 50,
    borderRadius: 12,
    borderColor: "#353535",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
  },
  inputColor: {
    color: "#FFFF",
    fontWeight: 400,
    maxWidth: "90%",
  },
});
