const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

// Configure your storage account settings here
const tableName = "nft";
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
  const method = req.method;

  if (method === "POST") {
    // Handle POST request to store NFT stats
    const { tokenID, id, ownerAddress, characterStats } = req.body;

    if (tokenID && id && ownerAddress && characterStats) {
      try {
        const entity = {
          partitionKey: tokenID.toString(),
          rowKey: id,
          OwnerAddress: ownerAddress,
          CharacterStats: JSON.stringify(characterStats),
        };

        await tableClient.createEntity(entity);
        context.res = {
          status: 200, // Success status code
          body: "NFT stats stored successfully",
        };
      } catch (error) {
        context.res = {
          status: 500, // Internal Server Error
          body: `An error occurred: ${error.message}`,
        };
      }
    } else {
      context.res = {
        status: 400, // Bad request
        body: "Please provide all required fields: tokenID, id, ownerAddress, characterStats",
      };
    }
  } else if (method === "GET") {
    // Handle GET request to retrieve NFT stats
    const tokenID = req.query.tokenID;

    if (tokenID) {
      try {
        const entities = tableClient.listEntities({
          queryOptions: { filter: `PartitionKey eq '${tokenID}'` },
        });
        const results = [];
        for await (const entity of entities) {
          results.push({
            tokenID: entity.partitionKey,
            id: entity.rowKey,
            ownerAddress: entity.OwnerAddress,
            characterStats: JSON.parse(entity.CharacterStats),
          });
        }
        context.res = {
          status: 200, // Success status code
          body: results,
        };
      } catch (error) {
        context.res = {
          status: 500, // Internal Server Error
          body: `An error occurred: ${error.message}`,
        };
      }
    } else {
      context.res = {
        status: 400, // Bad request
        body: "Please provide a tokenID",
      };
    }
  } else {
    context.res = {
      status: 405, // Method Not Allowed
      body: "Only POST and GET methods are allowed",
    };
  }
};
