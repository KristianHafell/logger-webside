import { getItems, setItems, deleteItem, } from "@logger/logger-sdk";

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";


export function add(a: number, b: number): number {
    return a + b;
}

export function graiterThan(a: number, b: number): boolean {
    return a > b;
}

export async function getItemsFromTable(tableName: string) {
    const items = await getItems(tableName);
    if (items[0].id === "Error1") {
        return {
            statusCode: 404,
            body: JSON.stringify({message: "Not found"})
        };
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    }
}

export async function setItemsInTable(tableName: string, items: Record<string, string>) {
    const isSuccessful = await setItems(tableName, items);
    if (isSuccessful) {
        return {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({message: "not Successful setItems"})
        };
    }
}

export async function itemIsInTable(tableName: string, targetId: string) {
    const items = await getItems(tableName);
    console.log("items: ", items);
    if (items.some(obj => obj.id && obj.id.S === targetId)) {
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Item is in table"})
        };
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({message: "Item is not in table"})
        };
    }
}

export async function deleteItemInTableById(tableName: string, id: string) {
    const isSuccessful = await deleteItem(tableName, id);
    if (isSuccessful) {
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Deleted"})
        };
    } else {
        return {
            statusCode: 404,
            body: JSON.stringify({message: "not Successful deleteItemById"})
        };
    }
}

export async function streamConnectionOnline(connection: Record<string, string>, text: Record<string, string>) {
    try {
        if (connection.endpoint === undefined) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: "connection.endpoint === undefined"})
            };
        }
        const apigwManagmentAPI = new ApiGatewayManagementApiClient({ 
            apiVersion: "2018-11-29",
            endpoint: connection.endpoint
        });
    
        const message = { id: {S: text.id}, message: {S: text.message}, metric: {S: text.metric} };
    
        const input = {
            ConnectionId: connection.ConnectionId,
            Data: JSON.stringify(message)
        };
        const command = new PostToConnectionCommand(input);
        await apigwManagmentAPI.send(command);
    
        return {
            statusCode: 200,
            body: JSON.stringify({message: "OK"})
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Error " + error.message})
        };
    
       }
    
}


