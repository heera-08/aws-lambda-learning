import { APIGatewayProxyResult } from "aws-lambda";

export const successResponse = (body:any):APIGatewayProxyResult => ({
    statusCode : 200,
    headers: {'Content-Type': 'application/JSON'},
    body: JSON.stringify(body)
});

export const errorResponse = (message:string, statusCode:number): APIGatewayProxyResult => ({
    statusCode, 
    headers: {'Content-Type': 'application/JSON'},
    body: JSON.stringify({error:message}),
});
