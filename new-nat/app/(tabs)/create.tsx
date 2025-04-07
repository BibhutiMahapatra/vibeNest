import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomFormfield from "../new-nat-components/customFormfield";
import CustomButton from "../new-nat-components/customButtons";
import { DEVICE_IP } from "../constant";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Video from "react-native-video";

const MediaContainer = ({ mediaUrl }) => {
  // Check if the media is an image or video based on the file extension
  const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);

  return (
    <View style={styles.mediaContainer}>
      {isVideo ? (
        <Video
          source={{ uri: mediaUrl }}
          style={styles.video}
          resizeMode="contain"
          // useNativeControls // Adds video controls (play, pause, etc.)
          // shouldPlay={false} // Start paused by default
        />
      ) : (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const Create = () => {
  const [loggedinUserDetails, setUserDetails] = useState(null);
  const [postDescription, setDescription] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [image, setImage] = useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getFormattedTime = () => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight as 12
    const formattedTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
    return formattedTime;
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(false);
    setImage("");
    setDescription("");
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
      } else {
        console.log("No user details found in storage.");
      }
    } catch (err) {
      console.log("Error while fetching user details:", err);
    }
  };

  const pickMedia = async () => {
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (!libraryPermission.granted || !cameraPermission.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to grant permission to access the gallery and camera"
      );
      return;
    }

    Alert.alert(
      "Select Media Source",
      "Would you like to use the camera or pick a media file (image/video) from your gallery?",
      [
        {
          text: "Camera",
          onPress: async () => {
            const cameraResult = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both images and videos
              allowsEditing: true,
              aspect: [4, 4],
              quality: 1,
            });

            if (!cameraResult.canceled) {
              const fileUri = cameraResult.assets[0].uri;
              const isVideo = cameraResult.assets[0].type === "video";
              await handleMediaUpload(fileUri, isVideo);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const libraryResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows both images and videos
              allowsEditing: true,
              aspect: [4, 4],
              quality: 1,
            });

            if (!libraryResult.canceled) {
              const fileUri = libraryResult.assets[0].uri;
              const isVideo = libraryResult.assets[0].type === "video";
              await handleMediaUpload(fileUri, isVideo);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleMediaUpload = async (localUri, isVideo) => {
    try {
      const formData = new FormData();
      formData.append("media", {
        uri: localUri,
        name: `file-${Date.now()}.${isVideo ? "mp4" : "jpg"}`, // Dynamically set file extension
        type: isVideo ? "video/mp4" : "image/jpeg", // Set the MIME type
      } as any);

      const response = await fetch(`${DEVICE_IP}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const resultData = await response.json();

      if (response.ok) {
        Alert.alert(
          "Upload Successful",
          `${isVideo ? "Video" : "Image"} uploaded successfully!`
        );
        setImage(getRelativePath(resultData.url)); // Adjust as needed for videos
      } else {
        Alert.alert("Upload Failed", resultData.message || "Try again later.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Error", "An error occurred while uploading the media.");
    }
  };

  const getRelativePath = (fullUrl) => {
    const url = new URL(fullUrl);
    return url.pathname;
  };

  const submit = async () => {
    if (!postDescription || !image) {
      Alert.alert("Error", "Please fill out all fields and upload an image.");
      return;
    }

    setIsSubmit(true);

    try {
      const date = new Date();

      const response = await fetch(`${DEVICE_IP}/publishPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: loggedinUserDetails?._id,
          uploadedPosts: {
            description: postDescription,
            image: image,
            createdAt: formattedDate,
            createdTime: date,
          },
        }),
      });

      const resp = await response.json();

      if (resp?.statusCode == 201) {
        setIsSubmit(false);
        setDescription("");
        setImage("");
        router.replace("/home");
        Alert.alert("Post Created", "Your post has been created successfully!");
      }
    } catch (err) {
      setIsSubmit(false);
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={{ color: "#FFFF", fontSize: 22, fontWeight: 600 }}>
            Create a Post
          </Text>
          <View style={{ marginVertical: 10, gap: 20 }}>
            {!image ? (
              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    color: "#FFFF",
                    fontSize: 15,
                    paddingLeft: 10,
                  }}
                >
                  Upload your post
                </Text>
                <View style={styles.uploadContainer}>
                  <TouchableOpacity onPress={pickMedia}>
                    <Image
                      source={require("../../assets/icons/upload.png")}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={(e) => {
                      pickMedia();
                    }}
                  >
                    <Icon name="collections" size={30} color="#FFFF" />
                  </TouchableOpacity>
                </View>
                {/* <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: `${DEVICE_IP}${image}` }}
                    resizeMode="contain"
                    style={{
                      width: "100%",
                      height: 350,
                      resizeMode: "contain",
                    }}
                  />
                </View> */}
                <View style={styles.imageContainer}>
                  <MediaContainer mediaUrl={`${DEVICE_IP}${image}`} />
                </View>
              </>
            )}
            <View style={{ zIndex: 5 }}>
              <CustomFormfield
                label={"Description"}
                placeholder={"Add Description of your post"}
                value={postDescription}
                handleChangeText={(e) => setDescription(e)}
                multiline={true}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <CustomButton
          title={"Done & Publish"}
          handlePress={submit}
          isLoading={isSubmit}
          width={"100%"}
        />
      </View>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#161622",
    height: "100%",
  },
  container: {
    margin: 20,
    height: "100%",
    justifyContent: "space-between",
  },
  uploadContainer: {
    backgroundColor: "black",
    borderRadius: 12,
    borderColor: "#353535",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  fieldCls: {
    backgroundColor: "black",
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    borderColor: "#353535",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    paddingLeft: 10,
  },
  inputColor: {
    color: "#FFFF",
    fontWeight: "400",
  },
  imageContainer: {
    backgroundColor: "#FFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#353535",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    width: "100%",
  },
  mediaContainer: {
    width: "100%",
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFF",
  },
  video: {
    width: "100%",
    height: 350,
  },
  image: {
    width: "100%",
    height: 350,
  },
});
