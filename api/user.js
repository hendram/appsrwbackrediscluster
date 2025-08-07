import express from "express";
import Checkoperatordb from '../lib/Checkoperatordb.js'; 
import Checkoperatorsignindb from '../lib/Checkoperatorsignindb.js';
import Updateoperatordb from '../lib/Updateoperatordb.js';
import applyCors from "../lib/cors.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = express.Router();

const admin = [{
  id: 1,
  username: "admin",
  password: "123456"
}];

router.post("/", async (req, res) => {

  if (applyCors(req, res)) return;

  const { operatorname, password, invite } = req.body;

  try {
    if (operatorname && password && invite) {
      let result = await Checkoperatordb(operatorname, invite);

      if (result) {
        let updateResult = await Updateoperatordb(result._id, result.operatorname, password, result.invitecode);

        if (updateResult === "1updated") {
          const token = jwt.sign(
            { id: result._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
         
          return res.json({ token });
        }
      }
      return res.json({ kosong: "" });
    }

    const foundAdmin = admin.find(
      a => a.username === operatorname && a.password === password
    );

    if (foundAdmin) {
      const token = jwt.sign(
        { id: foundAdmin.id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ token });
    }

    const result = await Checkoperatorsignindb(operatorname, password);
    if (result) {
      const token = jwt.sign(
        { id: result._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.json({ token });
    }

    return res.json({ kosong: "" });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export default router;
