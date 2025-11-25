// File: db/database.js

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
    DynamoDBDocumentClient, 
    GetCommand, 
    PutCommand, 
    UpdateCommand,
    DeleteCommand,
    QueryCommand, 
    ScanCommand 
} = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const client = new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

// Create Document client for easier operations
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
    }
});

// Table names from environment variables
const TABLES = {
    USERS: process.env.DYNAMODB_USERS_TABLE || 'hofmanager-bot-users-dev',
    DONATIONS: process.env.DYNAMODB_DONATIONS_TABLE || 'hofmanager-bot-donations-dev'
};

module.exports = {
    docClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand,
    TABLES
};
