import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from 'path';
import { basicDynamodbTable } from '../../../packages/logger-sdk/provisioning'; // Import basicDynamodbTable from the logger-sdk/provitioning directory

const TIME_OUT = 10; // Example timeout value, replace with your desired value

// Define your configuration variables
const REGION = "eu-north-1"; // Replace with your desired region
const openaiApiKeyPath = "your_openai_api_key_path"; // Replace with your OpenAI API key path
const environmentName = "your_environment_name"; // Replace with your environment name
const logTableName = basicDynamodbTable.name; // Replace with your log table name
const allQueuesENV = {}; // Define your queue environment variables if needed
const tables = {basicDynamodbTable}; // Define your table environment variables if needed
const AI_CONFIG = {}; // Define your AI config environment variables if needed
const ENVIRONMENT = "dev-X"; // Replace with your desired environment
const AWS_PROVIDER_OPTIONS = {provider: new aws.Provider("aws-provider", {region: REGION})}; // Define your AWS provider options
const functionsPath = path.join(__dirname, "../../../dist/apps/logger-service");

/**
 * createServiceName & createLambda
 * ________________________________________________________________________________
 */
export const createServiceName = (name: string) =>
    `${ENVIRONMENT}-bot-eun1-${name}`;
  
  
type LambdaOptions = {
    serviceName: string;
    codePath: string;
    codeFileName?: string;
    handlerName?: string;
    roleArn: string | pulumi.Output<string>;
    runtime?: aws.lambda.Runtime;
    timeout?: number;
    environment?: any; // TODO: Find the right type
    vpcConfig?: any; // TODO: Find the right type
};
  
export function createLambda(opt: LambdaOptions) {
    const resourceName = createServiceName(opt.serviceName);
    const code = new pulumi.asset.FileArchive(opt.codePath);
    const handler = `${opt.codeFileName || 'main'}.${
      opt.handlerName || 'handler'
    }`;
  
    const lambdaConf: aws.lambda.FunctionArgs = {
      code,
      handler,
      role: opt.roleArn,
      runtime: opt.runtime || aws.lambda.Runtime.NodeJS18dX,
      timeout: opt.timeout || 30,
    };
  
    if (Object.prototype.hasOwnProperty.call(opt, 'environment')) {
      lambdaConf.environment = opt.environment;
    }
    if (Object.prototype.hasOwnProperty.call(opt, 'vpcConfig')) {
      lambdaConf.vpcConfig = opt.vpcConfig;
    }
  
    return new aws.lambda.Function(
      resourceName,
      lambdaConf,
      AWS_PROVIDER_OPTIONS
    );
  }
/**
 * END createServiceName & createLambda
 * ________________________________________________________________________________
 */
/**
 * Policy
 * ________________________________________________________________________________
 */
// Create an IAM role that will be attached to the Lambda function.
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});

// Attach the AWSLambdaBasicExecutionRole policy to the role we created.
new aws.iam.RolePolicyAttachment("lambdaRoleAttachment", {
    role: lambdaRole,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// Create the DynamoDB Stream IAM policy
const dynamoDBPolicy = new aws.iam.Policy("dynamoDB-Policy", {
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "DynamoDBStreamPermissions",
                Effect: "Allow",
                Action: [
                    "dynamodb:GetRecords",
                    "dynamodb:GetShardIterator",
                    "dynamodb:DescribeStream",
                    "dynamodb:ListStreams",
                    "dynamodb:Scan",
                    "dynamodb:PutItem"
                ],
                Resource: "arn:aws:dynamodb:eu-north-1:905418069430:table/*"
            }
        ]
    })
});

// Attach the policy to the IAM role
const dynamoDBStreamPolicyAttachment = new aws.iam.RolePolicyAttachment("dynamoDB-Policy-Attachment", {
    role: lambdaRole,
    policyArn: dynamoDBPolicy.arn
});

const execApiPolicy = new aws.iam.Policy("execute-api-policy", {
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: [
                    "execute-api:Invoke",
                    "execute-api:ManageConnections"
                ],
                Resource: "arn:aws:execute-api:eu-north-1:*:**/@connections/*"
            }
        ]
    })
});

// Attach the policy to the IAM role
const execApiPolicyAttachment = new aws.iam.RolePolicyAttachment("execute-api-policy-Attachment", {
    role: lambdaRole,
    policyArn: execApiPolicy.arn
});

/**
 * END Policy
 * ________________________________________________________________________________
 */



/**
 * websocket
 * ________________________________________________________________________________
 */
// // Create a new API Gateway V2 for WebSockets.
// const websocketApi = new aws.apigatewayv2.Api("websocketApi", {
//     protocolType: "WEBSOCKET",
//     routeSelectionExpression: "$request.body.action",
// });

// // Define a Lambda function that will be triggered by the API Gateway.
// const lambdaFunctionStream = new aws.lambda.Function("websocketLambda", {
//     role: lambdaRole.arn,
//     runtime: "nodejs14.x",
//     handler: "stream.handler",
//     code: new pulumi.asset.FileArchive("./lambda.zip"),
// });

// // Add invoke permission from API Gateway to Lambda function.
// const invokePermission = new aws.lambda.Permission("invokePermission", {
//     action: "lambda:InvokeFunction",
//     function: lambdaFunctionStream.name,
//     principal: "apigateway.amazonaws.com",
//     sourceArn: pulumi.output([websocketApi.executionArn, websocketApi.id]).apply(args => `${args[0]}/${args[1]}/*/*`),
// });

// // Define an integration between the API Gateway and the Lambda function.
// const integration = new aws.apigatewayv2.Integration("lambdaIntegration", {
//     apiId: websocketApi.id,
//     integrationType: "AWS_PROXY",
//     integrationUri: lambdaFunctionStream.invokeArn,
// });

// // Define a route for handling connections.
// const connectRoute = new aws.apigatewayv2.Route("connectRoute", {
//     apiId: websocketApi.id,
//     routeKey: "$connect",
//     authorizationType: "NONE",
//     target: integration.id.apply(id => `integrations/${id}`),
// });

// console.log("api_endpoint", websocketApi.apiEndpoint);
// console.log("dynamo_table_name", basicDynamodbTable.name);
/**
 * END websocket
 * ________________________________________________________________________________
 */


/**
 * lambdaFunctionSet
 * ________________________________________________________________________________
 */
// Create the Set Lambda function.
const lambdaFunctionSet = new aws.lambda.Function("logger-set", {
    
    code: new pulumi.asset.FileArchive(functionsPath),
    role: lambdaRole.arn,
    handler: "set.handler",
    runtime: "nodejs18.x",
    environment: {
        variables: {
            'TABLE_NAME': basicDynamodbTable.name, // Pass the table name as an environment variable
        }
    }
});
/**
 * END lambdaFunctionSet
 * ________________________________________________________________________________
 */

/**
 * lambdaFunctionGet
 * ________________________________________________________________________________
 */
// Create the Get Lambda function.
const lambdaFunctionGet = new aws.lambda.Function("logger-get", {
    
    code: new pulumi.asset.FileArchive(functionsPath),
    role: lambdaRole.arn,
    handler: "get.handler",
    runtime: "nodejs18.x",
    environment: {
        variables: {
            'TABLE_NAME': basicDynamodbTable.name, // Pass the table name as an environment variable
        }
    }
});
/**
* END lambdaFunctionGet
* ________________________________________________________________________________
*/


/**
 * Log system
 * ________________________________________________________________________________
 */

const logLambda = createLambda({
    codePath: functionsPath,
    codeFileName: 'stream',
    handlerName: 'handler',
    timeout: TIME_OUT,
    environment: {
        variables: {
            REGION,
            OPENAI_API_KEY_PATH: openaiApiKeyPath,
            ENV_NAME: environmentName,
            LOG_TABLE_NAME: logTableName,
            ...allQueuesENV,
            ...tables,
            ...AI_CONFIG,
            SYSTEM_NAME: 'mon',
        },
    },
    serviceName: "",
    roleArn: lambdaRole.arn
});
  
const logTableTriggerName = createServiceName('log-trigger');
const logTableTrigger = new aws.lambda.EventSourceMapping(logTableTriggerName, {
    // eventSourceArn: sessionTable.streamArn,
    eventSourceArn: basicDynamodbTable.streamArn,
    functionName: logLambda.arn,
    startingPosition: 'LATEST',
});
const logAGSocName = createServiceName('api-log-soc');
const logAGSoc = new aws.apigatewayv2.Api(logAGSocName, {
    protocolType: 'WEBSOCKET',
    routeSelectionExpression: '$request.body.action',
});

const logLambdaPerName = createServiceName('lambda-log-per');
const logLambdaPer = new aws.lambda.Permission(logLambdaPerName, {
    action: 'lambda:InvokeFunction',
    function: logLambda.name,
    principal: 'apigateway.amazonaws.com',
    // The sourceArn is important for restricting this permission to only the specified API Gateway
    sourceArn: pulumi.interpolate`${logAGSoc.executionArn}/*/*`,
});

const logConIntName = createServiceName('log-soc-con-int');
const logConInt = new aws.apigatewayv2.Integration(logConIntName, {
    apiId: logAGSoc.id,
    integrationType: 'AWS_PROXY',
    integrationUri: logLambda.invokeArn,
    // Payload format version is required for WebSocket APIs. For Lambda, use "1.0"
    payloadFormatVersion: '1.0',
});

const conRouteName = createServiceName('log-soc-con-route');
const conRoute = new aws.apigatewayv2.Route(conRouteName, {
    apiId: logAGSoc.id,
    routeKey: '$connect',
    target: pulumi.interpolate`integrations/${logConInt.id}`,
});

const logDisIntName = createServiceName('log-soc-dis-int');
const logDisInt = new aws.apigatewayv2.Integration(logDisIntName, {
    apiId: logAGSoc.id, // Reference to your existing API Gateway
    integrationType: 'AWS_PROXY',
    integrationUri: logLambda.invokeArn, // ARN of the Lambda function
    payloadFormatVersion: '1.0',
});

const disRouteName = createServiceName('log-soc-dis-route');
const disRoute = new aws.apigatewayv2.Route(disRouteName, {
    apiId: logAGSoc.id, // Reference to your existing API Gateway
    routeKey: '$disconnect',
    target: pulumi.interpolate`integrations/${logDisInt.id}`,
});

const defIntName = createServiceName('log-soc-def-int');
const defInt = new aws.apigatewayv2.Integration(defIntName, {
    apiId: logAGSoc.id, // Reference to your existing API Gateway
    integrationType: 'AWS_PROXY',
    integrationUri: logLambda.invokeArn, // ARN of the Lambda function
    payloadFormatVersion: '1.0',
});

const defRoutName = createServiceName('log-soc-def-route');
const defRout = new aws.apigatewayv2.Route(defRoutName, {
    apiId: logAGSoc.id, // Reference to your existing API Gateway
    routeKey: '$default',
    target: pulumi.interpolate`integrations/${defInt.id}`,
});

const logAGStageName = createServiceName('log-ag-stage');
const logAGStage = new aws.apigatewayv2.Stage(logAGStageName, {
    apiId: logAGSoc.id,
    name: 'dev',
    autoDeploy: true,
});

export const logWebSocketUrl = pulumi.interpolate`${logAGSoc.apiEndpoint}`;

/**
 * END Log system
 * ________________________________________________________________________________
 */

// Attach Lambda function to DynamoDB Stream
// const eventSourceMapping = new aws.lambda.EventSourceMapping("logTableStreamMapping", {
//     batchSize: 1,
//     eventSourceArn: basicDynamodbTable.streamArn, // Use the stream ARN from basicDynamodbTable
//     functionName: logLambda.name,
//     startingPosition: "LATEST", // Specify the starting position for reading records
// });

// const testLive = new aws.lambda.FunctionUrl("test_live", {
//     functionName: logLambda.name,
//     authorizationType: "NONE",
//     cors: {
//         allowCredentials: true,
//         allowOrigins: ["*"],
//         allowMethods: ["*"],
//         allowHeaders: [
//             "date",
//             "keep-alive",
//         ],
//         exposeHeaders: [
//             "keep-alive",
//             "date",
//         ],
//         maxAge: 86400,
//     },
// });
