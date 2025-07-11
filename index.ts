import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse, errorResponse } from './utils/util.js';
import { connectToDatabase } from './mongoClient.js';
import { Chat } from './schema.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("HTTP method:", event.httpMethod);
  console.log("Path:", event.path);
  console.log("Body:", event.body);
  console.log("Headers:", JSON.stringify(event.headers));

  const { httpMethod, path } = event;

  try {
    console.log("Processing path:", path);

    if (httpMethod === 'POST' && path === '/requesting') {
      console.log("Matched POST /requesting");

      if (!event.body) {
        return errorResponse("Missing request body", 400);
      }

      let parsedBody: { sessionId: string; messages: Array<{ author: string; content: string }> };
      try {
        parsedBody = JSON.parse(event.body);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return errorResponse("Invalid JSON format in request body", 400);
      }

      const { sessionId, messages } = parsedBody;

      if (typeof sessionId !== 'string' || !Array.isArray(messages)) {
        return errorResponse("Invalid input: sessionId must be a string and messages must be an array", 400);
      }

      for (const message of messages) {
        if (!message.author || !message.content ||
          !['bot', 'user'].includes(message.author) ||
          typeof message.content !== 'string') {
          return errorResponse("Invalid message format: each message must have 'author' (bot/user) and 'content' (string)", 400);
        }
      }

      console.log('Connecting to database...');
      await connectToDatabase();

      try {
        const chat = new Chat({
          sessionId,
          messages,
          archived: false
        });

        const savedChat = await chat.save();
        console.log('Chat saved successfully:', savedChat._id);

        return successResponse({
          message: "Chat created successfully",
          chat: {
            id: savedChat._id,
            sessionId: savedChat.sessionId,
            messages: savedChat.messages,
            archived: savedChat.archived,
            createdAt: savedChat.createdAt,
            updatedAt: savedChat.updatedAt
          }
        });

      } catch (dbError: any) {
        console.error("Database operation error:", dbError);

        if (dbError.code === 11000) {
          return errorResponse("Chat with this sessionId already exists", 409);
        }

        throw dbError;
      }
    }

    if (httpMethod === 'GET' && path.startsWith('/chat/')) {
      const sessionId = path.split('/')[2];

      if (!sessionId) {
        return errorResponse("Session ID is required", 400);
      }

      console.log('Connecting to database...');
      await connectToDatabase();

      const chat = await Chat.findOne({ sessionId });

      if (!chat) {
        return errorResponse("Chat not found", 404);
      }

      return successResponse({
        message: "Chat retrieved successfully",
        chat: {
          id: chat._id,
          sessionId: chat.sessionId,
          messages: chat.messages,
          archived: chat.archived,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
      });
    }

    console.log('Route not found');
    return errorResponse("Not found", 404);

  } catch (error) {
    console.error("Error during Lambda execution:", error);
    return errorResponse("Internal server error", 500);
  }
};
