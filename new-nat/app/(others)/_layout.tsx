import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const _layout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="viewProfile" options={{ headerShown: false }} />
        <Stack.Screen
          name="expandProfilePost"
          options={{ headerShown: false }}
        />
      </Stack>
      {/* <StatusBar backgroundColor="#161622" style="light"></StatusBar> */}
    </>
  );
};

export default _layout;

const styles = StyleSheet.create({});
