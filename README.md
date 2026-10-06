# DevSpace Portfolio

React frontend and Express/MongoDB backend for Vivek's portfolio.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm
- MongoDB and an OpenAI API key to enable VKY chat

## Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` and `MONGODB_URI` to enable chat.
3. Run `npm run dev`.
4. Open the Vite URL printed in the terminal (normally `http://127.0.0.1:5173`).

Vite forwards `/api` requests to the Express server on port 3000. The portfolio can
be used without chat credentials; VKY will report a configuration error until
both credentials are set.

## Production

Run `npm run build`, then `npm start`. The Express server serves the generated
React site from `frontend/dist` as well as the `/api` endpoints.

## Project layout

- `frontend/src`: React application, components, data, and styles
- `frontend/public/assets`: portfolio image and resume
- `backend/routes`: Express API routes
- `backend/services`: MongoDB and AI chat operations
- `backend/server.js`: Express application and server startup
- `test`: backend API tests
