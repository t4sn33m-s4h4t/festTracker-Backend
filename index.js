const express = require("express");
const cors = require('cors');

const Post = require("./models/Post");

const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify:true
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});



// get upcoming posts

app.get("/api/upcoming", async (req, res) => {
  
  try {
    let posts;
    posts = await Post.find();
    let filteredPosts = posts.filter((pd) => {
      var eventTiming = new Date(pd.startTime);
      var currentTime = new Date();
      return eventTiming > currentTime;
    });
    posts = filteredPosts.reverse();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
// get running posts
app.get("/api/running", async (req, res) => {
  
  try {
    let posts;
    posts = await Post.find();
    let filteredPosts = posts.filter((pd) => {
      var eventStartTime = new Date(pd.startTime);
      var eventEndTime = new Date(pd.endTime);
      var currentTime = new Date();
      return (eventStartTime <= currentTime && eventEndTime > currentTime);
    });
    posts = filteredPosts.reverse();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

app.listen("5000", () => {
  console.log("Backend is running.");
});
