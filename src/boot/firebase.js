// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app'

// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

var firebaseConfig

const graphqlUrl = process.env.PROD ? 'ta-new.fre8wise.com/v1/graphql' : 'localhost:8080/v1/graphql'

const isDev = !/fre8wise\.com/i.test(graphqlUrl)

if (isDev) {
  firebaseConfig = {
    apiKey: 'AIzaSyCGOQPGmclJqvrHdnNmhnWJTnAERSogCEc',
    authDomain: 'fre8wise-test.firebaseapp.com',
    databaseURL: 'https://fre8wise-test.firebaseio.com',
    projectId: 'fre8wise-test',
    storageBucket: 'fre8wise-test.appspot.com',
    messagingSenderId: '608977808347',
    appId: '1:608977808347:web:d70a98a7c77fc0db2915fe'
  }
} else {
// PUT YOUR OWN FIREBASE CONFIGURATION HERE
  firebaseConfig = {
    apiKey: 'AIzaSyAy1pYlJ_iNgq5l6ruPZR_C9Iim4fn-O1E',
    authDomain: 'fre8wise-ta.firebaseapp.com',
    databaseURL: 'https://fre8wise-ta.firebaseio.com',
    projectId: 'fre8wise-ta',
    storageBucket: 'fre8wise-ta.appspot.com',
    messagingSenderId: '46421678941',
    appId: '1:46421678941:web:8164da5ed8c7749a7f66b4',
    measurementId: 'G-1LJYBH4W2C'
  }
}
// Initialize Firebase
let firebaseApp = firebase.initializeApp(firebaseConfig)
let firebaseAuth = firebaseApp.auth()
let firebaseDb = firebaseApp.firestore()
let firebaseStorageRef = firebaseApp.storage().ref()

firebaseDb.enablePersistence({
  synchronizeTabs: true
})
let FieldValue = firebase.firestore.FieldValue
let Timestamp = firebase.firestore.Timestamp

function getFirebaseProjectId () {
  return firebase.app().options.authDomain.split('.')[0]
}

const cloudfunctionsBaseUrl = 'https://us-central1-' + getFirebaseProjectId() + '.cloudfunctions.net/app'

export { firebaseAuth, firebaseDb, FieldValue, Timestamp, getFirebaseProjectId, cloudfunctionsBaseUrl, firebaseStorageRef }
