const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./firebaseAdmin");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Add or update a recipe
app.post("/add-or-update-recipe", async (req, res) => {
  console.log("Add or update recipe...");
  const { id, name, quantity, mu, user, ingredients } = req.body;
  console.log({ id, name, quantity, mu, user, ingredients });

  try {
    let docRef;
    const docData = { name, quantity, mu, user, ingredients, upddate: new Date(), upddatems: new Date().getTime() };
    Object.keys(docData).forEach(key => {
      if (docData[key] === undefined) delete docData[key];
    });

    if (id) {
      // Update by ID
      docRef = db.collection("recipes").doc(id);
      console.log("Updating " + docRef.id);
      await docRef.set(docData, { merge: true });
    } else {
      // search a recipe with the same name to overwrite
      const query = await db.collection("recipes").where("name", "==", name).get();

      if (!query.empty) {
        docRef = query.docs[0].ref;
        console.log("Updating " + docRef.id);
        await docRef.set(docData, { merge: true });
      } else {
        // Create a new recipe
        docRef = await db.collection("recipes").add({
          ...docData,
          insdate: new Date(),
          insdatems: new Date().getTime()
        });
        console.log("Created and saved " + docRef.id);
      }
    }

    res.status(200).json({ id: docRef.id });
  } catch (error) {
    console.error("Error in /add-or-update-recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all recipes
app.get("/all-recipes", async (req, res) => {
  try {
    const snapshot = await db.collection("recipes").get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in /all-recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all recipes
app.get("/all-from-collection", async (req, res) => {
  if (!req.query) {
    console.log('No valid parms to all-from-collection: missing collection name');
    return;
  }
  console.log(req.query);
  try {
    const coll = req.query.coll;
    const snapshot = await db.collection(coll).get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in /all-from-collection:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
