# Welcome to PopenStatus!

PopenStatus is a full-stack application with a modern TypeScript/Vite frontend and a robust GO backend system.

## Test this app

1. Please visit here: [https://popen-status.vercel.app/](https://popen-status.vercel.app/)

2. To sign in, please use these credentials

```
Email: test@gmail.com
Password: test
```

## Prerequisites

Before you begin, ensure you have the following installed:
- npm (for package management)
- Go (v1.21 or higher)
- Node.js (v18 or higher)
- Git

## Project Structure

```
PopenStatus/
├── ui/           # Frontend application
│   └── src/
│       ├── components/  # ShadcnUI-based components
│       ├── context/     # Org/WebSocket state
│       └── pages/       # Dashboard, PublicPage
├── backend/      # Backend services
│   ├── api/     # REST API (Go)
│   │   └── pkg/
│   │       ├── auth/    # Clerk JWT middleware
│   │       ├── models/  # GORM structs
│   │       ├── routes/  # REST/WebSocket handlers
│   │       └── ws/      # WebSocket server logic (WIP method-1)
│   ├── ws/      # WebSocket service (WIP method-2)
│   └── nginx/   # Nginx configuration (WIP)
```

## Setup Instructions

### Frontend Setup (ui/)

1. Navigate to the frontend directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:8080`

### Backend Setup

#### API Service (Go)

1. Navigate to the API directory:
   ```bash
   cd backend/api
   ```

2. Install Go dependencies:
   ```bash
   go mod download
   ```

3. Build the API service:
   ```bash
   go build -o api ./cmd/api
   ```

4. Run the API service:
   ```bash
   ./api
   # or for development
   go run ./cmd/api
   ```

The API service will be available at `http://localhost:8000`

> #### WebSocket Service (Not finished yet)
> 
> 1. Navigate to the WebSocket directory:
>    ```bash
>    cd backend/ws
>    ```
> 
> 2. Follow the setup instructions in the WebSocket service's README file.
> 
> #### Nginx Configuration Not finished yet
> 
> 1. Navigate to the nginx directory:
>    ```bash
>    cd backend/nginx
>    ```
> 
> 2. Copy the configuration files to your Nginx installation directory:
>    ```bash
>    # For macOS
>    sudo cp *.conf /usr/local/etc/nginx/servers/
>    # For Linux
>    sudo cp *.conf /etc/nginx/sites-available/
>    ```
> 
> 3. Test the Nginx configuration:
>    ```bash
>    sudo nginx -t
>    ```
> 
> 4. Reload Nginx:
>    ```bash
>    sudo nginx -s reload
>    ```

## Development

- Frontend development server runs on port 8080
- API service runs on port 8000

## Environment Variables

Create `.env` files in both frontend and backend/api directories as needed:

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=`clerk_publishalbe_key`
VITE_API_URL=http://localhost:8000/api
```

### Backend API (.env)
```
CLERK_SECRET_KEY=`clerk_secret_key`
DATABASE_URL=`postgresql://username:password@your-hostname.aws.neon.tech/dbname?sslmode=require`
CLERK_WEBHOOK_SIGNING_SECRET=`clerk_webhook_sigining_secret`
```

You can get a `DATABASE_URL` from [here](https://console.neon.tech/app/projects)


## Database Migration

1. Navigate to the backend API directory:
   ```bash
   cd backend/api
   ```

2. Run the migration and seed command:
   ```bash
   go run cmd/seed/main.go
   ```

Note: Please make sure your `DATABASE_URL` in the `.env` file is correctly set before running migrations.


Now you can access this application of `http://localhost:8080`.


Thank you for reading!
