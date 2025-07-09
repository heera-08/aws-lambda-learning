export const successResponse = (body) => ({
    statusCode: 200,
    headers: { 'Content-Type': 'application/JSON' },
    body: JSON.stringify(body)
});
export const errorResponse = (message, statusCode) => ({
    statusCode,
    headers: { 'Content-Type': 'application/JSON' },
    body: JSON.stringify({ error: message }),
});
