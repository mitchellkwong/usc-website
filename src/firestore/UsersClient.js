import _ from 'lodash'

export function getUserProfile(firestore, userID, callback = () => {}, alias = 'userProfile') {
  firestore
  .get({
    collection: 'users',
    doc: userID,
    storeAs: alias})
  .then((snapshot) => callback(snapshot))
}

export function getUserProfileByEmail(firestore, email, callback, alias = 'userProfile') {
  firestore
  .get({
    collection: 'users',
    where: [
      ['email', '==', email]
    ],
    storeAs: alias})
  .then((snapshot) => callback(snapshot))
}

export function getUserTypes(firestore, callback) {
  firestore
  .get({
    collection: 'userTypes'
  })
  .then((snapshot) => callback(snapshot))
}

export function formatFirestoreProfile(profile) {
  var newProfile = {
    avatarUrl: profile.avatarUrl,
    displayName: profile.displayName,
    email: profile.email,
    providerData: profile.providerData,
    telegram: profile.telegram
  }

  return _.pickBy(newProfile, _.identity)
}

export function saveProfile(firestore, profile, callback) {
  firestore
  .set({ collection: 'users', doc: profile.id }, formatFirestoreProfile(profile))
  .then((snapshot) => callback(snapshot))
}

export function watchProfile(firestore, profile, alias) {
  firestore.onSnapshot({ collection: 'users', doc: profile.id, storeAs: alias })
}
