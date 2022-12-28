const { response, express } = require("express");
// import BodyParser from "body-parser";
const {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
} = require("firebase/firestore");
const { db } = require("./firebaseconfig.js");

var app = express();
app.use(express.urlencoded());
app.use(express.json());

var PORT = 8000;

// const q = query(colRef, orderBy("createdAt"));
// interface Books {
//     title: String;
//     author: String;
//   }
app.listen(PORT, () =>
  console.log(`Server is running on port: http://localhost:${PORT}`)
);
// ROOT endpoint

app.locals.bucket = admin.storage().bucket();
app.post("/upload", upload.single("file"), async (req, res) => {
  const name = saltedMd5(req.file.originalname, "SUPER-S@LT!");
  const fileName = name + path.extname(req.file.originalname);
  await app.locals.bucket
    .file(fileName)
    .createWriteStream()
    .end(req.file.buffer);
  res.send("done");
});

app.get("/", (req, res) => {
  return res.status(200).send("Hello World");
});

app.get("/api/read", async (req, res) => {
  try {
    const colRef = await collection(db, "books");
    // console.log("ITs working");
    let books = [];
    const querySnapshot = await getDocs(collection(db, "books"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      books.push({ ...doc.data(), id: doc.id });
    });

    return res.status(200).json(books);
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data Failed");
  }
});

app.get("/api/read/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    let book = [];
    const docRef = doc(db, "books", req.params.id);
    const docSnap = await getDoc(docRef);

    return res.status(200).send(docSnap.data());
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data Failed to get");
  }
});

app.post("/api/add", async (req, res) => {
  try {
    const colRef = await collection(db, "books");
    console.log(req.body);

    addDoc(colRef, {
      title: req.body.title,
      author: req.body.author,
      createdAt: serverTimestamp(),
    });
    console.log(req.body);
    return res.status(200).send({ Status: "Sucess", msg: "Data Saved" });
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data Failed to insert ");
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const docRef = doc(db, "books", req.params.id);
    deleteDoc(docRef);
    return res.status(200).send({ Status: "Sucess", msg: "data deleted" });
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data Failed to delete ");
  }
});

app.put("/api/update/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const docRef = doc(db, "books", req.params.id);
    updateDoc(docRef, {
      title: req.body.title,
      author: req.body.author,
    });
    return res.status(200).send("Data is updated");
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data is not updated");
  }
});
