# Tour Itinerary App

## Getting Started

### Backend
1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Set your Julep API key and environment in `.env`:
   ```env
   JULEP_API_KEY=your_julep_api_key_here
   JULEP_ENVIRONMENT=production
   ```
3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   npm start
   ```

The React app will run on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:3001](http://localhost:3001).

### Run Both with `concurrently`
For convenience, you can use [`concurrently`](https://www.npmjs.com/package/concurrently) to run both servers:

1. Install globally (if not already):
   ```bash
   npm install -g concurrently
   ```
2. From the project root:
   ```bash
   concurrently "cd backend && npm start" "cd frontend && npm start"
   ``` 