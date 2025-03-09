const { MongoClient } = require("mongodb"); 
const { ObjectId } = require("mongodb");

 
let client = null; 
 
//this is the collection object for querying the 
//customers collection in the database 
let collectionCustomers = null; 
 
//function to connect to db and get the collection object 
async function initDBIfNecessary() { 
  if (!client) { 
    //only connect to the database if we are not already connected 
    client = await MongoClient.connect("mongodb://localhost:27017"); 
 
    const db = client.db("crm"); 
    collectionCustomers = db.collection("customers"); 
 
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
  await collectionCustomers.insertOne(customer); 
} 

async function getAllCustomers() { 
    await initDBIfNecessary(); 
    return collectionCustomers.find().toArray(); 
} //end getAllCustomers 

async function deleteCustomer(customerId) { 
    await initDBIfNecessary(); 
    await collectionCustomers.deleteOne({ 
      _id: ObjectId.createFromHexString(customerId) 
    }); 
} //end deleteCustomer

async function getCustomerById(customerId) {
  console.log("getCustomerById received:", customerId); // Debugging

  if (!customerId || customerId.length !== 24) {
      throw new Error("Invalid customerId: " + customerId);
  }

  await initDBIfNecessary();
  return collectionCustomers.findOne({
      _id: new ObjectId(customerId) // Ensure `ObjectId` is used correctly
  });
}
//end getCustomerById 
 
async function updateCustomer(customerId, customer) { 
    await initDBIfNecessary(); 
    const { name, gender, dob } = customer; 
 
    await collectionCustomers.updateOne({ 
        _id: ObjectId.createFromHexString(customerId) 
    }, { 
        //we could have just supplied $set: customer 
        //but this is safer 
        $set: { 
            name, 
            gender, 
            dob 
        } 
    }); 
} //end updateCustomer
 
//export the functions so they can be used in other files 
module.exports = { 
  insertCustomer, 
  getAllCustomers,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  disconnect, 
}; 