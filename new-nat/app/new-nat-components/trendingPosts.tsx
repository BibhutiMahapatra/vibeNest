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
import CustomPostView from "./customPostView";
import CustomButton from "./customButtons";
import { DEVICE_IP } from "../constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomSearchList from "./customSearchList";
import EmptyContainer from "./emptyContainer";
import { router } from "expo-router";

const TrendingPosts = ({ post }) => {
  const [loggedinUserDetails, setUserDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openLikeCount, setOpenLikeCount] = useState(false);
  const [likedList, setLikedList] = useState([]);
  const [liked, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchLoggedinUser();
  }, []);

  const fetchLoggedinUser = async () => {
    try {
      let user = await AsyncStorage.getItem("userDetails");
      if (user) {
        let userDetails = JSON.parse(user);
        setUserDetails(userDetails);
        setLikeCount(post?.likes?.length);
        if (post?.likes.includes(userDetails?._id)) setLike(true);
        // if (userDetails?.savedPosts.includes(post?.postId)) setPostSaved(true);
      } else {
        console.log("No user details found in storage.");
      }
    } catch (err) {
      console.log("Error while fetching user details:", err);
    }
  };

  const getTruncatedText = (text) => {
    const lines = text.split("\n");
    if (lines[0].length > 35) {
      return `${lines[0].substring(0, 35)}...`;
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
        // refresh(true);
      } else {
        Alert.alert("Error", resp.message || `Failed to ${likeType} the post`);
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const viewProfile = async (id) => {
    setOpenLikeCount(false);
    setModalVisible(false);
    if (id == loggedinUserDetails?._id) {
      router.replace("/profile");
    } else {
      await AsyncStorage.setItem("profileId", id);
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
    <View>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <Image
          source={{ uri: `${DEVICE_IP}${post?.image}` }}
          style={styles.pic}
        />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.row}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${DEVICE_IP}${post?.avatar}` }}
                  style={styles.avatar}
                />
              </View>
              <View style={{ height: 40, justifyContent: "space-between" }}>
                <Text style={styles.userName}>{post?.userName}</Text>
                <Text style={{ fontWeight: 500, fontSize: 13 }}>
                  {post?.fullName}
                </Text>
              </View>
            </View>

            <Image
              source={{ uri: `${DEVICE_IP}${post?.image}` }}
              style={styles.fullImage}
            />
            <View style={{ marginBottom: 5, flexDirection: "row" }}>
              <View
                style={{ alignItems: "center", flexDirection: "row", gap: 4 }}
              >
                {liked ? (
                  <TouchableOpacity onPress={() => likePost("dislike")}>
                    <Icon name="heart-plus" size={35} color="red" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => likePost("like")}>
                    <Icon name="heart-outline" size={35} color="#000" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => viewLikedList(true)}>
                  <Text style={{ color: "#000", fontSize: 17 }}>
                    {likeCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ paddingHorizontal: 10, gap: 6 }}>
              <Text style={styles.postText}>
                {expanded
                  ? post?.description
                  : getTruncatedText(post?.description)}
              </Text>
              {shouldShowMoreButton(post?.description) && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                  <Text style={{ color: "gray" }}>
                    {expanded ? "Less" : "More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <CustomButton
              title="Close"
              handlePress={() => {
                setModalVisible(false);
              }}
              isLoading={false}
              width={"100%"}
            />
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
              <View style={styles.likedContent}>
                <FlatList
                  data={likedList}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <CustomSearchList
                      userDetails={item}
                      goToProfile={(id) => viewProfile(id)}
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

export default TrendingPosts;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 7,
    borderColor: "#FFFF",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    width: 160,
    margin: 4,
  },
  pic: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 7,
    borderRadius: 12,
    justifyContent: "center",
    width: "80%",
  },
  likedContent: {
    backgroundColor: "#161622",
    padding: 7,
    borderRadius: 12,
    justifyContent: "center",
    width: "80%",
  },
  fullImage: {
    width: "100%",
    height: 350,
    borderRadius: 10,
    marginBottom: 7,
  },
  postText: {
    color: "#000",
    fontSize: 14,
    // textAlign: "center",
    fontWeight: 600,
    // marginRight: 200,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 13,
    marginTop: 3,
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 30,
    borderColor: "black",
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
    color: "black",
    fontWeight: 600,
    fontSize: 16,
  },
});
