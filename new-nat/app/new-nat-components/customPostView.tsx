import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DEVICE_IP } from "../constant";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import CustomSearchList from "./customSearchList";
import EmptyContainer from "./emptyContainer";

const CustomPostView = ({ post, refresh }) => {
  const [loggedinUserDetails, setUserDetails] = useState(null);
  const [openMore, setOpenMore] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [postSaved, setPostSaved] = useState(false);
  const [openLikeCount, setOpenLikeCount] = useState(false);
  const [likedList, setLikedList] = useState([]);

  useEffect(() => {
    fetchLoggedinUser();
  }, []);

  const getTruncatedText = (text) => {
    const lines = text.split("\n");
    if (lines[0].length > 38) {
      return `${lines[0].substring(0, 38)}...`;
    }

    if (lines.length > 1) {
      return `${lines[0]}...`;
    }

    return lines[0];
  };

  const shouldShowMoreButton = (description) => {
    const lines = description.split("\n");
    return lines[0].length > 40 || lines.length > 1;
  };

  const fetchLoggedinUser = async () => {
    try {
      let user = await AsyncStorage.getItem("userDetails");
      if (user) {
        let userDetails = JSON.parse(user);
        setUserDetails(userDetails);
        setLikeCount(post?.likes?.length);
        if (post?.likes.includes(userDetails?._id)) setLike(true);
        if (userDetails?.savedPosts.includes(post?.postId)) setPostSaved(true);
      } else {
        console.log("No user details found in storage.");
      }
    } catch (err) {
      console.log("Error while fetching user details:", err);
    }
  };

  const deletePost = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this post permanently?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion canceled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await fetch(
                `${DEVICE_IP}/deletePost/${post.postId}`,
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                }
              );
              const resp = await response?.json();
              if (resp?.statusCode == 200) {
                setOpenMore(false);
                refresh(true);
                Alert.alert("Success", "Post deleted permanently");
              } else {
                setOpenMore(false);
                Alert.alert(
                  "Error",
                  resp.message || "Failed to delete the post."
                );
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          },
          style: "destructive", // Makes the "Delete" button red on iOS
        },
      ]
    );
  };

  const savePost = async (saveType) => {
    try {
      let api =
        saveType == "save"
          ? `${DEVICE_IP}/savePost`
          : `${DEVICE_IP}/unSavePost`;
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: loggedinUserDetails?._id,
          postId: post?.postId,
        }),
      });
      const resp = await response?.json();
      if (resp?.statusCode == 201) {
        setOpenMore(false);
        if (saveType == "save") setPostSaved(true);
        else setPostSaved(false);
        Alert.alert(
          "Success",
          `Post is ${saveType == "save" ? "Saved" : "Unsaved"} now`
        );
      } else {
        setOpenMore(false);
        Alert.alert("Error", resp.message || `Failed to ${saveType} the post`);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const likePost = async (likeType) => {
    if (likeType == "like") {
      setLike(true);
      setLikeCount(likeCount + 1);
    } else {
      setLike(false);
      setLikeCount(likeCount - 1);
    }
    try {
      let api =
        likeType == "like" ? `${DEVICE_IP}/like` : `${DEVICE_IP}/dislike`;
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryId: post?.userId,
          secondaryId: loggedinUserDetails?._id,
          postId: post?.postId,
        }),
      });
      const resp = await response?.json();
      if (resp?.statusCode == 201) {
        refresh(true);
      } else {
        Alert.alert("Error", resp.message || `Failed to ${likeType} the post`);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const viewProfile = async () => {
    if (post?.userId == loggedinUserDetails?._id) {
      router.replace("/profile");
    } else {
      await AsyncStorage.setItem("profileId", post?.userId);
      router.push("/viewProfile");
    }
  };

  const viewLikedList = async (type) => {
    setLikedList([]);
    setOpenLikeCount(true);
    try {
      const response = await fetch(
        `${DEVICE_IP}/likedUsers?id=${post?.postId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const resp = await response.json();
      if (resp?.statusCode === 200) {
        setLikedList(resp?.data);
      }
    } catch (error) {
      setLikedList([]);
      console.error("Fetch error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={async () => {
            viewProfile();
          }}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `${DEVICE_IP}${post?.avatar}` }}
              style={styles.avatar}
            />
          </View>
          <View style={{ height: 43, justifyContent: "space-between" }}>
            <Text style={styles.userName}>{post?.userName}</Text>
            <Text style={{ color: "gray", fontWeight: 500 }}>
              {post?.fullName}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {postSaved ? (
            <Icon name="bookmark" size={27} color="#FFA001" />
          ) : (
            <></>
          )}
          <TouchableOpacity onPress={() => setOpenMore(true)}>
            <Icon name="menu" size={27} color="#FFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.post}>
        <Image
          source={{ uri: `${DEVICE_IP}${post?.image}` }}
          style={styles.pic}
        />
      </View>
      <View style={{ marginBottom: 5, flexDirection: "row" }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 4 }}>
          {liked ? (
            <TouchableOpacity onPress={() => likePost("dislike")}>
              <Icon name="heart-plus" size={35} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => likePost("like")}>
              <Icon name="heart-outline" size={35} color="#FFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => viewLikedList(true)}>
            <Text style={{ color: "#FFFF", fontSize: 17 }}>{likeCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: 7,
          marginLeft: 10,
          width: 290,
        }}
      >
        <Text style={styles.userName}>{post.userName}</Text>
        <View style={{ gap: 6 }}>
          <Text style={{ color: "#FFFF" }}>
            {expanded ? post?.description : getTruncatedText(post?.description)}
          </Text>
          {shouldShowMoreButton(post?.description) && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={{ color: "gray" }}>
                {expanded ? "Less" : "More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={{ color: "gray", marginBottom: 20, marginLeft: 10 }}>
        {post.createdAt}
      </Text>
      <Modal
        animationType="fade"
        transparent={true}
        visible={openMore}
        onRequestClose={() => setOpenMore(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalRow}>
              <TouchableOpacity onPress={() => setOpenMore(false)}>
                <Icon name="close" size={27} color="#FFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => savePost(postSaved ? "unsave" : "save")}
            >
              {postSaved ? (
                <Text style={{ color: "#FFFF", fontSize: 17 }}>Unsave</Text>
              ) : (
                <Text style={{ color: "#FFFF", fontSize: 17 }}>Save</Text>
              )}
              {postSaved ? (
                <Icon name="bookmark" size={27} color="#FFA001" />
              ) : (
                <Icon name="bookmark" size={27} color="#FFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => {}}>
              <Text style={{ color: "#FFFF", fontSize: 17 }}>Share</Text>
              <Icon name="send" size={27} color="#FFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => {}}>
              <Text style={{ color: "#FFFF", fontSize: 17 }}>Download</Text>
              <Icon name="download" size={27} color="#FFFF" />
            </TouchableOpacity>
            {loggedinUserDetails?.userName == post?.userName ? (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => deletePost()}
              >
                <Text style={{ color: "red", fontSize: 17 }}>Delete</Text>
                <Icon name="delete" size={27} color="red" />
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={openLikeCount}
        onRequestClose={() => setOpenLikeCount(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpenLikeCount(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={likedList}
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
    </View>
  );
};

export default CustomPostView;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 30,
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
  pic: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  userName: {
    color: "#FFFF",
    fontWeight: 500,
    fontSize: 16,
  },
  post: {
    marginTop: 10,
    marginBottom: 7,
    borderColor: "#FFFF",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
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
    paddingRight: 9,
    paddingLeft: 9,
    borderRadius: 12,
    paddingHorizontal: 20,
    width: "90%",
  },
  modalRow: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
  },
  modalItem: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 5,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
  },
});
