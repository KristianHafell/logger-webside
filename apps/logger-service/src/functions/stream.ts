import * as dyn from "@logger/logger-sdk";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const connection: any = {};

export async function handler(event: any) {
    try {
        console.log("event: ");
        console.log(JSON.stringify(event, null, 2));
        if (event.Records) {
            console.log("event.Records: ");
            console.log("event.Records: ", JSON.stringify(event.Records, null, 2));
            if (connection.endpoint === undefined) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({message: "Not found"})
                };
            }
            const apigwManagmentAPI = new ApiGatewayManagementApiClient({ 
                apiVersion: "2018-11-29",
                endpoint: connection.endpoint
            });
    
            let text = "";
            if (event.Records[0].dynamodb.NewImage) {
                text = JSON.stringify(event.Records[0].dynamodb.NewImage);
            } else {
                text = "No NewImage";
            }
    
            const input = {
                ConnectionId: connection.ConnectionId,
                Data: text
            };
            const command = new PostToConnectionCommand(input);
            await apigwManagmentAPI.send(command);
    
            return {
                statusCode: 200,
                body: JSON.stringify({message: "OK"})
            }
        }
        if (event.requestContext) {
            console.log("event.requestContext.connectionId: ", event.requestContext.connectionId);
            connection.endpoint = "https://" + event.requestContext.domainName + "/" + event.requestContext.stage;
            connection.ConnectionId = event.requestContext.connectionId
            if (event.requestContext.routeKey === "$connect") {
                
                console.log("websocket connect");
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: "connect"})
                };
            } else if (event.requestContext.routeKey === "$disconnect") {
                console.log("websocket disconnect");
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: "disconnect"})
                };
            } else if (event.requestContext.routeKey === "$default") {
                console.log("websocket sendmessage " + event.body);

                const apigwManagmentAPI = new ApiGatewayManagementApiClient({ 
                    apiVersion: "2018-11-29",
                    endpoint: connection.endpoint
                });
                
                const input = {
                    ConnectionId: connection.ConnectionId,
                    Data: "Hello from the server: "
                };
                const command = new PostToConnectionCommand(input);
                await apigwManagmentAPI.send(command);

                return {
                    statusCode: 200,
                    body: JSON.stringify({message: "sendmessage"})
                };
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify({message: "Not found"})
                };
            }
        }
    } catch (error) {
    console.log("Internal Server Error", {message: error.message});
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal Server Error"})
        };

   }
}

