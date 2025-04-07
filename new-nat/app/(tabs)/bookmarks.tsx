import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DEVICE_IP } from "../constant";
import CustomPostView from "../new-nat-components/customPostView";
import EmptyContainer from "../new-nat-components/emptyContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Bookmark = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loggedinUserDetails, setUserDetails] = useState(null);

  const onRefresh = React.useCallback(() => {
    fetchLoggedinUser();
  }, []);

  useEffect(() => {
    fetchLoggedinUser();
  }, []);

  const fetchLoggedinUser = async () => {
    try {
      let user = await AsyncStorage.getItem("userDetails");
      if (user) {
        let userDetails = JSON.parse(user);
        setUserDetails(userDetails);
        if (userDetails) getUserData(userDetails?._id);
      } else {
        console.log("No user details found in storage.");
      }
    } catch (err) {
      console.log("Error while fetching user details:", err);
    }
  };

  const getUserData = async (id) => {
    try {
      const response = await fetch(`${DEVICE_IP}/users/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const resp = await response.json();

      if (resp?.statusCode == 200) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(resp?.data?.[0])
        );
        setUserDetails(resp?.data?.[0]);
        getAllPosts(resp?.data?.[0]?.savedPosts);
      } else {
        Alert.alert("Error", resp.message || "Failed to get the user.");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const getAllPosts = async (postIds) => {
    try {
      const response = await fetch(`${DEVICE_IP}/allPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();

      if (resp?.statusCode == 200) {
        let postArr = [];
        resp?.data.forEach((element) => {
          postIds.forEach((e) => {
            if (e == element?.postId) {
              postArr.push(element);
            }
          });
        });
        setAllPosts(postArr);
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
        return;
      } else {
        setRefreshing(false);
        Alert.alert("Error", resp.message || "Failed to get the posts.");
      }
    } catch (err) {
      setRefreshing(false);
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={allPosts}
        keyExtractor={(item) => item.postId}
        renderItem={({ item }) => (
          <CustomPostView post={item} refresh={(e) => {}} />
        )}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            <Text style={{ color: "#FFFF", fontSize: 22, fontWeight: 600 }}>
              Saved Posts
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyContainer
            title={"No Posts Found"}
            subtitle={"Try to save a post from your feed"}
            direction={"/home"}
            buttonName={"Explore Feed"}
            showButton={true}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Bookmark;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#161622",
    height: "100%",
  },
  container: {
    margin: 20,
    // height: "100%",
    justifyContent: "space-between",
  },
});
