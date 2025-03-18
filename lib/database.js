const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

let client = null;

//this is the collection object for querying the
//customers collection in the database
let collectionCustomers = null;
let collectionUsers = null;

//function to connect to db and get the collection object
async function initDBIfNecessary() {
  if (!client) {
    //only connect to the database if we are not already connected
    client = await MongoClient.connect("mongodb://localhost:27017");

    const db = client.db("crm");
    collectionCustomers = db.collection("customers");
    collectionUsers = db.collection("users");
  }
} // end initDBIfNecessary

//function to disconnect from the database
async function disconnect() {
  if (client) {
    await client.close();
    client = null;
  }
} //end disconnect

async function insertCustomer(customer) {
  await initDBIfNecessary();
  customer.created = new Date();

  const result = await collectionCustomers.insertOne(customer);
  customer._id = result.insertedId.toString();

  return customer;
} //end insertCustomer

async function getAllCustomers(userId) {
  await initDBIfNecessary();
  return collectionCustomers.find({ createdBy: userId }).toArray();
} //end getAllCustomers

async function deleteCustomer(customerId) {
  await initDBIfNecessary();
  await collectionCustomers.deleteOne({
    _id: ObjectId.createFromHexString(customerId),
  });
} //end deleteCustomer

async function getCustomerById(customerId) {
  try {
    console.log("getCustomerById received:", customerId); // Debugging

    if (!customerId || customerId.length !== 24) {
      throw new Error("Invalid customerId: " + customerId);
    }

    await initDBIfNecessary();
    return collectionCustomers.findOne({
      _id: new ObjectId(customerId), // Ensure `ObjectId` is used correctly
    });
  } catch (error) {
    console.error("getCustomerById error:", error); // Debugging
    return null;
  }
}
//end getCustomerById

async function updateCustomer(customerId, customer) {
  await initDBIfNecessary();
  const { name, gender, dob } = customer;

  await collectionCustomers.updateOne(
    {
      _id: ObjectId.createFromHexString(customerId),
    },
    {
      //we could have just supplied $set: customer
      //but this is safer
      $set: {
        name,
        gender,
        dob,
      },
    }
  );
} //end updateCustomer

async function getUserByUsername(username) {
  await initDBIfNecessary();
  //modify the codes on top to have a collectionUsers
  return collectionUsers.findOne({
    username: username,
  });
} //end getUserByUsername

//return true if the contact was added successfully
//return false if the contact already exists
async function addContact(customerId, contact) {
  await initDBIfNecessary();
  const result = await collectionCustomers.updateOne(
    {
      _id: ObjectId.createFromHexString(customerId),
    },
    {
      // add the contact (if does not exist) to the contacts array
      $addToSet: { contacts: contact },
    }
  );
  console.log("#result", result);
  return result.modifiedCount > 0;
} //end addContact

async function updateContacts(customerId, contacts) {
  await initDBIfNecessary();
  const result = await collectionCustomers.updateOne(
    {
      _id: ObjectId.createFromHexString(customerId),
    },
    {
      $set: { contacts },
    }
  );
  return result.modifiedCount > 0;
} //end updateContacts

async function addField(customerId, field) {
  await initDBIfNecessary();
  const result = await collectionCustomers.updateOne(
    {
      _id: ObjectId.createFromHexString(customerId),
    },
    {
      $addToSet: { fields: field },
    }
  );
  return result.modifiedCount > 0;
} //end addField

async function deleteLocationField(customerId, location) {
  await initDBIfNecessary();
  const result = await collectionCustomers.updateOne(
    {
      _id: ObjectId.createFromHexString(customerId),
    },
    {
      $pull: { fields: { location } },
    }
  );
  return result.modifiedCount > 0;
} //end deleteLocationField

//export the functions so they can be used in other files
module.exports = {
  insertCustomer,
  getAllCustomers,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  getUserByUsername,
  addContact,
  updateContacts,
  addField,
  deleteLocationField,
  disconnect,
};
