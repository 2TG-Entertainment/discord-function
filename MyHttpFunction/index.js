const {
  TableServiceClient,
  AzureNamedKeyCredential,
} = require("@azure/data-tables");

// Configure your storage account settings here
const tableName = "Usernames";
const account = "<your_storage_account_name>";
const accountKey = "<your_storage_account_key>";

// Create a service client
const credential = new AzureNamedKeyCredential(account, accountKey);
const serviceClient = new TableServiceClient(
  `https://${account}.table.core.windows.net`,
  credential
);

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const username = req.body && req.body.username;
  if (username) {
    try {
      const tableClient = serviceClient.getTableClient(tableName);
      await tableClient.createTable();
      const entity = {
        partitionKey: "DiscordUsername",
        rowKey: `${new Date().getTime()}`, // Use timestamp as unique key
        Username: username,
      };
      await tableClient.createEntity(entity);
      context.res = {
        status: 200,
        body: "Username stored successfully",
      };
    } catch (error) {
      context.res = {
        status: 500,
        body: `An error occurred: ${error.message}`,
      };
    }
  } else {
    context.res = {
      status: 400,
      body: "Please pass a username in the request body",
    };
  }
};
