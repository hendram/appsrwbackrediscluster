import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT;

app.use(cors({
  origin: "*", "https://appsrwrediscluster-production.up.railway.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle OPTIONS preflight globally
app.options("*", cors());


// Optional: JSON parsing middleware
app.use(express.json());
console.log("🚀 Server starting…");



// ESM import style
import actionRoute from "./api/action.js";
import backupdbRoute from "./api/backupdb.js";
import caridatanamaRoute from "./api/caridatanama.js";
import caridataunitRoute from "./api/caridataunit.js";
import isidataRoute from "./api/isidata.js";
import operatorRoute from "./api/operator.js";
import restoredbRoute from "./api/restoredb.js";
import updatedataRoute from "./api/updatedata.js";
import userRoute from "./api/user.js";

// Mount them under /api/<name>
app.use("/api/action", actionRoute);
app.use("/api/backupdb", backupdbRoute);
app.use("/api/caridatanama", caridatanamaRoute);
app.use("/api/caridataunit", caridataunitRoute);
app.use("/api/isidata", isidataRoute);
app.use("/api/operator", operatorRoute);
app.use("/api/restoredb", restoredbRoute);
app.use("/api/updatedata", updatedataRoute);
app.use("/api/user", userRoute);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
