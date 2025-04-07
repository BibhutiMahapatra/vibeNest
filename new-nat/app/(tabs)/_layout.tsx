import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { Stack, Tabs, Redirect } from "expo-router";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        style={styles.tabIcon}
      />
      <Text style={focused ? styles.boldFont : styles.regFont}>{name}</Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FFA001",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 1,
            borderTopColor: "232533",
            height: 75,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require("../../assets/icons/home.png")}
                color={color}
                name={"Home"}
                focused={focused}
              />
            ),
          }}
        ></Tabs.Screen>
        <Tabs.Screen
          name="bookmarks"
          options={{
            title: "Bookmarks",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require("../../assets/icons/bookmark.png")}
                color={color}
                name={"Bookmarks"}
                focused={focused}
              />
            ),
          }}
        ></Tabs.Screen>
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require("../../assets/icons/plus.png")}
                color={color}
                name={"Create"}
                focused={focused}
              />
            ),
          }}
        ></Tabs.Screen>
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={require("../../assets/icons/profile.png")}
                color={color}
                name={"Profile"}
                focused={focused}
              />
            ),
          }}
        ></Tabs.Screen>
      </Tabs>
    </>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  boldFont: {
    fontWeight: "bold",
    fontSize: 10,
    width: "100%",
    color: "#FFA001",
  },
  regFont: {
    fontSize: 10,
    width: "100%",
    color: "#FFFF",
  },
  tabIcon: {
    height: 22,
    width: 22,
    marginTop: 15,
  },
  tabIconContainer: {
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
});
