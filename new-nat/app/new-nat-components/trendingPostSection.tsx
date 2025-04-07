import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import TrendingPosts from "./trendingPosts";
import EmptyContainer from "./emptyContainer";

const TrendingPostSection = ({ posts }) => {
  return (
    <View>
      <Text style={{ color: "gray", fontSize: 15 }}>Trending Posts</Text>
      <FlatList
        data={[...posts].sort(
          (a, b) => (b?.likes?.length || 0) - (a?.likes?.length || 0)
        )}
        keyExtractor={(item) => item?._id}
        renderItem={({ item }) => <TrendingPosts post={item} />}
        horizontal
        ListEmptyComponent={() => (
          <EmptyContainer
            title={"No Posts Found"}
            subtitle={"Be the first one to upload a post"}
            direction={"/create"}
            buttonName={"create"}
            showButton={true}
          />
        )}
      />
    </View>
  );
};

export default TrendingPostSection;

const styles = StyleSheet.create({});
