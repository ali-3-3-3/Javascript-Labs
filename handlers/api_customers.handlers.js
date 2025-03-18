const {
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
  insertCustomer,
  addContact,
  updateContacts,
} = require("../lib/database");

const getAllCustomersHandlerJSON = async (req, res) => {
  const customers = await getAllCustomers();
  res.json(customers);
};

const getACustomerHandlerJSON = async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);
    res.json(customer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteACustomerHandlerJSON = async (req, res) => {
  try {
    const customerId = req.params.id;

    await deleteCustomer(customerId);

    res.sendStatus(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const addACustomerHandlerJSON = async (req, res) => {
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
  customer = await insertCustomer(customerData);

  res.json(customer);
};

const addAContactToCustomerJSON = async (req, res) => {
  const customerId = req.params.id;
  const contactData = req.body;

  //could have used contactData directly but
  //this is safer
  const { phone, email } = contactData;

  const customer = await getCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }
  let contact = null;
  let hasAdded = false;
  if (phone) {
    contact = { phone };
    console.log("contact", contact);
    hasAdded = await addContact(customerId, contact);
  } else if (email) {
    contact = { email };
    hasAdded = await addContact(customerId, contact);
  } else {
    res.status(400).json({ message: "No contact data" });
    return;
  }

  if (hasAdded) {
    if (customer.contacts) {
      customer.contacts.push(contactData);
    } else {
      customer.contacts = [contact];
    }
    res.status(200).json(customer);
  } else {
    //assume that there's a duplicate contact
    res.status(409).json({ message: "Failed to add contact" });
  }
}; //end addAContactToCustomerJSON

const deleteAContactFromCustomerJSON = async (req, res) => {
  const customerId = req.params.id;
  const { phone, email } = req.query;

  if (!phone && !email) {
    res.status(400).json({ message: "No contact data" });
    return;
  }

  const customer = await getCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  const { contacts } = customer;
  if (!contacts) {
    res.status(404).json({ message: "Contact not found" });
    return;
  }

  let newContacts = contacts;
  if (phone) {
    newContacts = contacts.filter((contact) => {
      if (contact.phone) {
        return contact.phone.toLowerCase() !== phone.toLowerCase();
      } else {
        return true;
      }
    });

    if (contacts.length === newContacts.length) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }
  } else if (email) {
    newContacts = contacts.filter((contact) => {
      if (contact.email) {
        return contact.email.toLowerCase() !== email.toLowerCase();
      } else {
        return true;
      }
    });
    if (contacts.length === newContacts.length) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }
  }

  //update the contacts of the customer
  try {
    await updateContacts(customerId, newContacts);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact" });
  }
}; //end deleteAContactFromCustomerJSON

const editCustomerHandlerJSON = async (req, res) => {
  const customerId = req.params.id;

  const customerData = req.body;

  if (!customerData) {
    res.status(400).json({ message: "No customer data" });
    return;
  }
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

  res.sendStatus(204).send();
};

const addFieldToCustomerJSON = async (req, res) => {
  const customerId = req.params.id;
  const { field, value } = req.query;

  if (!field || !value) {
    res.status(400).json({ message: "No field or value" });
    return;
  }

  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  const newFields = { ...customer.fields, [field]: value };

  try {
    await addField(customerId, { fields: newFields });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to add field" });
  }
}; //end addFieldToCustomerJSON

const deleteLocationFromCustomerJSON = async (req, res) => {
  const customerId = req.params.id;
  const { field, value } = req.query;

  if (!field || !value) {
    res.status(400).json({ message: "No field or value" });
    return;
  }

  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  const newFields = { ...customer.fields };
  delete newFields[field];

  try {
    await addField(customerId, { fields: newFields });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete field" });
  }
}; //end deleteLocationFromCustomerJSON

module.exports = {
  getAllCustomersHandlerJSON,
  getACustomerHandlerJSON,
  deleteACustomerHandlerJSON,
  addACustomerHandlerJSON,
  addAContactToCustomerJSON,
  deleteAContactFromCustomerJSON,
  editCustomerHandlerJSON,
  addFieldToCustomerJSON,
  deleteLocationFromCustomerJSON,
};
