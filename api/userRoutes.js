// backend/api/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebaseConfig');
const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (token == null) return res.sendStatus(401); // if there is no token
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // if the token is not valid
      req.user = user; // Attach user to request
      next(); // Proceed to the next middleware or route handler
    });
  };
  

router.post('/create', async (req, res) => {
  const { uid, data } = req.body;
  try {
    const recordRef = db.collection('users').doc(uid);
    await recordRef.set(data, { merge: true });
    res.status(200).send("Record added/updated successfully");
  } catch (error) {
    console.error("Error in /create:", error);
    res.status(500).send("Error adding/updating record");
  }
});

// Updated get records route with authentication
router.get('/record/:uid', async (req, res) => {
    const { uid } = req.params;
  
    // Check if the uid from the request matches the authenticated user's uid
    // if (req.user.uid !== uid) {
    //   return res.status(403).send("You do not have permission to access this user's record.");
    // }
  
    try {
      const recordRef = db.collection('users').doc(uid);
      const recordSnap = await recordRef.get();
      if (recordSnap.exists) {
        res.status(200).json(recordSnap.data());
      } else {
        res.status(404).send("No such document!");
      }
    } catch (error) {
      console.error("Error in /record:", error);
      res.status(500).send("Error fetching record");
    }
  });
  

router.delete('/record/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    await db.collection('users').doc(uid).delete();
    res.status(200).send("Record deleted successfully");
  } catch (error) {
    console.error("Error in /record:", error);
    res.status(500).send("Error deleting record");
  }
});

module.exports = router;