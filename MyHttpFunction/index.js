const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

// Configure your storage account settings here
const tableName = "discord";
const account = "discord";
const accountKey =
  "exqh2BAHHVtnwQlZwPaFByhVuuCPuP/feYlx1tO8JXVWqlTn71wwp0Jwt/2QD09hbY+UnU/6Zb+K+ASt7Xtfhg==";

// Create credentials and table client
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(
  `https://${account}.table.core.windows.net`,
  tableName,
  credential
);

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");

  const username = req.body && req.body.username;
  if (username) {
    try {
      const entity = {
        partitionKey: "DiscordUsername",
        rowKey: `${new Date().getTime()}`, // Use timestamp as unique key
        Username: username,
      };

      // Use the table client to insert the new entity
      await tableClient.createEntity(entity);
      context.res = {
        status: 200, // Success status code
        body: "Username stored successfully",
      };
    } catch (error) {
      context.res = {
        status: 500, // Internal Server Error
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
