const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');

const { pickPostRandomly } = require('./collection-name');
const { MESSAGES } = require('./messages');
const { COLLECTION_NAME } = require('./collection-name');

const REGION = 'asia-northeast1';
admin.initializeApp();
const firestore = admin.firestore();

/**
 * Search around and create timeline item
 *
 * 1. search post randomly from all posts
 * 2. create timeline item
 * 3. return post item
 */
exports.searchAround = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', MESSAGES.errors.UNAUTHENTICATED);

  // search posts
  // TODO: search randomly
  const postSnapshot = await pickPostRandomly();
  if (postSnapshot.empty) {
    throw new functions.https.HttpsError('internal', MESSAGES.errors.POST_NOT_FOUND);
  }

  // create timeline
  await firestore
    .collection(COLLECTION_NAME.users)
    .doc(context.auth.uid)
    .collection(COLLECTION_NAME.timelines)
    .doc()
    .set({
      post: postSnapshot.docs[0].ref,
      createdAt: new Date(),
    });

  // return found post
  const postDoc = await postRef.get();
  return {
    name: postDoc.name,
    imagePath: postDoc.imagePath,
    createdAt: postDoc.createdAt,
  };
});

/**
 * Add random field when Post document is created
 */
exports.onCreatePostDocument = functions.region(REGION).firestore.document('users/{userId}/posts/{postId}').onCreate(async (snap, context) => {
  const { userId, postId } = context.params;

  const firestore = admin.firestore();
  firestore
    .collection(COLLECTION_NAME.users)
    .doc(userId)
    .collection(COLLECTION_NAME.posts)
    .doc(postId)
    .update({random: uuidv4()})
    .then(() => console.debug() )
    .catch(err => console.error(`fail to add random field at post. err:[${err}]`));
});
