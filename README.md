# Ribisome ERP - Backend (Node.js + Sequelize)

A production-ready Express.js backend with role-based access control (RBAC), database migrations, and comprehensive middleware setup.

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Git

### Installation

```bash
# Install dependencies
npm install

# Create environment files
cp .env.example .env
cp .env.development.example .env.development

# Setup database
npm run db-migrate      # Run migrations
npm run db-seed         # Seed initial data (roles & permissions)
```

### Development

```bash
# Start development server (with auto-reload)
npm run dev
# Server runs at http://localhost:3000

# Format code with Prettier
npx prettier --write .
```

### Production

```bash
npm start
```

## Architecture

### Role-Based Access Control (RBAC)
- **3 Roles**: superadmin, admin, staff
- **Permission-based**: Each role has granular permissions
- **Middleware protected**: Routes check roles and permissions

### Core Structure

```
src/
├── routers/              # Express route handlers
│   ├── auth/            # Authentication (login/logout)
│   ├── admin/           # Admin operations (user management)
│   └── staff/           # Staff operations
├── services/            # Business logic & middleware
├── database/
│   ├── models/          # Sequelize ORM models
│   ├── migrations/      # Database schema changes
│   └── seeders/         # Initial data
└── server.js            # App entry point
```

## API Endpoints

### Authentication (Public)
- `POST /auth/login` - User login
- `PUT /auth/logout` - User logout

### Admin Routes (Protected)
- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user details
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Utilities (Public)
- `GET /financial-years` - Get fiscal year list
- `GET /` - Health check

## Documentation

**Getting Started & Reference**
- [Quick Reference](docs/QUICK_REFERENCE.md) - Common tasks & commands
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification

**RBAC System (Role-Based Access Control)**
- [RBAC Quick Start](.agents/skills/RBAC_QUICK_START.md) - Getting started with roles & permissions
- [RBAC Architecture](.agents/skills/RBAC_ARCHITECTURE.md) - System design & concepts
- [Full RBAC Guide](.agents/skills/ROLE_BASED_ACCESS_CONTROL.md) - Comprehensive documentation

**Development Standards**
- [Express API Standards](.agents/skills/express-api-route-standards/SKILL.md) - Route/controller conventions
- [Sequelize Standards](.agents/skills/sequelize-model-and-migration-standards/SKILL.md) - Model patterns
- [Service Layer Guidelines](.agents/skills/service-layer-guidelines/SKILL.md) - Business logic structure

## Environment Configuration

Create `.env` files with required variables:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ribisome_erp
DB_PORT=3306

# Server
NODE_ENV=development
PORT=3000

# Security
ENCRYPTION_SECRET=your-32-byte-secret-key-here

# Frontend
FRONT_END_URL=http://localhost:3001
```

## Development Standards

Follow project conventions defined in `.agents/skills/`:
- Express API route standards
- Sequelize model patterns
- Service layer guidelines

## Key Features

✅ Role-based access control (RBAC)  
✅ JWT authentication  
✅ Database migrations & seeders  
✅ Comprehensive error handling  
✅ Request validation (Zod schemas)  
✅ Logging (Winston + Morgan)  
✅ Rate limiting  
✅ CORS protection  
✅ Security headers (Helmet)  

## Testing

Models load successfully and are ready for testing:
```bash
node -e "require('./src/database/models'); console.log('✅ Models initialized')"
```

## Troubleshooting

**Database Connection Error**
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database exists

**Port Already in Use**
- Change PORT in `.env`
- Or kill existing process: `lsof -i :3000`

## Technologies

- **Express.js** - Web framework
- **Sequelize** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Zod** - Schema validation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin handling

## License

ISC