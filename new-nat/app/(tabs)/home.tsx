import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SearchField from "../new-nat-components/searchField";
import EmptyContainer from "../new-nat-components/emptyContainer";
import CustomPostView from "../new-nat-components/customPostView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrendingPostSection from "../new-nat-components/trendingPostSection";
import { DEVICE_IP } from "../constant";
import CustomSearchList from "../new-nat-components/customSearchList";
import { router } from "expo-router";

const Home = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loggedinUserDetails, setUserDetails] = useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [userList, setUserList] = useState([]);
  const [openUserList, setOpenUserList] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchTimeout = useRef(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
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
        getUserData(userDetails?._id);
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
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();

      if (resp?.statusCode == 200) {
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(resp?.data?.[0])
        );
        setUserDetails(resp?.data?.[0]);
        getAllPosts();
      } else {
        setRefreshing(false);
        Alert.alert("Error", resp.message || "Failed to get the user.");
      }
    } catch (err) {
      setRefreshing(false);
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const getAllPosts = async () => {
    setAllPosts([]);
    try {
      const response = await fetch(`${DEVICE_IP}/allPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();

      if (resp?.statusCode == 200) {
        setAllPosts(resp?.data);
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
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

  const handleSearchInput = (text) => {
    setSearchValue(text);

    // Clear the previous timer
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timer
    searchTimeout.current = setTimeout(() => {
      if (text.trim().length > 0) {
        searchUser(text);
      } else {
        setOpenUserList(false);
        setUserList([]); // Clear the user list if input is empty
      }
    }, 500);
  };

  const searchUser = async (searchValue) => {
    setOpenUserList(true);
    try {
      const response = await fetch(
        `${DEVICE_IP}/searchUsers?searchValue=${searchValue}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const resp = await response.json();
      if (resp?.statusCode == 200) {
        setUserList(resp?.data);
      }
    } catch (err) {
      console.log("Error", err);
      Alert.alert("Failed", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#161622", height: "100%" }}>
      <View
        style={{
          padding: 10,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "98%",
          }}
        >
          <View>
            <Text style={{ color: "#FFFF", fontSize: 13 }}>Welcome Back</Text>
            <Text style={{ color: "#FFFF", fontSize: 24, fontWeight: 600 }}>
              {loggedinUserDetails?.userName}
            </Text>
          </View>

          <Image
            style={{ width: 60, height: 60, borderRadius: 200 }}
            resizeMode="contain"
            source={require("../../assets/images/vibeNestLogo.png")}
          />
        </View>
        <View style={styles.fieldCls}>
          <TextInput
            style={styles.inputColor}
            placeholder={"Search for a Profile"}
            placeholderTextColor="#7b7b8b"
            value={searchValue}
            onChangeText={handleSearchInput}
            autoFocus={false} // Keeps the keyboard open initially
          />
          <View>
            <Image
              style={{ width: 20 }}
              resizeMode="contain"
              source={require("../../assets/icons/search.png")}
            />
          </View>
        </View>
        {openUserList ? (
          <View style={styles.modalContent}>
            <FlatList
              data={userList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <CustomSearchList
                  userDetails={item}
                  goToProfile={async (id) => {
                    if (id == loggedinUserDetails?._id) {
                      router.replace("/profile");
                    } else {
                      await AsyncStorage.setItem("profileId", id);
                      router.push("/viewProfile");
                    }
                  }}
                />
              )}
              ListEmptyComponent={() => (
                <EmptyContainer
                  title={"No User Found"}
                  subtitle={"Till now no users are there"}
                  direction={""}
                  buttonName={"Close"}
                  showButton={false}
                />
              )}
            />
          </View>
        ) : (
          <></>
        )}
      </View>

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
          <>
            <View style={{ marginLeft: 17, marginBottom: 10 }}>
              <TrendingPostSection posts={allPosts} />
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyContainer
            title={"No Posts Found"}
            subtitle={"Be the first one to upload a post"}
            direction={"/create"}
            buttonName={"create"}
            showButton={true}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    maxHeight: "70%",
    width: "100%",
  },
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
    width: "90%",
  },
});
