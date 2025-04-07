import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import CustomFormfield from "../new-nat-components/customFormfield";
import CustomButton from "../new-nat-components/customButtons";
import { router } from "expo-router";
import { DEVICE_IP } from "../constant";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [isSubmit, setIsSubmit] = useState(false);

  const submit = async () => {
    setIsSubmit(true);

    if (!form.userName || !form.email || !form.password) {
      Alert.alert("Error", "Please fill all the fields");
      setIsSubmit(false);
      return;
    }

    try {
      const response = await fetch(`${DEVICE_IP}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (data.statusCode == 201) {
        await AsyncStorage.setItem("userDetails", JSON.stringify(data.data));
        router.replace("/home");
      } else {
        Alert.alert("Error", data.message || "Invalid credentials");
        setIsSubmit(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsSubmit(false);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#161622", height: "100%" }}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View style={styles.container}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 50,
            }}
          >
            <Image
              style={styles.logoSize}
              resizeMode="contain"
              source={require("../../assets/images/vibeNestLogo.png")}
            />
            <Text style={{ fontSize: 32, fontWeight: 600, color: "#FFFF" }}>
              VibeNest
            </Text>
          </View>
          <Text
            style={{
              color: "#FFFF",
              fontSize: 18,
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            Sign Up to VibeNest
          </Text>
          <CustomFormfield
            label={"User Name"}
            placeholder={"Enter User Name"}
            value={form.userName}
            handleChangeText={(e) => setForm({ ...form, userName: e })}
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
            label={"Password"}
            placeholder={"Enter Password"}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            multiline={false}
          />
          <CustomButton
            title={"Sign Up"}
            handlePress={submit}
            isLoading={isSubmit}
            width={"100%"}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              margin: 10,
            }}
          >
            <Text style={{ color: "gray" }}>Already Have an Account?</Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/signIn");
              }}
            >
              <Text style={{ color: "#FFA001", fontWeight: 400 }}>
                {" "}
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    gap: 8,
    height: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: "center",
  },
  logoSize: {
    width: 100,
    height: 100,
  },
});
