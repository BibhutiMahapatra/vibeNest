const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 5000;
const DEVICE_IP = "http://192.168.131.171:" + PORT;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log("Server is running");
});

mongoose
  .connect(
    "mongodb+srv://aspbibhutimahapatra:bibhu_351@bibhcluster.avcmn.mongodb.net/new-nat"
  )
  .then(() => {
    console.log("DB Connected;");
  });

const UserSchema = new mongoose.Schema({
  userName: String,
  email: String,
  password: String,
  fullName: String,
  bio: String,
  profilePic: String,
  uploadedPosts: [
    {
      postId: mongoose.Schema.Types.ObjectId,
      likes: [mongoose.Schema.Types.ObjectId],
      description: String,
      image: String,
      createdAt: String,
      createdTime: String,
    },
  ],
  savedPosts: Array,
  followingList: Array,
  followerList: Array,
});

const AllPostsSchema = new mongoose.Schema({
  postId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  description: String,
  image: String,
  createdAt: String,
  createdTime: String,
  likes: Array,
});

const User = mongoose.model("Users", UserSchema);
const PostCollection = mongoose.model("allPosts", AllPostsSchema);

app.post("/addUser", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({
      statusCode: 201,
      message: "user created",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({ message: "Error creating user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const isPasswordValid = await User.findOne({ password });

    if (!isPasswordValid || !user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid email or password" });
    }

    const foundUser = await User.findOne({ email, password });

    res.status(200).json({
      statusCode: 200,
      message: "user found",
      login: "valid",
      data: foundUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.find({ _id: id });
    res.status(200).json({
      statusCode: 200,
      message: "user found",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/searchUsers", async (req, res) => {
  try {
    const { searchValue } = req.query; // Extract the search query

    if (!searchValue) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Perform a case-insensitive partial match on userName and fullName
    const users = await User.find({
      $or: [
        { userName: { $regex: searchValue, $options: "i" } }, // Partial match for userName
        { fullName: { $regex: searchValue, $options: "i" } }, // Partial match for fullName
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No users found matching the query",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Users found",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Validate the updated data against the schema
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

app.post("/savePost", async (req, res) => {
  try {
    const { _id, postId } = req.body;

    if (!_id || !postId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    const user = await User.findByIdAndUpdate(
      _id,
      { $push: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Post saved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/unSavePost", async (req, res) => {
  try {
    const { _id, postId } = req.body;

    if (!_id || !postId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    const user = await User.findByIdAndUpdate(
      _id,
      { $pull: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Post UnSaved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/publishPost", async (req, res) => {
  try {
    const { _id, uploadedPosts } = req.body;

    if (!_id || !uploadedPosts) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    // Add a unique ID to the uploadedPost object
    const newPost = {
      ...uploadedPosts,
      postId: new mongoose.Types.ObjectId(), // Generate a unique ObjectId for the post
    };

    // Find and update the user document
    const user = await User.findByIdAndUpdate(
      _id,
      { $push: { uploadedPosts: newPost } },
      { new: true }
    );

    // Isert into All Posts
    const newPostForAllPost = {
      ...newPost,
      userId: user._id || "",
    };

    const newAllPost = new PostCollection(newPostForAllPost);
    await newAllPost.save();

    if (!user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Post uploaded successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.get("/allPosts", async (req, res) => {
  try {
    const allPosts = await PostCollection.find().sort({ createdTime: -1 });

    // Use Promise.all to handle async calls
    const enrichedPosts = await Promise.all(
      allPosts.map(async (element) => {
        const userInfo = await User.findOne({ _id: element?.userId });
        return {
          ...element.toObject(), // Convert the Mongoose document to a plain object
          userName: userInfo?.userName || "Unknown",
          fullName: userInfo?.fullName || "Unknown",
          avatar: userInfo?.profilePic || "",
        };
      })
    );

    res.status(200).json({
      statusCode: 200,
      message: "Found all posts",
      data: enrichedPosts,
    });
  } catch (error) {
    console.error("Error while getting all posts:", error);
    res.status(500).json({ message: "Error while getting all posts" });
  }
});

app.delete("/deletePost/:postId", async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res
      .status(400)
      .json({ statusCode: 400, message: "Invalid post ID" });
  }

  const mongoosePostId = new mongoose.Types.ObjectId(postId);
  try {
    const user = await User.findOneAndUpdate(
      { "uploadedPosts.postId": mongoosePostId }, // Match the postId in uploadedPosts
      { $pull: { uploadedPosts: { postId: mongoosePostId } } }, // Pull the matching post from the array
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Post not found" });
    }

    // Remove the post from the allPosts collection
    const deletedPost = await PostCollection.findOneAndDelete({
      postId: mongoosePostId, // Match the postId in allPosts
    });

    res.status(200).json({
      statusCode: 200,
      message: "Post deleted successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/followUser", async (req, res) => {
  try {
    const { primaryId, secondaryId } = req.body;

    if (!primaryId || !secondaryId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    // Find and update the user document
    const primaryUser = await User.findByIdAndUpdate(
      primaryId,
      { $push: { followingList: secondaryId } },
      { new: true }
    );

    // Find and update the user document
    const secondaryUser = await User.findByIdAndUpdate(
      secondaryId,
      { $push: { followerList: primaryId } },
      { new: true }
    );

    if (!primaryUser || !secondaryUser) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Follow System updated successfully",
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/unfollowUser", async (req, res) => {
  try {
    const { primaryId, secondaryId } = req.body;

    if (!primaryId || !secondaryId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    // Find and update the user document
    const primaryUser = await User.findByIdAndUpdate(
      primaryId,
      { $pull: { followingList: secondaryId } },
      { new: true }
    );

    // Find and update the user document
    const secondaryUser = await User.findByIdAndUpdate(
      secondaryId,
      { $pull: { followerList: primaryId } },
      { new: true }
    );

    if (!primaryUser || !secondaryUser) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Follow System updated successfully",
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/removeFollower", async (req, res) => {
  try {
    const { primaryId, secondaryId } = req.body;

    if (!primaryId || !secondaryId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    // Find and update the user document
    const primaryUser = await User.findByIdAndUpdate(
      primaryId,
      { $pull: { followerList: secondaryId } },
      { new: true }
    );

    if (!primaryUser) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Invalid userId" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Follow System updated successfully",
    });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.get("/followList", async (req, res) => {
  try {
    const { id, type } = req.query; // Extract from query parameters
    let followList = [];
    const searchedUser = await User.findOne({ _id: id }); // Use findOne for a single user

    if (!searchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (type === "following") {
      for (const element of searchedUser.followingList) {
        const user = await User.findOne({ _id: element });
        if (user) followList.push(user);
      }
    } else if (type === "followers") {
      for (const element of searchedUser.followerList) {
        const user = await User.findOne({ _id: element });
        if (user) followList.push(user);
      }
    } else {
      return res.status(400).json({ message: "Invalid type parameter" });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Follow list retrieved successfully",
      data: followList,
    });
  } catch (error) {
    console.error("Error while getting follow list:", error);
    res.status(500).json({ message: "Error while getting follow list" });
  }
});

app.post("/like", async (req, res) => {
  try {
    const { primaryId, secondaryId, postId } = req.body;

    if (!primaryId || !secondaryId || !postId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    const primaryUser = await User.findOneAndUpdate(
      { _id: primaryId, "uploadedPosts.postId": postId },
      { $addToSet: { "uploadedPosts.$.likes": secondaryId } }, // Use $addToSet to prevent duplicate likes
      { new: true }
    );

    const allPost = await PostCollection.findOneAndUpdate(
      { postId: postId },
      { $addToSet: { likes: secondaryId } }, // Use $addToSet to prevent duplicate likes
      { new: true }
    );

    if (!primaryUser || !allPost) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "User or Post not found" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Post liked successfully",
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.post("/dislike", async (req, res) => {
  try {
    const { primaryId, secondaryId, postId } = req.body;

    if (!primaryId || !secondaryId || !postId) {
      return res.status(400).json({ statusCode: 400, message: "Invalid Data" });
    }

    const primaryUser = await User.findOneAndUpdate(
      { _id: primaryId, "uploadedPosts.postId": postId },
      { $pull: { "uploadedPosts.$.likes": secondaryId } },
      { new: true }
    );

    const allPost = await PostCollection.findOneAndUpdate(
      { postId: postId },
      { $pull: { likes: secondaryId } }, // Use $addToSet to prevent duplicate likes
      { new: true }
    );

    if (!primaryUser || !allPost) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "User or Post not found" });
    }

    res.status(201).json({
      statusCode: 201,
      message: "Post disliked successfully",
    });
  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
});

app.get("/likedUsers", async (req, res) => {
  try {
    const { id } = req.query; // Extract from query parameters
    let likedList = [];
    const searchedPost = await PostCollection.findOne({ postId: id }); // Use findOne for a single user

    if (!searchedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    for (const element of searchedPost.likes) {
      const user = await User.findOne({ _id: element });
      if (user) likedList.push(user);
    }

    res.status(200).json({
      statusCode: 200,
      message: "Liked list retrieved successfully",
      data: likedList,
    });
  } catch (error) {
    console.error("Error while getting follow list:", error);
    res.status(500).json({ message: "Error while getting follow list" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.post("/upload", upload.single("media"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `${DEVICE_IP}/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "File uploaded successfully",
      url: fileUrl,
    });
  } catch (err) {
    console.error("Error uploading file:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
