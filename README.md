# WonderTravel

Full-stack Delhi outstation cab booking platform for Uttarakhand, Rajasthan and nearby destinations.

## Stack

- React 19 + Vite
- Node.js + Express
- MongoDB + Mongoose
- Plain JavaScript

## Run locally

1. Copy `server/.env.example` to `server/.env` and update `MONGODB_URI` if needed.
2. Install dependencies: `npm install && npm run install:all`
3. Start MongoDB locally.
4. Run both apps: `npm run dev`
5. Open `http://localhost:5173`

The API runs at `http://localhost:5001`. Fleet data is seeded automatically the first time the server connects to an empty database.

For production, run `npm run build` and then `npm start`. Express serves the React build.
