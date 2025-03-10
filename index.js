//NodeJS uses the CommonJS module system (i.e. the "require()")
//as opposed to ES6 modules (similar concept) but different syntax
const express = require("express");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
const {
  insertCustomer,
  getAllCustomers,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} = require("./lib/database");

app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const session = require("express-session");
app.use(
  session({
    secret: "SOME_SECRET_KEY",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //setting this false for http connections
    },
  })
);

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next(); //continue - pass to the next middleware
  } else {
    //bounce the user to the login page
    res.redirect("/login");
  }
}

app.get("/", (req, res) => {
  res.render("main");
});

app.get("/customers/new", requireAuth, (req, res) => {
  res.render("customer_form");
});

app.post("/customers/add", requireAuth, async (req, res) => {
  let { name, gender, birthday } = req.body;

  birthday = new Date(birthday);

  dateCreated = new Date();

  const customer = await insertCustomer(
    {
      name,
      gender,
      birthday,
      created: dateCreated,
    },
    req.session.userId
  );

  console.log("Form Data Received:", customer);

  res.redirect("/customers/list");
});

app.get("/customers/list", requireAuth, async (req, res) => {
  try {
    let customers = await getAllCustomers(req.session.userId);
    customers = customers.map((customer) => ({
      ...customer,
      gender:
        customer.gender == 1
          ? "Female"
          : customer.gender == 2
          ? "Male"
          : "Unknown",
    }));
    res.render("list_customers", { customers });
  } catch (e) {
    console.error(e);
    res.status(500).send("An error occurred: " + e.message);
  }
});

app.post("/customers/:id/delete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCustomer(id);
    res.redirect("/customers/list"); // Refresh the list after deleting
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).send("Failed to delete customer");
  }
});

app.get("/customers/:id", requireAuth, async (req, res) => {
  const customerId = req.params.id;

  try {
    const customer = await getCustomerById(customerId);
    console.log("Customer:", customer); // Debugging
    res.render("customer_form", {
      ...customer,
    }); // Render the edit form
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).send("Error retrieving customer");
  }
});

app.post("/customers/:id/edit", requireAuth, async (req, res) => {
  console.log("Received body:", req.body); // Debugging
  try {
    await updateCustomer(req.params.id, req.body);
    res.redirect("/customers/list"); // Redirect to customer list
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).send("Failed to update customer");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/dologin", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await getUserByUsername(username);
  if (foundUser && foundUser.password === password) {
    req.session.userId = foundUser._id;
    res.redirect("/customers/list");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
