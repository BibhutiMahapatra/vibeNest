import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import CustomButton from "./new-nat-components/customButtons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const index = () => {
  const router = useRouter();
  const [loggedinUserDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchLoggedinUser = async () => {
      try {
        let user = await AsyncStorage.getItem("userDetails");
        if (user) {
          let userDetails = JSON.parse(user);
          setUserDetails(userDetails);
        } else {
          setUserDetails(null);
          console.log("No user details found in storage.");
        }
      } catch (err) {
        setUserDetails(null);
        console.log("Error while fetching user details:", err);
      }
    };
    fetchLoggedinUser();
  }, []);

  useEffect(() => {
    if (loggedinUserDetails?.userName) {
      router.push("/home");
    }
  }, [loggedinUserDetails]);

  return (
    <SafeAreaView style={{ backgroundColor: "#161622", height: "100%" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#161622"
        translucent={false}
      />
      {!loggedinUserDetails?.userName && (
        <>
          <ScrollView contentContainerStyle={{ height: "100%" }}>
            <View style={styles.container}>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  style={styles.logoSize}
                  resizeMode="contain"
                  source={require("../assets/images/vibeNestLogo.png")}
                />
                <Text style={{ fontSize: 32, fontWeight: 600, color: "#FFFF" }}>
                  VibeNest
                </Text>
              </View>
              <Image
                style={styles.imageSize}
                resizeMode="contain"
                source={require("../assets/images/cards.png")}
              />
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.bigFont}>Discover Endless</Text>
                <Text style={styles.bigFont}>
                  Connections with{" "}
                  <Text style={{ color: "#FFA001" }}>VibeNest</Text>
                </Text>
              </View>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.smlFont}>
                  Where vibes take flight and connections ignite
                </Text>
              </View>
              <CustomButton
                title="Continue with Email"
                handlePress={() => {
                  router.push("/signIn");
                }}
                isLoading={false}
                width={300}
              />
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    height: "100%",
  },
  logoSize: {
    width: 100,
    height: 100,
  },
  imageSize: {
    width: 400,
    height: 300,
  },
  bigFont: {
    color: "#FFFF",
    fontSize: 30,
    fontWeight: 600,
  },
  smlFont: {
    fontSize: 13,
    color: "gray",
    fontWeight: 400,
    textAlign: "center",
  },
  pathSize: {
    height: 10,
  },
});
