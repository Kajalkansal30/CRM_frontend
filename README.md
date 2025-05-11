# Mini CRM Frontend

This is the frontend application for the Mini CRM project. It is built using React and Material-UI.

## Features

- User authentication with Google OAuth and JWT
- Responsive UI with Material-UI components
- Pages for managing customers, orders, campaigns, and segments
- Integration with backend API for data fetching and updates
- React Router for client-side routing
- Form validation with Formik and Yup
- State management with React Context and React Query

## Prerequisites

- Node.js (v16 or higher recommended)
- Backend API running and accessible (default proxy to http://localhost:5000)

## Installation

1. Navigate to the frontend directory:

```bash
cd mini-crm/frontend
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

- To start the development server:

```bash
npm start
```

This will start the React development server on `http://localhost:3000`.

## Building for Production

- To create a production build:

```bash
npm run build
```

The build output will be in the `build` directory, which can be deployed to any static hosting service such as Vercel, Netlify, or AWS S3.

## Environment Variables

- The frontend uses a proxy to forward API requests to the backend server running on `http://localhost:5000`.
- Google OAuth client ID is configured in the source code (check `src/components/auth/GoogleLoginButton.js`).

### .env File

The frontend project uses a `.env` file to manage environment-specific variables. This file should be placed in the root of the `frontend` directory (`mini-crm/frontend/.env`).

A key environment variable to include is:

- `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID used for user authentication.

To set up the `.env` file, create a file named `.env` in the `mini-crm/frontend` directory and add your environment variables in the following format:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

After creating or updating the `.env` file, restart the development server to apply the changes.

Note: Environment variables prefixed with `REACT_APP_` are automatically loaded by Create React App.

### Using Token in API Requests

The frontend stores the authentication token in the browser's `localStorage` under the key `token`. This token is automatically included in the headers of API requests as `x-auth-token`.

If you want to manually test the backend API using PowerShell, use the following command format, replacing `<token>` with your actual token string:

```powershell
Invoke-RestMethod -Uri "https://crmbackend-eight.vercel.app/api/auth/user" -Headers @{Authorization="Bearer <token>"}
```

Make sure to include a space after `Bearer` before the token value.

## Project Structure

- `src/pages/` - React components for different pages (Login, Dashboard, CustomerList, etc.)
- `src/components/` - Reusable UI components
- `src/contexts/` - React Context providers for authentication and other global state
- `src/api/` - Axios instance and API utilities
- `src/hooks/` - Custom React hooks
- `public/` - Static assets and HTML template

## Deployment

- Build the app using `npm run build`.
- Deploy the contents of the `build` folder to your preferred static hosting provider.

## Known Limitations or Assumptions

- The frontend assumes the backend API is running and accessible at `http://localhost:5000` or the configured proxy.
- Google OAuth client ID must be correctly set in the `.env` file for authentication to work.
- Some features may require additional backend setup or permissions.
- CORS and authentication token handling depend on backend configuration.
- Currently, the data for orders and customers is the same for every user. Future updates will enable different users having customers and orders as they ask. but for now we have different segment and campaign data for each user to apply CRUD operation accordingly.

## Contributing

Feel free to open issues or submit pull requests.

## License

This project is licensed under the ISC License.
