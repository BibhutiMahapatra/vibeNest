import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ImageSourcePropType,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomFormfield from "./customFormfield";
import CustomButton from "./customButtons";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { DEVICE_IP } from "../constant";

const EditProfile = ({ userDetails, close }) => {
  const [isSubmit, setIsSubmit] = useState(false);

  const [image, setImage] = useState<ImageSourcePropType | string>(
    require("../../assets/images/default-avatar.png")
  );

  useEffect(() => {
    if (userDetails?.profilePic) {
      setImage(userDetails.profilePic);
    }
  }, [userDetails]);

  const [form, setForm] = useState({
    _id: userDetails?._id ?? "",
    userName: userDetails?.userName ?? "",
    fullName: userDetails?.fullName ?? "",
    email: userDetails?.email ?? "",
    bio: userDetails?.bio ?? "",
  });

  const submit = async () => {
    setIsSubmit(true);

    try {
      const response = await fetch(`${DEVICE_IP}/users/${form._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          fullName: form.fullName,
          bio: form.bio,
          profilePic: typeof image === "string" ? image : "",
        }),
      });

      const resp = await response.json();

      if (response.ok) {
        Alert.alert("Success", "User updated successfully!");
      } else {
        Alert.alert("Error", resp.message || "Failed to update the user.");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmit(false);
    }
  };

  const pickImage = async () => {
    // Request permissions for accessing the media library and camera
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

    // Ask the user to select between Camera or Gallery
    Alert.alert(
      "Select Image Source",
      "Would you like to use the camera or pick an image from your gallery?",
      [
        {
          text: "Camera",
          onPress: async () => {
            const cameraResult = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!cameraResult.canceled) {
              await handleImageUpload(cameraResult.assets[0].uri);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const libraryResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!libraryResult.canceled) {
              await handleImageUpload(libraryResult.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleImageUpload = async (localUri) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: localUri,
        name: `photo-${Date.now()}.jpg`,
        type: "image/jpeg",
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
        setImage(getRelativePath(resultData.url));
      } else {
        Alert.alert("Upload Failed", resultData.message || "Try again later.");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Error", "An error occurred while uploading the image.");
    }
  };

  const getRelativePath = (fullUrl) => {
    const url = new URL(fullUrl);
    return url.pathname;
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "#FFFF", fontSize: 17, fontWeight: "600" }}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={() => close(false)}>
            <Icon name="cancel" size={27} color="#FFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={pickImage}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#2d6ee8",
              borderRadius: 30,
              position: "absolute",
              top: 0,
              right: "35%",
              zIndex: 1,
            }}
            onPress={pickImage}
          >
            <TouchableOpacity onPress={pickImage}>
              <Icon name="add" size={20} color="#FFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            {image && (
              <Image
                source={
                  typeof image === "string"
                    ? { uri: `${DEVICE_IP}${image}` }
                    : image
                }
                style={styles.avatar}
              />
            )}
          </View>
        </TouchableOpacity>
        <CustomFormfield
          label={"User Name"}
          placeholder={"Enter your User Name"}
          value={form.userName}
          handleChangeText={(e) => setForm({ ...form, userName: e })}
          multiline={false}
        />
        <CustomFormfield
          label={"Full Name"}
          placeholder={"Enter your Full Name"}
          value={form.fullName}
          handleChangeText={(e) => setForm({ ...form, fullName: e })}
          multiline={false}
        />
        <CustomFormfield
          label={"Email"}
          placeholder={"Enter your email"}
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          multiline={false}
        />
        <CustomFormfield
          label={"Bio"}
          placeholder={"Enter your Bio"}
          value={form.bio}
          handleChangeText={(e) => setForm({ ...form, bio: e })}
          multiline={false}
        />
        <CustomButton
          title={"Done"}
          isLoading={isSubmit}
          width={"100%"}
          handlePress={submit}
        />
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#161622",
    padding: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
    width: "90%",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderColor: "#FFFF",
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
