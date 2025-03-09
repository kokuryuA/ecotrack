# Energy Consumption Predictor

A web application that predicts energy consumption based on household appliances and usage patterns.

## Features

- Input household appliances and their quantities
- Select date range for prediction
- Generate randomized energy consumption estimates
- Forecast future energy consumption based on trends
- Visualize consumption data with charts
- Responsive design for all devices
- Auth0 authentication
- Local authentication with email/password
- Supabase database integration for data persistence

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Recharts for data visualization
- React DatePicker for date selection
- Lucide React for icons
- Auth0 for authentication

### Backend
- Express.js (Node.js)
- JWT for token handling
- Supabase for database
- Randomized algorithm for initial predictions
- Statistical model for forecasting

## Getting Started

### Prerequisites
- Node.js (v16+)
- Auth0 account (optional)
- Supabase account

### Auth0 Setup (Optional)

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Single Page Web Application)
3. Configure the following settings:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
4. Copy your Auth0 Domain and Client ID to the `.env` file

### Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the API settings
4. Add them to the `.env` file
5. Run the SQL migrations in the `supabase/migrations` folder

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/energy-consumption-predictor.git
cd energy-consumption-predictor
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_JWT_SECRET=your-secret-key-for-jwt-tokens
```

### Running the Application

1. Start the backend server
```
npm run backend
```

2. In a new terminal, start the frontend development server
```
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

- `POST /predict` - Takes user inputs and returns random energy consumption
- `GET /forecast` - Uses past data to predict next month's consumption
- `POST /auth/signup` - Creates a new user account
- `POST /auth/login` - Authenticates a user

## License

This project is licensed under the MIT License - see the LICENSE file for details.