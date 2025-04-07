import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "./customButtons";
import { router } from "expo-router";

const EmptyContainer = ({
  title,
  subtitle,
  direction,
  buttonName,
  showButton,
}) => {
  const goToCreate = () => {
    router.replace(direction);
  };
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Image
        source={require("../../assets/images/empty.png")}
        resizeMode="contain"
        style={{ width: 300, height: 250 }}
      />
      <Text style={{ color: "#FFFF", fontWeight: 600, fontSize: 15 }}>
        {title}
      </Text>
      <Text style={{ color: "gray", fontSize: 13 }}>{subtitle}</Text>
      {showButton ? (
        <CustomButton
          title={buttonName}
          handlePress={goToCreate}
          isLoading={false}
          width={"95%"}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default EmptyContainer;

const styles = StyleSheet.create({});
