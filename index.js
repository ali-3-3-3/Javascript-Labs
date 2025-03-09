//NodeJS uses the CommonJS module system (i.e. the "require()") 
//as opposed to ES6 modules (similar concept) but different syntax 
const express = require("express"); 
const app = express(); 
const port = 3000; 
app.set("view engine", "ejs");
const { insertCustomer, getAllCustomers, deleteCustomer, getCustomerById, updateCustomer } = require("./lib/database"); 

app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 

app.get("/", (req, res) => { 
    res.render("main");
  }); 

app.get("/customers/new", (req, res) => {
    res.render("customer_form");
});

app.post("/customers/add", async (req, res) => {
    let { name, gender, birthday } = req.body;

    birthday = new Date(birthday);

    dateCreated = new Date();

    const customer = await insertCustomer({ name, gender, birthday, created: dateCreated});
  
    console.log("Form Data Received:", customer);
  
    res.redirect("/customers/list");
  });
  

app.get("/customers/list", async (req, res) => {
  try {
    let customers = await getAllCustomers();
    customers = customers.map(customer => ({
      ...customer,
      gender: customer.gender == 1 ? "Female" : customer.gender == 2 ? "Male" : "Unknown"
    }));
    res.render("list_customers", { customers });
  } catch (e) {
    console.error(e);
    res.status(500).send("An error occurred: " + e.message);
  }
});

app.post("/customers/:id/delete", async (req, res) => {
  try {
      const { id } = req.params;
      await deleteCustomer(id);
      res.redirect("/customers/list"); // Refresh the list after deleting
  } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).send("Failed to delete customer");
  }
});

app.get("/customers/:id", async (req, res) => {
  const customerId = req.params.id;

  try {
      const customer = await getCustomerById(customerId);
      console.log("Customer:", customer); // Debugging
      res.render("customer_form", { 
        ...customer }); // Render the edit form
  } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).send("Error retrieving customer");
  }
});
  
app.post("/customers/:id/edit", async (req, res) => {
  console.log("Received body:", req.body); // Debugging
  try {
      await updateCustomer(req.params.id, req.body);
      res.redirect("/customers/list"); // Redirect to customer list
  } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).send("Failed to update customer");
  }
});

app.listen(port, () => { 
  console.log(`Example app listening at http://localhost:${port}`); 
});