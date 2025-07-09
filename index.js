import { successResponse, errorResponse } from './util.js';
export const handler = async (event) => {
    console.log("HTTP method: ", event.httpMethod);
    console.log("Path: ", event.path);
    console.log("body: ", event.body);
    console.log("Headers: ", JSON.stringify(event.headers));
    const { httpMethod, path } = event;
    const trimmedPath = path.replace(/\/$/, ''); //no quotes just /..../
    try {
        if (httpMethod == 'POST' && trimmedPath == "requesting") {
            console.log("hey it's running");
        }
        else {
            return errorResponse("Not found error", 404);
        }
        return successResponse({ message: "request has been successful" });
    }
    catch (error) {
        console.error("error while handling response");
        return errorResponse("server error", 500);
    }
};
