import express from "express";

import Insertoperatordb from '../lib/Insertoperatordb.js';
import Checkoperatordb from '../lib/Checkoperatordb.js';
import applyCors from "../lib/cors.js"; 
import jwt from 'jsonwebtoken';
import  'dotenv/config';

const router = express.Router();


const admin = [{
id: 1,
username: "admin",
password: "123456"
}];

router.post("/", async (req, res) => {

if (applyCors(req, res)) return; 

const { operatorname, invite } = req.body;
const token = req.headers.authorization;

  if(!token) {
   return res.status(401).json({message: 'No token provided' });
 }
else {
 try {
 const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    const role = decoded.role;

    if (role !== "admin") {
      return res.status(403).json({ message: 'Only users are allowed to update data here' });
    }


    // Find the user by ID
     if((Number(admin[0].id) === Number(userId)) && role === "admin"){
  if(operatorname && invite){
              let resultnya = await Checkoperatordb(operatorname,
           invite);
                if(resultnya === "notfind"){
                   let resultnya2 = await Insertoperatordb(operatorname, invite);
              if(resultnya2 === "1inserted"){
                       res.send({answer: "ok"});
    }
   else {
     res.send({answer: "notok"});
   }      
}                    // closing if resultnya
     else {
     res.send({answer: "notok"});
   } 
}    // closing if reqbodyoperator and reqbodyinvite
else if(operatorname){
     let resultnya = await Deleteoperatordb(operatorname);
            if(resultnya === "1deleted"){
             res.send({answer: "ok"});
    }
}
else {
   res.send({kosong: ""});
}
}
}
catch (err) {
    res.status(401).json({ message: 'Error when try' });
  }
}
};

export default router;
