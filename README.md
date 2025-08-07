# JobKeep - Vehicle Garage Management System Frontend

A modern, responsive React frontend for comprehensive vehicle garage management built with TypeScript, Tailwind CSS, and Vite.

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication system
- Protected routes with automatic redirects
- Session management and token refresh
- Role-based access control ready

### 📊 Dashboard & Analytics
- Real-time business metrics and KPIs
- Recent job cards with progress tracking
- Today's appointments overview
- Quick action shortcuts
- System status monitoring

### 👥 Client Management
- Complete CRUD operations for clients
- Advanced search and filtering
- Client-vehicle relationship tracking
- Contact information management
- Service history access

### 🚗 Vehicle Management
- Vehicle inventory with detailed records
- Client-vehicle associations
- Registration and VIN tracking
- Service history by vehicle
- Fleet management capabilities

### 👷 Employee Management
- Staff database with roles and departments
- Performance ratings and tracking
- Job assignment management
- Contact information and skills
- Workload distribution

### 📋 Job Card System
- Complete service workflow tracking
- Status management (Open, In Progress, Frozen, Completed, Closed)
- Priority handling and overdue alerts
- Time tracking and progress monitoring
- Service checklists integration

### 📅 Appointment Scheduling
- Calendar-based appointment booking
- Client and vehicle selection
- Service type categorization
- Duration management
- Reminder system integration

### 💰 Invoice Management
- Professional invoice generation
- Payment status tracking
- Multiple payment methods
- Due date management
- Client billing history

### 📈 Reports & Analytics
- Financial performance reports
- Operational efficiency metrics
- Customer analytics
- Vehicle service patterns
- Employee performance tracking

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and builds)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React (beautiful, consistent icons)
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM v6
- **Charts**: Recharts (for future analytics)
- **Date Handling**: date-fns

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (#3b82f6) - Main brand color
- **Secondary**: Orange (#f97316) - Complementary accent
- **Success**: Green (#22c55e) - Positive actions
- **Warning**: Amber (#f59e0b) - Caution states
- **Error**: Red (#ef4444) - Error states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Primary Font**: Inter (clean, modern sans-serif)
- **Monospace**: JetBrains Mono (for code and data)

### Components
- Consistent design language across all components
- Accessible with proper ARIA labels
- Responsive design for all screen sizes
- Smooth animations and transitions

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── layout/          # Layout components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── forms/           # Form components
│   │   ├── ClientForm.tsx
│   │   ├── VehicleForm.tsx
│   │   ├── JobCardForm.tsx
│   │   └── AppointmentForm.tsx
│   └── modals/          # Modal components
│       └── Modal.tsx
├── pages/
│   ├── auth/            # Authentication pages
│   │   └── Login.tsx
│   ├── dashboard/       # Dashboard
│   │   └── Dashboard.tsx
│   ├── clients/         # Client management
│   │   └── ClientList.tsx
│   ├── vehicles/        # Vehicle management
│   │   └── VehicleList.tsx
│   ├── employees/       # Employee management
│   │   └── EmployeeList.tsx
│   ├── jobcards/        # Job card management
│   │   └── JobCardList.tsx
│   ├── appointments/    # Appointment management
│   │   └── AppointmentList.tsx
│   ├── invoices/        # Invoice management
│   │   └── InvoiceList.tsx
│   ├── reports/         # Reports and analytics
│   │   └── Reports.tsx
│   └── settings/        # Settings
│       └── Settings.tsx
├── services/api/        # API integration
│   ├── base.ts          # Base API configuration
│   ├── auth.ts          # Authentication
│   ├── clients.ts       # Client operations
│   ├── vehicles.ts      # Vehicle operations
│   ├── employees.ts     # Employee operations
│   ├── jobcards.ts      # Job card operations
│   ├── timesheets.ts    # Timesheet operations
│   └── checklists.ts    # Checklist operations
├── hooks/               # Custom React hooks
│   ├── useClients.ts
│   ├── useVehicles.ts
│   ├── useEmployees.ts
│   └── useJobCards.ts
├── utils/               # Utility functions
│   ├── cn.ts            # Class name utility
│   ├── constants.ts     # App constants
│   ├── date.ts          # Date formatting
│   └── format.ts        # Text formatting
├── types/               # TypeScript definitions
│   └── index.ts
└── styles/              # Global styles
    └── globals.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Backend API running on port 8080

### Quick Start

1. **Run the setup scripts in order:**
   ```bash
   chmod +x *.sh
   ./01-setup-project.sh
   ./02-configure-project.sh
   ./03-generate-components.sh
   ./04-finalize-setup.sh
   ```

2. **Navigate to project and start:**
   ```bash
   cd jobkeep-frontend
   ./start-jobkeep.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API expected: http://localhost:5000

### Manual Setup (Alternative)

```bash
# Create project
npm create vite@latest jobkeep-frontend -- --template react-ts
cd jobkeep-frontend

# Install dependencies
npm install @tanstack/react-query @tanstack/react-table react-router-dom react-hook-form @hookform/resolvers yup axios date-fns lucide-react clsx tailwind-merge recharts react-hot-toast zustand

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/node

# Initialize Tailwind
npx tailwindcss init -p

# Start development
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_TIMEOUT=10000
VITE_APP_NAME=JobKeep
VITE_APP_VERSION=1.0.0
```

### API Integration

The frontend expects a Spring Boot backend with these endpoints:

- `POST /auth` - Authentication
- `GET|POST|PUT|DELETE /clients/*` - Client management
- `GET|POST|PUT|DELETE /vehicles/*` - Vehicle management
- `GET|POST|PUT|DELETE /employees/*` - Employee management
- `GET|POST|PUT|DELETE /jobCards/*` - Job card management
- `GET|POST|PUT|DELETE /timesheet/*` - Timesheet management

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: 320px - 767px (stack layouts, simplified navigation)
- **Tablet**: 768px - 1023px (hybrid layouts, collapsible sidebar)
- **Desktop**: 1024px+ (full sidebar, multi-column layouts)

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST request to `/auth`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token included in all subsequent API requests
6. Automatic logout on token expiration

## 🎯 User Experience Features

### Non-Technical User Friendly
- Intuitive navigation with clear labeling
- Consistent button and form patterns
- Helpful error messages and validation
- Loading states for all operations
- Success/error notifications
- Keyboard navigation support

### Performance Optimizations
- Code splitting for faster initial load
- Optimistic updates for better UX
- Efficient state management
- Image optimization and lazy loading
- API request caching and deduplication

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript checks
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality checks (optional)

## 🚀 Deployment

### Production Build

```bash
npm run build:prod
```

The `dist/` folder contains the production build ready for deployment.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
2. **Traditional Web Server** (Apache, Nginx)
3. **Container Deployment** (Docker, Kubernetes)
4. **Cloud Platforms** (AWS S3, Azure, GCP)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks
5. Submit a pull request

## 📄 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](src/services/api/README.md)

## 🔧 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Features Roadmap

### Phase 1 ✅ (Current)
- Core authentication and navigation
- Client, vehicle, and employee management
- Basic job card and appointment system
- Responsive design and UI components

### Phase 2 🚧 (In Progress)
- Advanced reporting and analytics
- Invoice generation and payment tracking
- Real-time notifications
- Advanced search and filtering

### Phase 3 📋 (Planned)
- Mobile app companion
- Offline capability
- Advanced integrations (payment gateways, SMS)
- Multi-location support

### Phase 4 🔮 (Future)
- AI-powered insights
- Predictive maintenance
- Customer portal
- API ecosystem

---

**JobKeep** - Streamlining vehicle garage management with modern technology and intuitive design.
