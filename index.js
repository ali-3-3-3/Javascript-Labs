const express = require("express");
const bodyParser = require("body-parser");
const customersRoutes = require("./routes/customers.routes");
const apiCustomersRoutes = require("./routes/api_customers.routes"); 
const app = express();
const port = 3000;

// Use bodyParser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

//since there's only 1 route for the root path,
//we will just put it here
app.get("/", (req, res) => {
  res.render("main");
});

app.use("/customers", customersRoutes);

app.use("/api/customers", apiCustomersRoutes); 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
