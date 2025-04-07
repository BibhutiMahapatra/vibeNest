import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomPostView from "../new-nat-components/customPostView";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExpandProfilePost = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
    setPosts(JSON.parse(await AsyncStorage.getItem("postStack")));
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={({ item }) => (
            <CustomPostView
              post={item}
              refresh={(isRefresh) => {
                if (isRefresh) {
                  // Add refresh logic if needed
                  console.log("Refreshing post data");
                }
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExpandProfilePost;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#161622",
    height: "100%",
    alignItems: "center",
  },
  container: {
    marginVertical: 7,
    gap: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
});
