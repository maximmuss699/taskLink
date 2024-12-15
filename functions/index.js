/**
 * Import function triggers from their respective submodules:
 *
 * const { onCall } = require("firebase-functions/v2/https");
 * const { onDocumentWritten } = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {getFirestore} = require("firebase-admin/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getFirestore();

exports.updatePostRating = onDocumentWritten("jobEval/{docId}", async (e) => {
  const collectionRef = db.collection("jobEval");
  const postsRef = db.collection("posts");

  try {
    // Získání všech hodnocení z kolekce "jobEval"
    const snapshot = await collectionRef.get();

    // Vytvoření objektu pro uložení hodnocení podle postId
    const ratingsByPost = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const postId = data.postId;

      if (!ratingsByPost[postId]) {
        ratingsByPost[postId] = {totalRating: 0, count: 0};
      }

      ratingsByPost[postId].totalRating += data.rating;
      ratingsByPost[postId].count += 1;
    });

    // Pro každý postId vypočítáme průměrné hodnocení a aktualizujeme
    const updates = Object.entries(ratingsByPost).map(async ([postId, s]) => {
      const averageRating = s.totalRating / s.count;

      await postsRef.doc(postId).update({
        rating: averageRating,
        ratingCnt: s.count,
      });
    });

    await Promise.all(updates);
    console.log("Post ratings successfully updated!");
  } catch (error) {
    console.error("Error updating post ratings: ", error);
  }
});
