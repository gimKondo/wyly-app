import * as admin from 'firebase-admin';
const { v4: uuidv4 } = require('uuid');

const { COLLECTION_NAME } = require('./collection-name');

const firestore = admin.firestore();

/**
 * Direction search operator and order
 */
const DIRECTION_SEARCH = {
  ASC: { whereOp: '>', order: 'asc' },
  DESC: { whereOp: '<=', order: 'desc' },
}

/**
 * pick post randomly
 */
module.exports.pickPostRandomly = async () => {
  const uuid = uuidv4();
  console.log(`search key. random:[${uuid}]`);
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
const getPostByRandomField = async (uuid: string, { whereOp, order }: any) => {
  return await firestore
    .collectionGroup(COLLECTION_NAME.posts)
    .where('isPublic', '==', true)
    .where('random', whereOp, uuid)
    .orderBy('random', order)
    .limit(1)
    .get();
}
