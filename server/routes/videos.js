const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const multer = require("multer");
const { verifyAccessToken } = require("../helpers/ApiAccess");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4" || ext !== ".mov") {
      return cb(
        res.status(400).end("only supported video files are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

var upload = multer({ storage: storage }).single("file");

// Upload new videoFile

router.post("/upload", verifyAccessToken, async (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err) {
        return res.json({ success: false, err });
      }

      return res.json({
        success: true,
        filePath: res.req.file.path,
        fileName: res.req.file.filename,
      });
    });
  } catch (error) {
    res.send(error);
  }
});

// Upload new video
router.post("/", verifyAccessToken, async (req, res) => {
  try {
    const video = await new Video(req.body).save();
    res.send(video);
  } catch (error) {
    res.send(error);
  }
});

// Get homePage videos
router.get("/home/videos/:number", verifyAccessToken, async (req, res) => {
  try {
    let num = req.params.number >= 8 ? 8 : 4;
    const videos = await Video.find(
      { visibility: { $ne: 2 } },
      {
        videoPath: 0,
        watchtime: 0,
        description: 0,
        category: 0,
        comments: 0,
        likes: 0,
        dislikes: 0,
        isNFT: 0,
        nftOwners: 0,
      }
    )
      .limit(num)
      .populate(
        "creator",
        "userId username ProfileAvatar isVerified isOnline followers"
      )
      .sort({ views: -1 });
    res.send(videos);
  } catch (error) {
    res.send(error);
  }
});

// Get specefic video
router.get("/:id/user/:userId", verifyAccessToken, async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.id }).populate(
      "creator",
      "userId username ProfileAvatar isVerified isOnline followers"
    );
    if (video == null) {
      res.send({ status: "not found" });
    } else {
      if (video?.isNFT && video?.nftOwners?.includes(req.params.userId)) {
        res.send(video);
      } else if (
        video?.isNFT &&
        !video?.nftOwners?.includes(req.params.userId)
      ) {
        var data = {
          ...video._doc,
          videoPath:
            "https://bafybeibmdmuv6qqgs7yxfymd3yyynz4my6cssqsj6hikylmnrww4qvmq5q.ipfs.w3s.link/Group%205.png",
        };
        res.send(data);
      } else {
        res.send(video);
      }
    }
  } catch (error) {
    res.send({ status: "not found" });
  }
});

// Get all user videos
router.get("/user/:userId", verifyAccessToken, async (req, res) => {
  try {
    const videos = await Video.find(
      { creator: req.params.userId },
      { videoPath: 0 }
    ).sort({ createdAt: -1 });
    if (videos == null) res.send({ status: "not found" });
    else {
      res.send(videos);
    }
  } catch (error) {
    res.send({ status: "not found" });
  }
});

// edit video
router.put("/edit/:video", verifyAccessToken, async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { videoId: req.params.video },
      req.body,
      { new: true }
    ).select({ videoPath: 0 });
    res.send(video);
  } catch (error) {
    res.send(error);
  }
});

// Get all videos
router.get("/all/:skip/:limit", verifyAccessToken, async (req, res) => {
  try {
    const skip = req.params.skip;
    const limit = req.params.limit;
    const videos = await Video.find(
      { visibility: { $ne: 2 } },
      {
        videoPath: 0,
        watchtime: 0,
        description: 0,
        comments: 0,
        likes: 0,
        dislikes: 0,
        isNFT: 0,
        nftOwners: 0,
      }
    )
      .skip(skip * limit)
      .limit(limit)
      .populate(
        "creator",
        "userId username ProfileAvatar isVerified isOnline followers"
      )
      .exec();
    res.send(videos);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
