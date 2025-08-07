import express from "express";

import Checkoperatorid from '../lib/Checkoperatorid.js';
import Updatepenghunidb from '../lib/Updatepenghunidb.js';  
import applyCors from "../lib/cors.js"; 
import jwt from 'jsonwebtoken';
import  'dotenv/config';

const router = express.Router();


router.post("/", async (req, res) => {

   if (applyCors(req, res)) return; 


const { oldnama, oldtempatlahir, oldtgllahir, oldnoktp, oldnohp, oldtower, oldunit, oldstatus, oldperiodsewa,
oldagen, oldemergencyhp, oldpemilikunit, nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, 
periodsewa, agen,
emergencyhp, pemilikunit } = req.body;

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


        if(oldnama && oldtempatlahir && oldtgllahir && oldnoktp && 
oldnohp && oldtower && oldunit && oldstatus && oldperiodsewa && oldagen &&
oldemergencyhp && oldpemilikunit && nama && tempatlahir && tgllahir && noktp && nohp &&
tower && unit && status && periodsewa && agen &&
emergencyhp && pemilikunit) {
      let resultnya = await Updatepenghunidb(oldnama, oldtempatlahir 
, oldtgllahir , oldnoktp, oldnohp ,
oldtower , oldunit , oldstatus , oldperiodsewa , oldagen ,
oldemergencyhp , oldpemilikunit, nama, tempatlahir 
, tgllahir , noktp, nohp ,
tower , unit , status , periodsewa , agen ,
emergencyhp , pemilikunit);
  if(resultnya === "1updated"){
           res.send({answer: "ok"});
}       
       else {
          res.send({kosong: ""});
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
