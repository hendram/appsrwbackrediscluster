const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Optional: JSON parsing middleware
app.use(express.json());

// Import all route files
const actionRoute = require("./api/action");
const backupdbRoute = require("./api/backupdb");
const caridatanamaRoute = require("./api/caridatanama");
const caridataunitRoute = require("./api/caridataunit");
const isidataRoute = require("./api/isidata");
const operatorRoute = require("./api/operator");
const restoredbRoute = require("./api/restoredb");
const updatedataRoute = require("./api/updatedata");
const userRoute = require("./api/user");

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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
