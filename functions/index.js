const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");

const express = require("express");
const formidable = require("formidable-serverless");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
var uuid = require("uuid-v4");
// var myUUID = uuid();
var admin = require("firebase-admin");

var serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const userRef = admin.firestore().collection("users");

const storage = new Storage({
  keyFilename: "admin.json",
});

app.post("/createUser", async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });

  try {
    form.parse(req, async (err, fields, files) => {
      let uuid1 = uuid();
      var downLoadPath =
        "https://firebasestorage.googleapis.com/v0/b/fir-crud-cdf93.appspot.com/o/";

      const profileImage = files.profileImage;

      // url of the uploaded image
      let imageUrl;

      const docID = userRef.doc().id;

      if (err) {
        return res.status(400).json({
          message: "There was an error parsing the files",
          data: {},
          error: err,
        });
      }
      const bucket = storage.bucket("gs://fir-crud-cdf93.appspot.com");

      if (profileImage.size == 0) {
        // do nothing
      } else {
        const imageResponse = await bucket.upload(profileImage.path, {
          destination: `users/${profileImage.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid1,
            },
          },
        });
        // profile image url
        imageUrl =
          downLoadPath +
          encodeURIComponent(imageResponse[0].name) +
          "?alt=media&token=" +
          uuid1;
      }
      // object to send to database
      const userModel = {
        id: docID,
        name: fields.name,
        email: fields.email,
        age: fields.age,
        profileImage: profileImage.size == 0 ? "" : imageUrl,
      };

      await userRef
        .doc(docID)
        .set(userModel, { merge: true })
        .then((value) => {
          // return response to users
          res.status(200).send({
            message: "user created successfully",
            data: userModel,
            error: {},
          });
        });
    });
  } catch (err) {
    res.send({
      message: "Something went wrong",
      data: {},
      error: err,
    });
  }
});
// var PORT = 7000;
// app.listen(PORT, () =>
//   console.log(`Server is running on port: http://localhost:${PORT}`)
// );
// app.get("/", (req, res) => {
//   return res.status(200).send("Hello World");
// });

exports.api = functions.https.onRequest(app);
