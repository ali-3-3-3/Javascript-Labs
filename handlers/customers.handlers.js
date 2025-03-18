const {
  insertCustomer,
  getAllCustomers,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} = require("../lib/database");

const renderCustomerForm = (req, res) => {
  res.render("customer_form");
};

const addACustomer = async (req, res) => {
  const customerData = req.body;
  console.log("#/customers/add");

  //convert gender to integer
  if (customerData.gender) {
    customerData.gender = parseInt(customerData.gender);
  }

  if (customerData.dob) {
    customerData.dob = new Date(customerData.dob);
  }

  console.log(JSON.stringify(customerData));
  await insertCustomer(customerData);

  res.redirect("/customers/list");
};

const deleteACustomer = async (req, res) => {
  const customerId = req.params.id;

  await deleteCustomer(customerId);

  res.redirect("/customers/list");
};

const getAllCustomersHandler = async (req, res) => {
  const customers = await getAllCustomers();
  res.render("list_customers", {
    customers,
  });
};

const getACustomer = async (req, res) => {
  const customer = await getCustomerById(req.params.id);
  res.render("customer_form", {
    ...customer,
  });
};

const updateACustomer = async (req, res) => {
  const customerId = req.params.id;

  const customerData = req.body;
  console.log("#customerId", customerId);

  //convert gender to integer
  if (customerData.gender) {
    customerData.gender = parseInt(customerData.gender);
  }

  if (customerData.dob) {
    customerData.dob = new Date(customerData.dob);
  }

  console.log(JSON.stringify(customerData));
  await updateCustomer(customerId, customerData);

  res.redirect("/customers/list");
};

module.exports = {
  renderCustomerForm,
  addACustomer,
  deleteACustomer,
  getAllCustomersHandler,
  getACustomer,
  updateACustomer,
};
