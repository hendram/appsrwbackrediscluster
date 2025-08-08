import express from "express";
import Checkoperatorid from  '../lib/Checkoperatorid.js';
import Checkpenghunidb from '../lib/Checkpenghunidb.js';
import Insertpenghunidb from '../lib/Insertpenghunidb.js';
import applyCors from "../lib/cors.js"; 
import jwt from 'jsonwebtoken';
import  'dotenv/config';

const router = express.Router();


router.post("/", async (req, res) => {

if (applyCors(req, res)) return; 

const { nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa, agen, emergencyhp,
pemilikunit } = req.body;

const token = req.headers.authorization;
  if(!token) {
   return res.status(401).json({message: 'No token provided' });
 }

else {
 try {
 const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;
    const role = decoded.role;

    if (role !== "user") {
      return res.status(403).json({ message: 'Only users are allowed to update data here' });
    }

    let resultusercheck = await Checkoperatorid(userId);
        if(resultusercheck){

        if(nama && tempatlahir && tgllahir && noktp && nohp &&
tower && unit && status && periodsewa && agen &&
emergencyhp && pemilikunit) {
      let resultnya = await Checkpenghunidb(nama, tempatlahir 
, tgllahir , noktp, nohp ,
tower , unit , status , periodsewa , agen ,
emergencyhp , pemilikunit);
         if(resultnya === "notfind"){
            let resultnya2 = await Insertpenghunidb(nama ,
 tempatlahir  , tgllahir , noktp, nohp ,
tower , unit , status , periodsewa , agen ,
emergencyhp , pemilikunit);
             if(resultnya2 === "1inserted"){
                 res.send({answer: "ok"});
           }
       else {
          res.send({kosong: ""});
       }
       }
  }
}
}
catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
});

export default router;
