import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsModal = ({ close }) => {
  const signOut = async () => {
    close(false);
    await AsyncStorage.setItem("userDetails", JSON.stringify({}));
    router.replace("/signIn");
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalRow}>
          <Text style={{ color: "#FFFF", fontSize: 17, fontWeight: "600" }}>
            Settings
          </Text>
          <TouchableOpacity onPress={() => close(false)}>
            <Icon name="cancel" size={27} color="#FFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.hl}></View>
        <Text
          style={{
            color: "gray",
            fontSize: 15,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          Login
        </Text>
        <TouchableOpacity style={styles.modalItem} onPress={() => {}}>
          <Text style={{ color: "#8a9dfa", fontSize: 17 }}>Add Account</Text>
          <View
            style={{
              backgroundColor: "#2d6ee8",
              borderRadius: 30,
              marginRight: 7,
            }}
          >
            <Icon name="add" size={20} color="#FFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => {
            signOut();
          }}
        >
          <Text style={{ color: "#f92510", fontSize: 17 }}>Sign Out</Text>
          <Image
            style={{ width: 25, height: 20 }}
            source={require("../../assets/icons/logout.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#161622",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    width: "90%",
  },
  modalRow: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    // marginVertical: 5,
  },
  hl: {
    width: "100%",
    borderColor: "gray",
    borderWidth: 0.5,
    marginTop: 15,
  },
  modalItem: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 5,
    backgroundColor: "black",
    paddingVertical: 15,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
  },
});
