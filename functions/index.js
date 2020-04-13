const admin = require('firebase-admin');
const functions = require('firebase-functions');

const messages = require('./messages').messages;

const REGION = 'asia-northeast1';
admin.initializeApp();

exports.helloWorld = functions.region(REGION).https.onRequest((request, response) => {
  response.send("Hello from AI!");
});

/**
 * Search around and create timeline item
 *
 * 1. search post randomly from all posts
 * 2. create timeline item
 * 3. return post item
 */
exports.searchAround = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', messages.errors.UNAUTHENTICATED);
  const firestore = admin.firestore();

  // search posts
  // TODO: search randomly
  const postSnapshot = await firestore
    .collectionGroup('posts')
    .where('isPublic', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (postSnapshot.empty) {
    throw new functions.https.HttpsError('internal', messages.errors.POST_NOT_FOUND);
  }
  const postRef = postSnapshot.docs[0].ref;

  // create timeline
  const timelineItem = {
    post: postRef,
    createdAt: new Date(),
  };
  const authId = context.auth.uid;
  await firestore
    .collection('users')
    .doc(authId)
    .collection('timelines')
    .doc()
    .set(timelineItem);

  // return found post
  const receiptDoc = await postRef.get();
  return {
    name: receiptDoc.name,
    imagePath: receiptDoc.imagePath,
    createdAt: receiptDoc.createdAt,
  };
});
