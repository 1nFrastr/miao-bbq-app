# MiaoBBQ - BBQ Ordering & Community Recommendation Full-Stack Project

[中文文档](README.md) | **English**

A WeChat Mini Program developed with Taro + Django, providing BBQ ordering records and community recommendation sharing features.

## 🍖 Core Features

### 📝 Ordering Record Function
- Record BBQ order details (dish name, unit price, quantity)
- Real-time calculation of total order amount
- Meal waiting timer function, record dining time
- Order status management (pending/in progress/completed)
- Local storage of order history
- Form validation and error prompts

### 🌍 Community Recommendation Function  
- Publish BBQ restaurant recommendation shares
- Upload restaurant images (up to 3 photos)
- Location-based nearby restaurant recommendations
- Multiple sorting methods (nearest distance, latest posts, most popular)
- Restaurant likes and view statistics
- Recommendation content search and filtering

### 📍 Geolocation Service
- Smart location permission request
- GPS positioning and address resolution
- Location-based nearby restaurant queries
- Distance calculation and display
- Graceful degradation when location permission is denied

### 🛠 Admin Backend Function
- Administrator login authentication
- Content moderation workflow
- User data statistics
- Operation log recording
- Dashboard data display

## 🛠 Tech Stack

### Frontend Technology
- **Mini Program**: Taro 4.1.5 + React 18 + TypeScript + Sass
- **Admin Panel**: Vite + React 19 + TypeScript + Sass
- **UI Components**: Taro UI 3.3.0
- **State Management**: Zustand
- **Package Manager**: pnpm

### Backend Technology  
- **Framework**: Django 5.2.4 + Django REST Framework
- **Database**: SQLite (development) / MySQL (production)
- **Authentication**: Based on WeChat Mini Program openid
- **CORS**: django-cors-headers

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 16
- Python 3.10+
- pnpm
- WeChat Developer Tools

### Backend Setup

1. **Activate virtual environment and install dependencies**
   ```bash
   # Windows Git Bash
   source ./backend/venv/Scripts/activate
   pip install -r ./backend/requirements.txt
   ```

2. **Initialize database**
   ```bash
   python ./backend/manage.py migrate
   ```

3. **Start backend service**
   ```bash
   python ./backend/manage.py runserver
   ```

### Mini Program Setup

1. **Install dependencies**
   ```bash
   cd frontend-app
   pnpm install
   ```

2. **Start development service**
   ```bash
   pnpm run dev:weapp
   ```

3. **Import to WeChat Developer Tools**
   - Open WeChat Developer Tools
   - Import project directory: `frontend-app/dist`
   - Configure Mini Program AppID

### Admin Panel Setup

```bash
cd frontend-admin
pnpm install
pnpm run dev
```

## 📂 Project Structure

```
miao-bbq-app/
├── backend/              # Django backend service
│   ├── core/            # Project core configuration
│   ├── users/           # User management module
│   ├── orders/          # Order management module
│   ├── community/       # Community recommendation module
│   ├── admin_panel/     # Admin backend module
│   ├── api/             # API configuration
│   ├── media/           # Media file storage
│   └── manage.py        # Django management commands
├── frontend-app/        # Taro Mini Program frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Common components
│   │   ├── utils/       # Utility functions
│   │   ├── types/       # TypeScript types
│   │   └── assets/      # Static resources
│   └── config/          # Build configuration
└── frontend-admin/      # Admin panel frontend
    ├── src/
    └── public/
```

## 🔧 VS Code Tasks

The project has configured convenient VS Code tasks. Press `Ctrl+Shift+P` and search "Tasks: Run Task":

- **Start Backend Service** - Automatically activate virtual environment and start Django service
- **Start Mini Program Development** - Start Taro development mode
- **Start Admin Panel Development** - Start Vite development server
- **Install Backend Dependencies** - Install Python dependency packages
- **Run Database Migration** - Execute database structure updates
- **Switch Database Configuration** - Switch between SQLite/MySQL

## 📋 API Endpoints

### User Related
- `POST /api/users/users/login/` - WeChat Mini Program login
- `GET /api/users/users/` - User list
- `POST /api/users/users/{id}/update_profile/` - Update user profile

### Order Related
- `POST /api/orders/orders/` - Create order
- `GET /api/orders/orders/` - Get order list
- `POST /api/orders/orders/{id}/start_timer/` - Start timer
- `POST /api/orders/orders/{id}/complete/` - Complete order
- `GET /api/orders/orders/statistics/` - Order statistics

### Community Related
- `POST /api/community/posts/` - Publish recommendation
- `GET /api/community/posts/` - Get recommendation list
- `GET /api/community/posts/nearby/` - Get nearby recommendations
- `POST /api/community/posts/{id}/like/` - Like/unlike

### Admin Backend
- `POST /api/admin/admin-users/login/` - Admin login
- `GET /api/admin/admin-users/dashboard/` - Dashboard data
- `GET /api/admin/moderation/` - Content moderation list
- `POST /api/admin/moderation/{id}/approve/` - Approve content

## 🎯 Development Guide

### Development Standards
- Use TypeScript for type-safe development
- Follow ESLint and Prettier code standards
- Component-based development for code reusability
- Reasonable use of caching strategies to optimize performance

### Data Flow Design
- Frontend uses Zustand for state management
- Backend adopts RESTful API design
- Support local storage and cloud synchronization
- Implement optimistic updates and error rollback

### Location Service Integration
- Integrate WeChat Mini Program location API
- Implement smart permission request process
- Support graceful degradation when location permission is denied
- Provide distance calculation and nearby recommendation algorithms

## 🔮 Future Plans

- [ ] Multi-user group ordering function
- [ ] Restaurant rating system  
- [ ] Personal consumption statistics
- [ ] Social sharing function
- [ ] Push notification service
- [ ] Data analytics reports
- [ ] Third-party payment integration
