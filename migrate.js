

//____________FIREBASE
//For persistent db.json
var admin = require("firebase-admin")

var serviceAccount = require("./_key.json")
//var serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACC.replace(/\\n/g, ''))
//^ not working atm

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://capt-picard.firebaseio.com",
    storageBucket: "gs://capt-picard.appspot.com"
});

const dat = require("./db (11).json");
const data = {"servers":dat}

/**
 * Data is a collection if
 *  - it has a odd depth
 *  - contains only objects or contains no objects.
 */
function isCollection(data, path, depth) {
  if (
    typeof data != 'object' ||
    data == null ||
    data.length === 0 ||
    isEmpty(data)
  ) {
    return false;
  }

  for (const key in data) {
    if (typeof data[key] != 'object' || data[key] == null) {
      // If there is at least one non-object item then it data then it cannot be collection.
      return false;
    }
  }

  return true;
}

// Checks if object is empty.
function isEmpty(obj) {
  for(const key in obj) {
    if(obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

async function upload(data, path) {
  return await admin.firestore()
    .doc(path.join('/'))
    .set(data)
    .then(() => console.log(`Document ${path.join('/')} uploaded.`))
    .catch(() => console.error(`Could not write document ${path.join('/')}.`));
}

/**
 *
 */
async function resolve(data, path = []) {
  if (path.length > 0 && path.length % 2 == 0) {
    // Document's length of path is always even, however, one of keys can actually be a collection.

    // Copy an object.
    const documentData = Object.assign({}, data);

    for (const key in data) {
      // Resolve each collection and remove it from document data.
      if (isCollection(data[key], [...path, key])) {
        // Remove a collection from the document data.
        delete documentData[key];
        // Resolve a colleciton.
        resolve(data[key], [...path, key]);
      }
    }

    // If document is empty then it means it only consisted of collections.
    if (!isEmpty(documentData)) {
      // Upload a document free of collections.
      await upload(documentData, path);
    }
  } else {
    // Collection's length of is always odd.
    for (const key in data) {
      // Resolve each collection.
      await resolve(data[key], [...path, key]);
    }
  }
}

resolve(data);