import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { DEVICE_IP } from "../constant";

const CustomSearchList = ({ userDetails, goToProfile }) => {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => goToProfile(userDetails?._id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: `${DEVICE_IP}${userDetails?.profilePic}`,
          }}
          style={styles.avatar}
        />
      </View>
      <View style={{ justifyContent: "space-between", height: 45 }}>
        <Text style={{ color: "#FFFF", fontSize: 16, fontWeight: 600 }}>
          {userDetails?.userName}
        </Text>
        <Text style={{ color: "gray", fontSize: 14, fontWeight: 500 }}>
          {userDetails?.fullName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomSearchList;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 4,
    padding: 10,
    borderColor: "#FFFF",
    borderWidth: 1,
    borderRadius: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 40,
    borderColor: "#FFFF",
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
