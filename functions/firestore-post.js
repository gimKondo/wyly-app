const admin = require('firebase-admin');
const uuidv4 = require('uuid/v4');

const firestore = admin.firestore();

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
module.exports.pickPostRandomly = async () => {
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