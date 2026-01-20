const axios = require("axios");
const Post = require("../modules/Post");
const AdminNotification = require("../modules/AdminNotifications");

// ===== HuggingFace CONFIG =====
const HF_MODEL =
  "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32";

const HF_HEADERS = {
  Authorization: `Bearer ${process.env.HF_TOKEN}`,
};

// ===== HELPERS =====

// هل الرابط فيديو؟
function isVideo(url) {
  return url.match(/\.(mp4|mov|avi|mkv|webm)/i);
}

// توليد 5 thumbnails من Cloudinary
function generateVideoThumbnails(videoUrl) {
  const timestamps = [5, 15, 30, 45, 60];
  return timestamps.map((t) =>
    videoUrl.replace("/upload/", `/upload/so_${t}/`)
  );
}

// فحص صورة واحدة عبر HuggingFace
async function analyzeImage(imageUrl) {
  try {
    const res = await axios.post(
      HF_MODEL,
      {
        inputs: {
          image: imageUrl,
          text: [
            "football match",
            "soccer game",
            "football player",
            "sports stadium",
            "football field",
            "non sports image",
          ],
        },
      },
      {
        headers: HF_HEADERS,
        timeout: 30000,
      }
    );

    return res.data; // [{ label, score }]
  } catch (err) {
    console.error("HF image analysis failed:", err.message);
    return null;
  }
}

// هل الصورة متعلقة بكرة القدم؟
function isFootballRelated(predictions = []) {
  return predictions.some(
    (p) =>
      p.label.toLowerCase().includes("football") ||
      p.label.toLowerCase().includes("soccer")
  );
}

// ===== MAIN SERVICE =====

async function runModerationCheck(postId) {
  try {
    const post = await Post.findById(postId);
    if (!post) return;

    const mediaUrls = post.videoUrl || [];
    let imagesToAnalyze = [];

    // تجهيز الصور (صور مباشرة + thumbnails للفيديو)
    for (const url of mediaUrls) {
      if (isVideo(url)) {
        imagesToAnalyze.push(...generateVideoThumbnails(url));
      } else {
        imagesToAnalyze.push(url);
      }
    }

    // نحلل أول 5 صور فقط
    imagesToAnalyze = imagesToAnalyze.slice(0, 5);

    let footballHits = 0;
    let analysisSucceeded = true;

    for (const imageUrl of imagesToAnalyze) {
      const predictions = await analyzeImage(imageUrl);

      if (!predictions) {
        analysisSucceeded = false;
        continue;
      }

      if (isFootballRelated(predictions)) {
        footballHits++;
      }
    }

    // ===== القرار النهائي =====
    let newStatus = "pending";

    if (analysisSucceeded) {
      if (footballHits >= 3) {
        newStatus = "approved";
      } else {
        newStatus = "flagged";
      }
    }

    post.moderationStatus = newStatus;
    await post.save();

    // ===== Notification للأدمن ===== 
    if (newStatus !== "pending") {
      await AdminNotification.create({
        title:
          newStatus === "approved"
            ? "Appropriate content has been published"
            : "⚠️Inappropriate content was published",
        type: newStatus,
        postId: post._id,
        postUrl: `https://localhost:3000/posts/${mediaUrls.filter(url => isVideo(url)).length > 0 ? mediaUrls.find(url => isVideo(url)) : mediaUrls[0]}`,
        cloudinaryUrls: mediaUrls,
      });
    }
 
    console.log(
      `Moderation finished for post ${postId}: ${newStatus}`
    );
  } catch (err) {
    console.error("Moderation service error:", err);
  } 
}

module.exports = {
  runModerationCheck,
};
