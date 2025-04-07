import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DEVICE_IP } from "../constant";
import CustomPostView from "../new-nat-components/customPostView";
import EmptyContainer from "../new-nat-components/emptyContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import CustomSearchList from "../new-nat-components/customSearchList";

const ViewProfile = ({ route }) => {
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loggedinUserDetails, setLogUserDetails] = useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [openPostStack, setPostStack] = useState(false);
  const [viewProfilePic, setViewProfilePic] = useState(false);
  const [expandedPOst, setExpandedPost] = useState({});
  const [followList, setFollowList] = useState([]);
  const [openFollowList, setOpenFollowList] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLoggedinUser();
    fetchUser();
  }, []);

  useEffect(() => {
    fetchLoggedinUser();
    fetchUser();
  }, []);

  const fetchLoggedinUser = async () => {
    try {
      let user = await AsyncStorage.getItem("userDetails");
      if (user) {
        let userDetails = JSON.parse(user);
        refreshUser(userDetails?._id);
      } else {
        console.log("No user details found in storage.");
      }
    } catch (err) {
      console.log("Error while fetching user details:", err);
    }
  };

  const refreshUser = async (id) => {
    setPosts([]);
    try {
      const response = await fetch(`${DEVICE_IP}/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();

      if (resp?.statusCode == 200) {
        setLogUserDetails(resp?.data?.[0]);
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(resp?.data?.[0])
        );
      } else {
        Alert.alert("Error", resp.message || "Failed to get the user.");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const fetchUser = async () => {
    let profileId = await AsyncStorage.getItem("profileId");

    try {
      setPosts([]);
      const response = await fetch(`${DEVICE_IP}/users/${profileId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const resp = await response.json();
      if (resp?.statusCode == 200) {
        setUserDetails(resp?.data?.[0]);
        setPosts(
          resp?.data?.[0]?.uploadedPosts
            ?.sort((a, b) => {
              const dateA = new Date(a.createdTime).getTime();
              const dateB = new Date(b.createdTime).getTime();
              return dateB - dateA;
            })
            ?.map((post) => ({
              ...post,
              userName: resp?.data?.[0]?.userName || "",
              avatar: resp?.data?.[0]?.profilePic || "",
              fullName: resp?.data?.[0]?.fullName || "",
              userId: resp?.data?.[0]?._id || "",
            }))
        );
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      } else {
        setRefreshing(false);
        Alert.alert("Error", resp.message || "Failed to get the user.");
      }
    } catch (err) {
      console.log("Error", err);
      setRefreshing(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const followUser = async () => {
    try {
      const response = await fetch(`${DEVICE_IP}/followUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: loggedinUserDetails?._id,
          secondaryId: userDetails?._id,
        }),
      });
      const resp = await response.json();

      if (resp?.statusCode == 201) {
        fetchUser();
        refreshUser(loggedinUserDetails?._id);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const unfollowUser = async () => {
    try {
      const response = await fetch(`${DEVICE_IP}/unfollowUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: loggedinUserDetails?._id,
          secondaryId: userDetails?._id,
        }),
      });
      const resp = await response.json();

      if (resp?.statusCode == 201) {
        fetchUser();
        refreshUser(loggedinUserDetails?._id);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const unfollowAlert = () => {
    Alert.alert(
      "Confirm Unfollow",
      `Are you sure you want to Unfollow ${userDetails?.userName}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Unfollow canceled"),
          style: "cancel",
        },
        {
          text: "Unfollow",
          onPress: () => {
            unfollowUser();
          },
          style: "destructive",
        },
      ]
    );
  };

  const viewFollowList = async (type) => {
    setOpenFollowList(true);
    try {
      const response = await fetch(
        `${DEVICE_IP}/followList?id=${userDetails?._id}&type=${type}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const resp = await response.json();
      if (resp?.statusCode === 200) {
        setFollowList(resp?.data);
      }
    } catch (error) {
      if (type === "following") setFollowList([]);
      else setFollowList([]);
      console.error("Fetch error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.post}
              onPress={async () => {
                setPostStack(true);
                setExpandedPost(item);
                // await AsyncStorage.setItem("postStack", JSON.stringify(posts));
                // router.push("/expandProfilePost");
              }}
            >
              <Image
                source={{ uri: `${DEVICE_IP}${item?.image}` }}
                style={styles.pic}
              />
            </TouchableOpacity>
          )}
          ListHeaderComponent={() => (
            <>
              <View style={styles.container}>
                <View
                  style={{
                    width: "100%",
                    paddingRight: 5,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // paddingLeft: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 25, color: "#FFFF", fontWeight: 400 }}
                  >
                    {userDetails?.userName}
                  </Text>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => {
                      setViewProfilePic(true);
                    }}
                  >
                    {!userDetails?.profilePic ? (
                      <Image
                        source={require("../../assets/images/default-avatar.png")}
                        style={styles.avatar}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `${DEVICE_IP}${userDetails?.profilePic}`,
                        }}
                        style={styles.avatar}
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.flwRow}>
                    <TouchableOpacity
                      style={styles.flwDiv}
                      onPress={() => viewFollowList("followers")}
                    >
                      <Text style={styles.userName}>
                        {userDetails?.followerList?.length || 0}
                      </Text>
                      <Text style={styles.grayFont}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.flwDiv}>
                      <Text style={styles.userName}>
                        {userDetails?.uploadedPosts?.length || 0}
                      </Text>
                      <Text style={styles.grayFont}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.flwDiv}
                      onPress={() => viewFollowList("following")}
                    >
                      <Text style={styles.userName}>
                        {userDetails?.followingList?.length || 0}
                      </Text>
                      <Text style={styles.grayFont}>Following</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ width: "50%", gap: 10 }}>
                  <Text style={styles.userName}>{userDetails?.fullName}</Text>
                  <Text style={styles.userName}>{userDetails?.bio}</Text>
                </View>

                <View style={styles.btnRow}>
                  {userDetails?.followerList.includes(
                    loggedinUserDetails?._id
                  ) ? (
                    // Case 1: User is already a follower
                    <TouchableOpacity onPress={() => unfollowAlert()}>
                      <View style={styles.flwBtns}>
                        <Text style={styles.flwFonts}>Following</Text>
                      </View>
                    </TouchableOpacity>
                  ) : userDetails?.followingList.includes(
                      loggedinUserDetails?._id
                    ) ? (
                    // Case 2: User is followed by the other user but not yet followed back
                    <TouchableOpacity onPress={() => followUser()}>
                      <View style={styles.editBtns}>
                        <Text style={styles.editFonts}>Follow Back</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // Case 3: User is neither a follower nor followed by the other user
                    <TouchableOpacity onPress={() => followUser()}>
                      <View style={styles.editBtns}>
                        <Text style={styles.editFonts}>Follow</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity>
                    <View style={styles.editBtns}>
                      <Text style={styles.editFonts}>Share Profile</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          ListEmptyComponent={() => (
            <EmptyContainer
              title={"No Posts Found"}
              subtitle={"This user don't have any Post till now"}
              direction={"/home"}
              buttonName={"Explore"}
              showButton={true}
            />
          )}
          contentContainerStyle={styles.flatListContent}
          numColumns={3} // Restrict to 3 images per row
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={openPostStack}
        onRequestClose={() => setPostStack(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPostStack(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <CustomPostView
                  post={expandedPOst}
                  refresh={(isRefresh) => {
                    if (isRefresh) {
                      fetchUser();
                    }
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={openFollowList}
        onRequestClose={() => setOpenFollowList(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpenFollowList(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={followList}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <CustomSearchList
                      userDetails={item}
                      goToProfile={() => {}}
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
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={viewProfilePic}
        onRequestClose={() => setViewProfilePic(false)}
      >
        <TouchableWithoutFeedback onPress={() => setViewProfilePic(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.profilePicView}>
                  <Image
                    source={{
                      uri: `${DEVICE_IP}${userDetails?.profilePic}`,
                    }}
                    style={styles.avatar}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewProfile;

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
  profilePicView: {
    width: "96%",
    height: 400,
    borderRadius: 10,
    borderColor: "#FFFF",
    marginHorizontal: 8,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 80,
    height: 80,
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
  userName: {
    color: "#FFFF",
    fontWeight: 600,
    fontSize: 15,
    // textAlign: "center",
  },
  grayFont: {
    color: "gray",
    fontSize: 15,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 10,
  },
  flwRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "65%",
    marginHorizontal: 25,
  },
  flwDiv: {
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  flwBtns: {
    backgroundColor: "#353535",
    padding: 10,
    borderRadius: 10,
    width: 170,
    alignItems: "center",
  },
  flwFonts: {
    color: "#FFFF",
    fontSize: 13,
    fontWeight: 600,
  },
  editBtns: {
    backgroundColor: "#FFA001",
    padding: 10,
    borderRadius: 10,
    width: 160,
    alignItems: "center",
  },
  editFonts: {
    color: "black",
    fontSize: 13,
    fontWeight: 600,
  },
  pic: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  post: {
    borderColor: "#FFFF",
    borderWidth: 1,
    padding: 3,
    width: 108,
    flex: 1,
    maxWidth: "33%",
    aspectRatio: 1,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#161622",
    paddingVertical: 10,
    borderRadius: 12,
    width: "98%",
    // maxHeight: "70%",
  },
});
