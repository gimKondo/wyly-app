import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const { v4: uuidv4 } = require('uuid');

admin.initializeApp();
const { pickPostRandomly } = require('./firestore-post');
const { MESSAGES } = require('./messages');
const { COLLECTION_NAME } = require('./collection-name');
const { TIMELINE_TYPE } = require('./timeline-type');

const REGION = 'asia-northeast1';
const firestore = admin.firestore();

/**
 * Create user and user profile document on signing up
 */
exports.onCreateUser = functions.region(REGION).auth.user().onCreate(async (user) => {
  const batch = firestore.batch();

  batch.set(firestore.doc(`${COLLECTION_NAME.users}/${user.uid}`), {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.set(firestore.doc(`${COLLECTION_NAME.profiles}/${user.uid}`), {
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
});

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
  const postSnapshot = await pickPostRandomly();
  if (postSnapshot.empty) {
    throw new functions.https.HttpsError('internal', MESSAGES.errors.POST_NOT_FOUND);
  }

  // create timeline
  const postRef = postSnapshot.docs[0].ref;
  const contributorRef = postRef.parent.parent;
  await firestore
    .collection(COLLECTION_NAME.users)
    .doc(context.auth.uid)
    .collection(COLLECTION_NAME.timelines)
    .doc()
    .set({
      post: postRef,
      type: TIMELINE_TYPE.SEARCH,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      contributor: contributorRef,
    });

  // return found post
  const postDoc = await postRef.get();
  const postData = postDoc.data();
  console.log(`found post. postData:[${JSON.stringify(postData)}]`);
  const { name, imagePath, createdAt } = postData;
  return { name, imagePath, createdAt: createdAt.toMillis() };
});

/**
 * Add random field when Post document is created
 */
exports.onCreatePostDocument = functions.region(REGION).firestore.document('users/{userId}/posts/{postId}').onCreate(async (snap, context) => {
  const { userId, postId } = context.params;

  firestore
    .collection(COLLECTION_NAME.users)
    .doc(userId)
    .collection(COLLECTION_NAME.posts)
    .doc(postId)
    .update({ random: uuidv4() })
    .then(() => console.debug())
    .catch(err => console.error(`fail to add random field at post. err:[${err}]`));
});
