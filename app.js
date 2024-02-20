const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

app.use(cors());  

const sequelize = require("./Util/database");
const bodyParser = require("body-parser");

const userAdminRoutes = require("./Route/userLoginRoute");
const userRoute = require("./Route/superUserRoute");
const studentDataRoute = require("./Route/collegeAdmin");
const studentDashboard = require("./Route/studentDashboard");
// const forgetPassword = require("./Route/forgetPasswordRoute");

app.use(bodyParser.json());

const Organization = require("./Model/collegeModel");
const User = require("./Model/userModel");

User.belongsTo(Organization, { foreignKey: "collegeId" });

app.get('/', (req, res) => {
  res.send("welcome");
})

app.use(userAdminRoutes);
app.use(userRoute);
app.use(studentDataRoute);
app.use(studentDashboard);
// app.use(forgetPassword);


sequelize
  // .sync({ force: true })
  .sync() 
  .then((result) => {
    console.log("Database synced successfully");
    app.listen(process.env.PORT);  
  })
  .catch((err) => {
    console.error("Error syncing database:", err); 
  });  

