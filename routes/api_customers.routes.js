const express = require("express");
const router = express.Router();
const {
  getAllCustomersHandlerJSON,
  getACustomerHandlerJSON,
  deleteACustomerHandlerJSON,
  addACustomerHandlerJSON,
  addAContactToCustomerJSON,
  editCustomerHandlerJSON,
  addFieldToCustomerJSON,
  deleteLocationFromCustomerJSON,
} = require("../handlers/api_customers.handlers");
const { addACustomer } = require("../handlers/customers.handlers");

router.get("/", getAllCustomersHandlerJSON);

router.get("/:id", getACustomerHandlerJSON);

router.delete("/:id", deleteACustomerHandlerJSON);

router.post("/customers", addACustomerHandlerJSON);

router.post("/:d/contacts", addAContactToCustomerJSON);

router.put("/:id", editCustomerHandlerJSON);

router.post("/:id/fields", addFieldToCustomerJSON);

router.delete(
  "/:id/fields/?field=location&value=SG",
  deleteLocationFromCustomerJSON
);

module.exports = router;
