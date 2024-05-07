const {
  TableServiceClient,
  AzureNamedKeyCredential,
} = require("@azure/data-tables");

// Configure your storage account settings here
const tableName = "discord";
const account = "discord";
const accountKey =
  "exqh2BAHHVtnwQlZwPaFByhVuuCPuP/feYlx1tO8JXVWqlTn71wwp0Jwt/2QD09hbY+UnU/6Zb+K+ASt7Xtfhg==";

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
    // If no username is provided, just respond positively without doing anything
    context.res = {
      status: 200, // Or consider using a different status code if you need to indicate no action was taken
      body: "No username provided, proceeding without storing any data.",
    };
  }
};
