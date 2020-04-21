const admin = require('firebase-admin');
const functions = require('firebase-functions');
const uuidv4 = require('uuid/v4');

const messages = require('./messages').messages;
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
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', messages.errors.UNAUTHENTICATED);

  // search posts
  // TODO: search randomly
  const postSnapshot = await pickPostRandomly();
  if (postSnapshot.empty) {
    throw new functions.https.HttpsError('internal', messages.errors.POST_NOT_FOUND);
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
  const receiptDoc = await postRef.get();
  return {
    name: receiptDoc.name,
    imagePath: receiptDoc.imagePath,
    createdAt: receiptDoc.createdAt,
  };
});

/**
 * Direction search operator and order
 */
const DIRECTION_SEARCH = {
  ASC: {whereOp: '>', order: 'asc'},
  DESC: {whereOp: '<=', order: 'desc'},
}

/**
 * pick post randomly
 */
const pickPostRandomly = async () => {
  const uuid = uuidv4();
  const postSnapshot = await getPostByRandomField(uuid, DIRECTION_SEARCH.ASC);
  if (!postSnapshot.empty) {
    return postSnapshot;
  }
  return await await getPostByRandomField(uuid, DIRECTION_SEARCH.DESC);
}

/**
 * get post by random field
 * @param {String} uuid search key
 * @param {String} whereOp '>' or '<='
 * @param {String} orderDirection 'asc' or 'desc'
 */
const getPostByRandomField = async (uuid, {whereOp, order}) => {
  return await firestore
    .collectionGroup(COLLECTION_NAME.posts)
    .where('isPublic', '==', true)
    .where('random', whereOp, uuid)
    .orderBy('random', order)
    .limit(1)
    .get();
}

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
