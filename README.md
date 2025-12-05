# MedAssist Now - Backend

Real-Time Medicine Availability & Delivery System - Backend API

## 🎓 College Project (50 Marks)

This is a comprehensive backend system for a real-time medicine availability and delivery platform.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Cache**: Redis (To be configured)
- **Message Queue**: RabbitMQ (To be configured)
- **Search**: Elasticsearch (To be configured)
- **Authentication**: JWT (To be configured)
- **Monitoring**: Prometheus (To be configured)

## 📁 Project Structure

```
medassistnow-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   └── environment.js # Environment variables
│   ├── routes/           # API routes
│   │   └── index.js      # Main router
│   ├── controllers/      # Request handlers (to be created)
│   ├── models/          # MongoDB schemas (to be created)
│   ├── services/        # Business logic services (to be created)
│   ├── workers/         # Background jobs (to be created)
│   ├── middleware/      # Custom middleware (to be created)
│   ├── utils/           # Helper functions
│   │   ├── apiResponse.js # Response formatter
│   │   └── constants.js   # Application constants
│   └── server.js        # Main server file
├── docker-compose.yml   # Docker services
├── prometheus.yml       # Prometheus config
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
└── README.md           # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- MongoDB, Redis, RabbitMQ, Elasticsearch (via Docker)

### Installation

1. **Clone the repository**
   ```bash
   cd medassistnow-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Test
- `GET /api/test` - Test API connectivity

### Root
- `GET /` - Welcome message and endpoints list

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🐳 Docker Services

All backend services are configured in `docker-compose.yml`:

- **MongoDB** - Port 6379 (Authentication: admin/admin)
- **Redis** - Port 6379
- **RabbitMQ** - Ports 5672, 15672 (Management UI: http://localhost:15672)
- **Elasticsearch** - Port 9200
- **Prometheus** - Port 9090

### Service URLs

- MongoDB: `mongodb://admin:admin@localhost:27017`
- Redis: `redis://localhost:6379`
- RabbitMQ: `amqp://admin:admin@localhost:5672`
- RabbitMQ Management: `http://localhost:15672` (admin/admin)
- Elasticsearch: `http://localhost:9200`
- Prometheus: `http://localhost:9090`

## 📝 Development Status

### ✅ Completed
- [x] Basic project structure
- [x] Express server setup
- [x] MongoDB connection
- [x] CORS configuration
- [x] Environment configuration
- [x] Docker services setup
- [x] Basic routing structure
- [x] Response utilities
- [x] Constants definition

### 🚧 To Be Implemented
- [ ] Authentication & JWT
- [ ] Redis integration
- [ ] RabbitMQ workers
- [ ] Elasticsearch integration
- [ ] User models & routes
- [ ] Pharmacy models & routes
- [ ] Medicine models & routes
- [ ] Order models & routes
- [ ] Delivery models & routes
- [ ] Prometheus metrics
- [ ] Input validation
- [ ] Error handling middleware

## 🔐 Security Features

- Helmet.js for security headers
- CORS enabled (configured for development)
- Environment variables for sensitive data
- Input validation (to be implemented)
- JWT authentication (to be implemented)

## 👥 User Roles

- **Patient**: Browse medicines, place orders
- **Pharmacy**: Manage inventory, fulfill orders
- **Delivery Partner**: Accept and deliver orders
- **Admin**: Manage system, users, and analytics

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { },
  "timestamp": "2025-11-19T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": null,
  "timestamp": "2025-11-19T10:00:00.000Z"
}
```

## 📄 License

This is a college project for educational purposes.

## 👨‍💻 Author

College Project - Real-Time Medicine Availability & Delivery System
