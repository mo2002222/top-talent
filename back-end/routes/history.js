const express = require("express");
const router = express.Router();
const WatchHistory = require("../modules/WatchHistory");
const mongoose = require("mongoose");
// POST -> save watching record
router.post("/history/add/:userId/:postId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res.status(400).json({ error: "Missing data" });
    }

    // لو شاهد نفس الفيديو قبل كده نحذف القديم ونضيف الجديد علشان يبقى آخر مشاهدة فوق
    await WatchHistory.deleteOne({ userId, postId });

    await WatchHistory.create({ userId, postId });

    res.json({ message: "History saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save history" });
  }
});

router.get("/watch-history/:userId", async (req, res) => {
  try {
    const {userId}  = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const history = await WatchHistory.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ watchedAt: -1 })
      .populate("postId");

    res.status(200).json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/watch-history/:userId/clear", async (req, res) => {
  try {
    const { userId } = req.params;

    await WatchHistory.deleteMany({ userId });

    res.json({ message: "History cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
});


module.exports = router;
