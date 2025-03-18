const express = require("express");
const router = express.Router();

const {
  renderCustomerForm,
  addACustomer,
  deleteACustomer,
  getAllCustomersHandler,
  getACustomer,
  updateACustomer,
} = require("../handlers/customers.handlers");

router.get("/new", renderCustomerForm);
router.post("/add", addACustomer);
router.post("/:id/delete", deleteACustomer);
router.get("/list", getAllCustomersHandler);
router.get("/:id", getACustomer);
router.post("/:id/edit", updateACustomer);
module.exports = router;
