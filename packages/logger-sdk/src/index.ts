import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const REGION = "eu-north-1";
const dynamodbClient = new DynamoDBClient({ region: REGION });

export async function getItems(tableName: string) {
    const params = {
        TableName: tableName 
    };
    const command = new ScanCommand(params);

    try {
        const data = await dynamodbClient.send(command);
        return data.Items;
    } catch (err) {
        return [{id: "Error1"}, {id: err}];
    }
}

export async function setItems(tableName: string, item: Record<string, string>) {
    if (typeof item === typeof "asd") {
        console.log("")
    }
    try {
        console.log("setItems: " + tableName + "   " + item, " typeOf", typeof item, "item.timestamp", item.timestamp, "typeOf timestamp ", typeof item.timestamp);
        const params: PutCommandInput = {
            TableName: tableName,
            Item: {
                id: item.id,
                timestamp: item.timestamp,
                message: item.message,
                metric: "test"
            }
        };
        console.log("params is set", params.Item);
        const command = new PutCommand(params);
        const data = await dynamodbClient.send(command);
        console.log("Putting complete");
        return true;
    } catch (err) {
        console.log("Error Putting:", err);
        return false;
    }
}

export async function deleteItem(tableName: string, id: string) {
    try {
        const params = {
            TableName: tableName,
            Key: {
                id: id
            }
        };
        const command = new DeleteCommand(params);
        const data = await dynamodbClient.send(command);
        return true;
    } catch (err) {
        return false;
    }
}
