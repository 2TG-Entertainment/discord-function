using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System.Threading.Tasks;
using System.IO;
using Newtonsoft.Json;

public static class StoreDiscordUsername
{
    [FunctionName("StoreDiscordUsername")]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
        ILogger log)
    {
        log.LogInformation("StoreDiscordUsername function triggered.");

        // Get request body
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        dynamic data = JsonConvert.DeserializeObject(requestBody);

        // Validate and extract Discord username from request body
        string discordUsername = data?.discordUsername;
        if (string.IsNullOrEmpty(discordUsername))
        {
            return new BadRequestObjectResult("Discord username is required.");
        }

        // Connect to Azure Storage account
        CloudStorageAccount storageAccount = CloudStorageAccount.Parse("YourStorageConnectionString");
        CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
        CloudTable table = tableClient.GetTableReference("DiscordUsernames");

        // Create a new table entity to store the Discord username
        DiscordUsernameEntity entity = new DiscordUsernameEntity(discordUsername);
        TableOperation insertOperation = TableOperation.Insert(entity);

        // Insert the entity into Azure Table Storage
        await table.ExecuteAsync(insertOperation);

        log.LogInformation($"Discord username '{discordUsername}' stored successfully.");

        return new OkObjectResult("Discord username stored successfully.");
    }
}

public class DiscordUsernameEntity : TableEntity
{
    public DiscordUsernameEntity(string discordUsername)
    {
        this.PartitionKey = "DiscordUsernames";
        this.RowKey = discordUsername;
    }

    public DiscordUsernameEntity() { }
}