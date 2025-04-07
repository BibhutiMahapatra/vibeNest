import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { FC } from "react";

const CustomButton = ({ title, handlePress, isLoading, width }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.buttonCls,
        isLoading ? { opacity: 10 } : {},
        { width: width },
      ]}
      disabled={isLoading}
    >
      <Text>{isLoading ? "Loading..." : `${title}`}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonCls: {
    backgroundColor: "#FFA001",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
});
