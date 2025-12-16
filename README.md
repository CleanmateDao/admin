# Admin Dashboard

A React + Vite + TypeScript multi-page admin dashboard for managing Email, KYC, and Bank services.

## Features

- **Multi-page routing** with React Router
- **API key authentication** for each service
- **Service management pages**:
  - `/email` - Email service administration
  - `/kyc` - KYC submissions management
  - `/bank` - Bank transactions and exchange rates management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Usage

1. Navigate to any service page (`/email`, `/kyc`, or `/bank`)
2. Enter the service base URL (e.g., `http://localhost:3000` for email service)
3. Enter your API key
4. Click "Authenticate" to access the service management interface

## Default Service URLs

- Email Service: `http://localhost:3000`
- KYC Service: `http://localhost:3002`
- Bank Service: `http://localhost:3003`

These can be configured when authenticating. API keys are stored in localStorage per service.

## API Key Authentication

Each service page requires an API key to be provided via the `x-api-key` header. The API key is validated when authenticating and stored locally for subsequent requests.

## Build

To build for production:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

