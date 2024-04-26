import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

//const config = new pulumi.Config("log");
//console.log(config.require("tablename"))


export const basicDynamodbTable = new aws.dynamodb.Table("logTable", {
    attributes: [
        { name: "id", type: "S" },
    ],
    billingMode: "PROVISIONED",
    hashKey: "id",
    readCapacity: 20,
    streamEnabled: true, // Enable DynamoDB stream
    streamViewType: "NEW_IMAGE", // Specify the stream view type
    tags: {
        Environment: "production",
        Name: "logTable",
    },
    writeCapacity: 20,
});

export const tableName = basicDynamodbTable.name;
export const tableArn = basicDynamodbTable.arn;
export const tableStreamArn = basicDynamodbTable.streamArn;