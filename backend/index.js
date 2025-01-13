const express = require("express");
const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
require("dotenv").config();

// Access environment variables
const dbURI = process.env.dbURI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Mongoose Schema
const websiteSchema = new mongoose.Schema({
  website: String,
  password: String, // Encrypted password
  key: String, // AES key
  iv: String, // Initialization vector
});

const Website = mongoose.model("Website", websiteSchema);

// Encryption Functions
const encryptPassword = (password) => {
  const key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  const encrypted = CryptoJS.AES.encrypt(
    password,
    CryptoJS.enc.Hex.parse(key),
    { iv: CryptoJS.enc.Hex.parse(iv) }
  ).toString();
  return { encrypted, key, iv };
};

const decryptPassword = (encryptedPassword, key, iv) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedPassword,
    CryptoJS.enc.Hex.parse(key),
    { iv: CryptoJS.enc.Hex.parse(iv) }
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Routes
app.get("/websites", async (req, res) => {
  try {
    const websites = await Website.find();
    res.json(websites);
  } catch (err) {
    res.status(500).send("Error fetching websites");
  }
});

app.post("/add-website", async (req, res) => {
  const { website, password } = req.body;

  if (!website || !password) {
    return res.status(400).send("Website and password are required");
  }

  try {
    const { encrypted, key, iv } = encryptPassword(password);
    const newWebsite = new Website({ website, password: encrypted, key, iv });
    await newWebsite.save();
    res.status(200).send("Website added successfully");
  } catch (err) {
    res.status(500).send("Error adding website");
  }
});

// Decrypt password route
app.post("/decrypt-password/:id", async (req, res) => {
  const { id } = req.params;
  const { enteredPassword } = req.body;

  if (enteredPassword !== "4321") {
    return res.status(401).send("Unauthorized access");
  }

  try {
    const website = await Website.findById(id);
    if (!website) {
      return res.status(404).send("Website not found");
    }
    const decryptedPassword = decryptPassword(
      website.password,
      website.key,
      website.iv
    );
    res.json({ website: website.website, password: decryptedPassword });
  } catch (err) {
    res.status(500).send("Error decrypting password");
  }
});
app.delete("/delete-website/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedWebsite = await Website.findByIdAndDelete(id);
    if (!deletedWebsite) {
      return res.status(404).send("Website not found");
    }
    res.status(200).send("Website deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting website");
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
