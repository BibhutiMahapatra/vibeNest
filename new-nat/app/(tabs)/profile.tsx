import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomPostView from "../new-nat-components/customPostView";
import EmptyContainer from "../new-nat-components/emptyContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import EditProfile from "../new-nat-components/editProfile";
import { DEVICE_IP } from "../constant";
import { router } from "expo-router";
import SettingsModal from "../new-nat-components/settingsModal";
import CustomSearchList from "../new-nat-components/customSearchList";

const profile = () => {
  const [posts, setPosts] = useState([]);
  const [loggedinUserDetails, setUserDetails] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [openPostStack, setPostStack] = useState(false);
  const [viewProfilePic, setViewProfilePic] = useState(false);
  const [expandedPOst, setExpandedPost] = useState({});
  const [followList, setFollowList] = useState([]);
  const [openFollowList, setOpenFollowList] = useState(false);

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
        setUserDetails(resp?.data?.[0]);
        setPosts(
          resp?.data?.[0]?.uploadedPosts
            ?.sort((a, b) => {
              const dateA = new Date(a.createdTime).getTime();
              const dateB = new Date(b.createdTime).getTime();
              return dateB - dateA; // Descending order
            })
            ?.map((post) => ({
              ...post,
              userName: resp?.data?.[0]?.userName || "",
              avatar: resp?.data?.[0]?.profilePic || "",
              fullName: resp?.data?.[0]?.fullName || "",
              userId: resp?.data?.[0]?._id || "",
            }))
        );
        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(resp?.data?.[0])
        );
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
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

  const viewFollowList = async (type) => {
    setOpenFollowList(true);
    try {
      const response = await fetch(
        `${DEVICE_IP}/followList?id=${loggedinUserDetails?._id}&type=${type}`,
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
                    width: "99%",
                    paddingRight: 5,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 25, color: "#FFFF", fontWeight: 400 }}
                  >
                    {loggedinUserDetails?.userName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setOpenSettings(true);
                    }}
                  >
                    <Icon name="settings" size={27} color="#FFFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={() => {
                    setViewProfilePic(true);
                  }}
                >
                  {!loggedinUserDetails?.profilePic ? (
                    <Image
                      source={require("../../assets/images/default-avatar.png")}
                      style={styles.avatar}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `${DEVICE_IP}${loggedinUserDetails?.profilePic}`,
                      }}
                      style={styles.avatar}
                    />
                  )}
                </TouchableOpacity>
                {!loggedinUserDetails?.fullName && !loggedinUserDetails?.bio ? (
                  <Text style={{ color: "#FFFF" }}>Please Edit Your Bio</Text>
                ) : (
                  <View style={{ width: "80%", gap: 10 }}>
                    <Text style={styles.userName}>
                      {loggedinUserDetails?.fullName}
                    </Text>
                    <Text style={styles.userName}>
                      {loggedinUserDetails?.bio}
                    </Text>
                  </View>
                )}

                <View style={styles.flwRow}>
                  <TouchableOpacity
                    style={styles.flwDiv}
                    onPress={() => viewFollowList("followers")}
                  >
                    <Text style={styles.userName}>
                      {loggedinUserDetails?.followerList?.length || 0}
                    </Text>
                    <Text style={styles.grayFont}>Followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.flwDiv}>
                    <Text style={styles.userName}>
                      {loggedinUserDetails?.uploadedPosts?.length || 0}
                    </Text>
                    <Text style={styles.grayFont}>Posts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.flwDiv}
                    onPress={() => viewFollowList("following")}
                  >
                    <Text style={styles.userName}>
                      {loggedinUserDetails?.followingList?.length || 0}
                    </Text>
                    <Text style={styles.grayFont}>Following</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity onPress={() => setEditProfile(true)}>
                    <View style={styles.editBtns}>
                      <Text style={styles.editFonts}>Edit Profile</Text>
                    </View>
                  </TouchableOpacity>
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
              subtitle={"Try to upload your first Post"}
              direction={"/create"}
              buttonName={"create"}
              showButton={true}
            />
          )}
          contentContainerStyle={styles.flatListContent}
          numColumns={3}
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editProfile}
        onRequestClose={() => setEditProfile(false)}
      >
        <EditProfile
          userDetails={loggedinUserDetails}
          close={(e) => {
            setEditProfile(false);
          }}
        />
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={openSettings}
        onRequestClose={() => setOpenSettings(false)}
      >
        <SettingsModal
          close={(e) => {
            setOpenSettings(e);
          }}
        />
      </Modal>
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
                      refreshUser(loggedinUserDetails?._id);
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
                      uri: `${DEVICE_IP}${loggedinUserDetails?.profilePic}`,
                    }}
                    style={styles.avatar}
                  />
                </View>
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
    </SafeAreaView>
  );
};

export default profile;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#161622",
    height: "100%",
    alignItems: "center",
  },
  container: {
    marginVertical: 7,
    alignItems: "center",
    gap: 10,
  },
  profilePicView: {
    width: "96%",
    height: 350,
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
    textAlign: "center",
  },
  grayFont: {
    color: "gray",
    fontSize: 15,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    gap: 10,
  },
  flwRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "75%",
    margin: 20,
  },
  flwDiv: {
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  editBtns: {
    backgroundColor: "#353535",
    padding: 10,
    borderRadius: 10,
    width: 150,
    alignItems: "center",
    marginBottom: 10,
  },
  editFonts: {
    color: "#FFFF",
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
    // marginVertical: 50,
  },
  modalContent: {
    backgroundColor: "#161622",
    paddingVertical: 10,
    // paddingRight: 9,
    // paddingLeft: 9,
    borderRadius: 12,
    // paddingHorizontal: 20,
    width: "98%",
    // maxHeight: "70%",
  },
});
