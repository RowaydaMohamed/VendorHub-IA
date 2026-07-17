# VendorHub

VendorHub is a multi-vendor marketplace platform where **Vendors** list products, **Admins** approve vendors and products, and **Customers** browse, favorite, and purchase items. It's built as a .NET Web API backend with a React (Vite) frontend, using SQLite for storage and SignalR for real-time vendor notifications.

## Features

- **Role-based access** — Admin, Vendor, and Customer roles with JWT authentication and route protection on both the API and frontend.
- **Vendor onboarding** — new vendors register and must be approved by an Admin before they can list products.
- **Product catalog** — vendors create/update/delete products; products require Admin approval before appearing publicly.
- **Orders & checkout** — customers can place orders; vendors can view their sales history.
- **Favorites** — customers can save products to a wishlist.
- **Reviews** — customers can rate and review products.
- **Real-time notifications** — vendors get notified live (via SignalR) when one of their products is purchased.
- **Admin dashboard** — manage vendor approvals and review pending product listings.

## Tech Stack

**Backend** — `VendorHub.API`
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core + SQLite
- JWT Bearer authentication, BCrypt password hashing
- SignalR (`/hubs/notifications`) for real-time updates
- Layered architecture: Controllers → Services → Repositories → EF Core

**Frontend** — `vendorhub-frontend`
- React 19 + Vite
- React Router v7
- Axios for API calls
- Bootstrap 5 for styling
- `@microsoft/signalr` client for live notifications

## Project Structure

```
VendorHub_IA.sln
VendorHub.API/
├── Controllers/       # AuthController, ProductsController, OrdersController,
│                       # AdminController, FavoritesController, NotificationsController, ReviewsController
├── Services/           # Business logic (AuthService, ProductService, OrderService, AdminService)
├── Repositories/       # Data access layer (generic + entity-specific repositories)
├── Models/             # EF Core entities: User, Product, Order, Review, Favorite, Notification
├── DTOs/                # Request/response data transfer objects
├── Data/                # AppDbContext
├── Hubs/                # NotificationHub (SignalR)
├── Migrations/          # EF Core migrations
├── appsettings.json      # Connection string, JWT config
└── vendorhub.db          # SQLite database file

vendorhub-frontend/
└── src/
    ├── api/             # Axios instance
    ├── context/         # AuthContext (login state, JWT)
    ├── components/       # Navbar, ProductCard
    └── pages/
        ├── Home, Login, Register, ProductDetail
        ├── vendor/       # VendorDashboard, ManageProducts, SalesHistory
        ├── customer/     # Favorites, MyOrders, Checkout, OrderSuccess, Profile
        └── admin/        # AdminDashboard, ManageVendors, PendingProducts
```

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+) and npm

### 1. Run the backend

```bash
cd VendorHub.API
dotnet restore
dotnet ef database update   # applies migrations (or rely on EnsureCreated() on first run)
dotnet run
```

The API starts at `http://localhost:5027` (or `https://localhost:7146`). On first run it seeds a default admin account:

- **Email:** `admin@vendorhub.com`
- **Password:** `admin123`

> ⚠️ Change the default admin password and the `Jwt:Key` in `appsettings.json` before deploying anywhere beyond local development.

### 2. Run the frontend

```bash
cd vendorhub-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and is pre-configured (via CORS on the API) to talk to the backend at `http://localhost:5027`.

## API Overview

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Public |
| Products | `GET /api/products`, `GET /api/products/{id}` | Public |
| Products | `POST/PUT/DELETE /api/products`, `GET /api/products/my` | Vendor |
| Orders | `POST /api/orders`, `GET /api/orders/my` | Customer |
| Orders | `GET /api/orders/vendor-sales` | Vendor |
| Favorites | `GET/POST/DELETE /api/favorites` | Customer |
| Reviews | `GET /api/reviews/product/{id}`, `POST /api/reviews` | Public read / Customer write |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/{id}/read` | Vendor |
| Admin | `/api/admin/vendors*`, `/api/admin/products*` | Admin |
| Real-time | `/hubs/notifications` (SignalR, JWT via query string) | Vendor |

## Database

The app uses SQLite (`vendorhub.db`) via EF Core, with the following tables: `Users`, `Products`, `Orders`, `Reviews`, `Favorites`, `Notifications`. Migrations live in `VendorHub.API/Migrations`; the schema is also created automatically on startup via `EnsureCreated()`.

## Notes

- CORS is currently locked to `http://localhost:5173` — update the `AllowReact` policy in `Program.cs` if hosting the frontend elsewhere.
- Secrets in `appsettings.json` (JWT key, connection string) are for local development only and should be moved to environment variables/secret management for production.
