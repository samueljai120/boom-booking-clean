# 🎤 Boom Karaoke Booking System

A modern, full-stack karaoke room booking system built with React, Vite, and PostgreSQL.

## 🚀 Features

- **Interactive Calendar**: Drag-and-drop booking interface
- **Room Management**: Create and manage karaoke rooms
- **Real-time Updates**: Live booking updates via WebSocket
- **Authentication**: Secure JWT-based authentication
- **Responsive Design**: Works on desktop and mobile
- **Multi-tenant Ready**: Built for scalability

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL
- **Authentication**: JWT tokens
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 20.x
- npm or yarn
- Neon PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Boom-Booking-Isolate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL=your-neon-postgresql-url
   JWT_SECRET=your-super-secure-jwt-secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

- **Email**: `demo@example.com`
- **Password**: `demo123`

## 📁 Project Structure

```
Boom-Booking-Isolate/
├── api/                    # Vercel API routes
│   ├── auth/              # Authentication endpoints
│   ├── bookings.js        # Booking management
│   ├── rooms.js           # Room management
│   └── business-hours.js  # Business hours
├── src/                   # React application
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   └── utils/             # Utility functions
├── lib/                   # Database and utilities
└── server.js              # Development server
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **rooms**: Karaoke room definitions
- **bookings**: Room bookings and reservations
- **business_hours**: Operating hours configuration

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables**
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `JWT_SECRET`: Secure JWT secret

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/rooms` - Get all rooms
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings` - Update booking
- `DELETE /api/bookings` - Delete booking
- `GET /api/business-hours` - Get business hours
- `PUT /api/business-hours` - Update business hours

## 📊 Database Setup

The database is automatically initialized when the application starts. It includes:

- Default user account (`demo@example.com` / `demo123`)
- Sample rooms (Room A, B, C)
- Default business hours

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the troubleshooting guide

---

**Built with ❤️ for karaoke enthusiasts**