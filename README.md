# Chapter Performance Dashboard API

A RESTful API for managing and retrieving chapter performance data for educational purposes.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red)](https://youtu.be/your-video-id)

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Redis Cloud (for caching & rate-limiting)

## Features

- RESTful API endpoints for chapter data
- Filtering and pagination
- Redis caching for improved performance
- Rate limiting to prevent abuse
- Admin-only chapter upload functionality
- Web UI for testing API endpoints

## Setup

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis Cloud account (or local Redis)

### Redis Cloud Setup

1. Sign up for a free Redis Cloud account at [Redis Cloud](https://redis.com/try-free/)
2. Create a new subscription (free tier)
3. Create a new database
4. Get your Redis connection URL (looks like: `redis://username:password@host:port`)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chapter-performance-dashboard.git
   cd chapter-performance-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mathango
   REDIS_URL=redis://username:password@your-redis-cloud-host:port
   ADMIN_PASSWORD=your_admin_password
   NODE_ENV=development
   ```

### Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Get All Chapters
```
GET /api/v1/chapters
```

Query Parameters:
- `class`: Filter by class (e.g., "Class 11")
- `unit`: Filter by unit (e.g., "Mechanics 1")
- `status`: Filter by status ("Not Started", "In Progress", "Completed")
- `weakChapters`: Filter weak chapters (true/false)
- `subject`: Filter by subject (e.g., "Physics")
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 10)

### Get Chapter by ID
```
GET /api/v1/chapters/:id
```

### Upload Chapters (Admin only)
```
POST /api/v1/chapters
```

Headers:
- `admin-password`: Admin password from .env file

Body:
- Form-data with a file field named "chapters" containing a JSON file

## Rate Limiting

The API is rate-limited to 30 requests per minute per IP address.

## Caching

Responses from the `/api/v1/chapters` endpoint are cached for 1 hour to improve performance. The cache is invalidated when new chapters are added.

## Web UI

A simple web UI is available to test the API endpoints:

```
http://localhost:3000
```

The UI provides interfaces for:
- Getting all chapters with filters
- Getting a chapter by ID
- Uploading chapters (admin only)

## Deployment

### AWS EC2 Deployment

The application is deployed on AWS EC2 and can be accessed at:
[http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com](http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com)

### Continuous Deployment

This project uses GitHub Actions for continuous deployment to AWS EC2. When changes are pushed to the main branch, the workflow automatically deploys the updated code to the EC2 instance.

### Deployment Steps (Manual)

1. Set up an EC2 instance with Node.js, MongoDB, and Git installed
2. Clone the repository on the EC2 instance
3. Install dependencies with `npm install`
4. Set up environment variables in a `.env` file
5. Use PM2 to run the application in production mode:
   ```
   npm install -g pm2
   pm2 start src/index.js --name chapter-dashboard
   ```

## Video Demonstration

A video demonstration of the application is available at:
[https://youtu.be/your-video-id](https://youtu.be/your-video-id)

## Project Structure

```
.
├── .github/workflows    # GitHub Actions workflows
├── public/              # Static files for web UI
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── index.js         # Application entry point
│   └── server.js        # Express server setup
├── .env                 # Environment variables (not in repo)
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
└── README.md            # Project documentation
``` 