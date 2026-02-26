# ARCHITECTURE BLUEPRINT & NEW PROJECT DESIGN

## =====================================

## PHASE 1 – ARCHITECTURE EXTRACTION

## =====================================

### BACKEND ARCHITECTURE

#### Folder Structure

```
Backend/
├── server.ts                    # Entry point, Express app setup
├── src/
│   ├── config/                  # Configuration files
│   │   ├── db.ts               # MongoDB connection
│   │   └── jwt.ts              # JWT configuration
│   ├── core/                    # Base classes for reusability
│   │   ├── controllers/
│   │   │   └── base.controller.ts    # Generic CRUD controller
│   │   └── services/
│   │       └── base.service.ts        # Generic CRUD service
│   ├── interfaces/              # Type definitions & wrappers
│   │   ├── express.d.ts        # Express type extensions
│   │   └── wrapper/
│   │       └── ApiResponseWrapper.ts  # Standardized API response format
│   ├── middlewares/             # Express middlewares
│   │   ├── authMiddleware.ts    # JWT authentication
│   │   ├── roleMiddleware.ts    # Role-based authorization
│   │   ├── errorHandlers.ts     # Global error handler
│   │   ├── loggerMiddleware.ts  # Request logging
│   │   └── notFoundEndpointsHandlers.ts  # 404 handler
│   ├── modules/                 # Feature modules (domain-driven)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.model.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.model.ts
│   │   ├── roles/
│   │   │   ├── role.controller.ts
│   │   │   ├── role.routes.ts
│   │   │   └── role.model.ts
│   │   └── mail/
│   │   |   ├── mail.controller.ts
│   │   |   ├── mail.service.ts
│   │   |   └── mail.routes.ts
|   |   |
│   ├── routes/                  # Route aggregation
│   │   ├── index.routes.ts      # Main router
│   │   └── v1/                  # API versioning
│   │       ├── user.routes.ts
│   │       ├── roles.routes.ts
│   │       └── mail.routes.ts
│   ├── sockets/                 # WebSocket implementation
│   │   ├── index.ts             # Socket server initialization
│   │   ├── socketHandler.ts     # Connection handlers
│   │   └── clientManager.ts     # Client management
│   └── utils/                   # Utility functions
│       ├── dateFormarter.ts
│       ├── imageUtils.ts
│       └── logger.ts
└── package.json
```

#### Layering Pattern

**1. Controller Layer** (`*.controller.ts`)

- Responsibilities:
  - Handle HTTP requests/responses
  - Extract data from request (body, params, headers)
  - Call service layer
  - Format responses using `responseWrapper`
  - Handle HTTP status codes
- Pattern: Extends `GenericController` for CRUD operations
- Naming: `{module}Controller` class with static or instance methods

**2. Service Layer** (`*.service.ts`)

- Responsibilities:
  - Business logic implementation
  - Data validation
  - Database operations (via models)
  - Cross-module coordination
  - Password hashing, token generation
- Pattern: Extends `GenericService` for CRUD operations
- Naming: `{module}Service` class

**3. Model Layer** (`*.model.ts`)

- Responsibilities:
  - Mongoose schema definitions
  - TypeScript interfaces
  - Database relationships (populate)
- Pattern: Mongoose models with TypeScript interfaces
- Naming: `I{Entity}` interface, `{entity}Model` export

**4. Route Layer** (`*.route.ts` or `*.routes.ts`)

- Responsibilities:
  - Define HTTP endpoints
  - Apply middlewares (auth, role)
  - Map routes to controller methods
- Pattern: Express Router with middleware chains
- Naming: `{module}Routes` or `{module}Router`

#### Data Flow Between Layers

```
HTTP Request
    ↓
Route (with middlewares: auth, role)
    ↓
Controller (extracts data, validates input)
    ↓
Service (business logic, validation)
    ↓
Model (database operations)
    ↓
Service (processes result)
    ↓
Controller (formats response)
    ↓
HTTP Response (via responseWrapper)
```

#### Naming Conventions

- **Files**: kebab-case or camelCase (`user.controller.ts`, `authMiddleware.ts`)
- **Classes**: PascalCase (`AuthController`, `GenericService`)
- **Interfaces**: PascalCase with `I` prefix (`IUser`, `IRole`)
- **Variables/Functions**: camelCase (`getAllPopulated`, `accessToken`)
- **Constants**: UPPER_SNAKE_CASE (environment variables)
- **Routes**: Plural nouns (`/users`, `/roles`)

#### Authentication & Authorization Approach

**Authentication:**

- JWT-based authentication
- Access token in Authorization header: `Bearer {token}`
- Refresh token in HTTP-only cookie
- Token contains: `{ id, role }`
- Middleware: `authenticate()` verifies JWT and attaches user to request

**Authorization:**

- Role-based access control (RBAC)
- Roles stored in database (`roles` collection)
- User has `roleId` reference to role
- Middleware: `authorize(['Admin', 'Staff'])` checks role from token
- Applied at route level

**Token Management:**

- Access token: Short-lived (1h default)
- Refresh token: Long-lived (7d default), HTTP-only cookie
- Refresh endpoint: `/refresh` (no auth required, uses cookie)
- Logout: Clears refresh token cookie

#### Business Logic Separation

- **Service layer** contains all business rules
- **Controller layer** is thin (HTTP concerns only)
- **Generic base classes** handle common CRUD patterns
- **Custom methods** in service/controller for domain-specific logic
- **Cross-cutting concerns** (auth, logging, errors) in middlewares

#### Frontend-Backend Communication

- **Protocol**: HTTP/HTTPS REST API
- **Format**: JSON
- **Response Wrapper**: Standardized format
  ```typescript
  {
    status: "success" | "error",
    message: string,
    data: T,
    timestamp: string
  }
  ```
- **WebSocket**: Real-time features via SockJS (`/ws` prefix)
- **CORS**: Configured for specific origins (dev/prod)
- **Credentials**: Cookies enabled (`withCredentials: true`)

#### Reusable Architectural Ideas

1. **Generic Base Classes**: `GenericController` and `GenericService` for CRUD operations
2. **Module Pattern**: Each feature is self-contained (model, service, controller, routes)
3. **Middleware Chain**: Authentication → Authorization → Route Handler → Error Handler
4. **API Versioning**: Routes organized under `/v1/`
5. **Response Wrapper**: Consistent API response format
6. **Error Handling**: Centralized error handler middleware
7. **Logging**: Request logging middleware (Winston)
8. **Configuration**: Environment-based config (dev/prod)

#### Scalability & Maintainability Features

- **Separation of Concerns**: Clear layer boundaries
- **DRY Principle**: Generic base classes reduce duplication
- **Modularity**: Feature-based module organization
- **Type Safety**: TypeScript interfaces throughout
- **Error Handling**: Centralized error management
- **Logging**: Structured logging for debugging
- **Environment Config**: Easy deployment across environments

---

### FRONTEND ARCHITECTURE

#### Folder Structure

```
EzTro_Alpha/
├── App.tsx                      # Root component, providers setup
├── index.ts                     # Entry point
├── src/
│   ├── api/                     # API client functions
│   │   ├── MailAPI/
│   │   │   └── POST.tsx
│   │   └── user/
│   │       └── user.tsx
│   ├── components/              # Reusable UI components
│   │   └── AppButton.tsx
│   ├── config/                  # Configuration
│   │   ├── color.ts
│   │   ├── env.ts
│   │   └── font.ts
│   ├── constants/               # Constants
│   │   ├── misc.tsx
│   │   └── theme.ts
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx      # Auth state management
│   │   ├── SocketContext.tsx    # WebSocket connection
│   │   └── ThemeContext.tsx     # Theme management
│   ├── environments/            # Environment variables
│   │   └── env.ts
│   ├── features/                # Redux feature slices
│   │   ├── auth/
│   │   │   ├── authSlice.ts     # Auth state & async thunks
│   │   │   └── type.ts
│   │   └── todos/
│   │       ├── todosSlice.ts
│   │       └── types.ts
│   ├── navigation/              # Navigation setup
│   │   ├── index.tsx            # Navigation root
│   │   ├── AppNavigator.tsx     # Main navigator
│   │   ├── navigation.type.ts   # TypeScript navigation types
│   │   └── stack/
│   │       └── AuthStack.tsx    # Auth flow navigator
│   ├── screens/                 # Screen components
│   │   └── auth/
│   │       ├── WelcomeScreen.tsx
│   │       ├── LoginScreen.tsx
│   │       ├── RegisterScreen.tsx
│   │       ├── ForgotPasswordScreen.tsx
│   │       ├── OtpVerificationScreen.tsx
│   │       ├── CreateNewPasswordScreen.tsx
│   │       ├── ChangePasswordSuccessfulPage.tsx
│   │       └── CreateBoardingHouse.tsx
│   ├── service/                 # API service layer
│   │   └── apiService.tsx       # Axios instance & interceptors
│   ├── stores/                  # Redux store configuration
│   │   └── store.ts             # Store setup with persistence
│   ├── types/                   # TypeScript type definitions
│   │   ├── app.common.ts
│   │   ├── chats.ts
│   │   ├── messages.ts
│   │   ├── roles.ts
│   │   └── users.ts
│   └── utils/                   # Utility functions
│       └── validators.ts
└── package.json
```

#### Layering Pattern

**1. Screen Layer** (`screens/`)

- Responsibilities:
  - UI presentation
  - User interactions
  - Navigation calls
  - Form handling
- Pattern: React Native functional components
- Naming: `{Feature}{Screen}.tsx`

**2. Component Layer** (`components/`)

- Responsibilities:
  - Reusable UI components
  - Presentational components
- Pattern: Functional components with props
- Naming: `{ComponentName}.tsx`

**3. Feature/State Layer** (`features/`)

- Responsibilities:
  - Redux slices (state, reducers, async thunks)
  - Domain-specific state management
- Pattern: Redux Toolkit slices
- Naming: `{feature}Slice.ts`

**4. Service Layer** (`service/`)

- Responsibilities:
  - API client configuration
  - HTTP interceptors (token, refresh, errors)
  - Request/response transformation
- Pattern: Axios instance with interceptors
- Naming: `apiService.tsx`

**5. API Layer** (`api/`)

- Responsibilities:
  - API endpoint functions
  - Request/response typing
- Pattern: Functions calling `apiService`
- Naming: `{module}/{action}.tsx`

**6. Navigation Layer** (`navigation/`)

- Responsibilities:
  - Navigation structure
  - Screen routing
  - Type-safe navigation
- Pattern: React Navigation stacks
- Naming: `{Stack}Stack.tsx`

#### Data Flow

```
User Interaction (Screen)
    ↓
Dispatch Redux Action (Async Thunk)
    ↓
API Service (with interceptors)
    ↓
HTTP Request (with token)
    ↓
Backend API
    ↓
HTTP Response
    ↓
API Service (handle response/errors)
    ↓
Redux Reducer (update state)
    ↓
Screen Re-renders (via useSelector)
```

#### State Management

**Redux Toolkit:**

- Store: Configured with `configureStore`
- Slices: Feature-based slices (`authSlice`, `todosSlice`)
- Async Actions: `createAsyncThunk` for API calls
- Persistence: `redux-persist` with AsyncStorage
- Types: `RootState`, `AppDispatch` for type safety

**React Context:**

- `AuthContext`: Auth state synchronization
- `SocketContext`: WebSocket connection
- `ThemeContext`: Theme management

**AsyncStorage:**

- Stores: `accessToken`, `user` object
- Synced with Redux state
- Used for persistence across app restarts

#### Authentication Flow

1. **Login:**
   - User enters credentials → `loginAsync` thunk
   - API call → Backend `/login`
   - Receive `accessToken` and `user`
   - Store in AsyncStorage and Redux
   - Navigate to authenticated screens

2. **Token Refresh:**
   - Axios interceptor detects 401/403
   - Calls `/refresh` endpoint (uses HTTP-only cookie)
   - Updates access token in Redux and AsyncStorage
   - Retries original request

3. **Logout:**
   - `logoutAsync` thunk
   - Clears AsyncStorage
   - Clears Redux state
   - Calls backend `/logout` (clears cookie)

#### API Communication

**Axios Instance:**

- Base URL from environment
- Request interceptor: Adds `Authorization: Bearer {token}` header
- Response interceptor: Handles token refresh on 401/403
- Error interceptor: Standardized error handling
- `withCredentials: true` for cookies

**API Service Methods:**

- `get<T>(endpoint, params)`
- `post<T>(endpoint, data)`
- `put<T>(endpoint, data)`
- `delete<T>(endpoint)`
- Returns typed `ApiResponse<T>`

#### Naming Conventions

- **Files**: PascalCase (`LoginScreen.tsx`, `AuthContext.tsx`)
- **Components**: PascalCase (`AppButton`, `WelcomeScreen`)
- **Hooks**: camelCase with `use` prefix (`useAuth`)
- **Redux Slices**: camelCase (`authSlice`, `todosSlice`)
- **Types/Interfaces**: PascalCase with `I` prefix (`IUser`)
- **Constants**: UPPER_SNAKE_CASE or camelCase
- **Folders**: camelCase (`screens`, `features`)

#### Reusable Architectural Ideas

1. **Feature-Based Organization**: Screens, components, and state grouped by feature
2. **Redux Toolkit**: Modern Redux with slices and async thunks
3. **Type-Safe Navigation**: TypeScript types for navigation params
4. **API Interceptors**: Centralized token management and error handling
5. **Persistence**: Redux persist for state persistence
6. **Context for Cross-Cutting**: Auth, theme, socket contexts
7. **Environment Config**: Separate dev/prod configurations

#### Scalability & Maintainability Features

- **Separation of Concerns**: Clear layer boundaries (UI, state, API)
- **Type Safety**: TypeScript throughout
- **Reusable Components**: Component library approach
- **Centralized API**: Single API service instance
- **State Management**: Redux for complex state, Context for simple cross-cutting
- **Navigation Types**: Type-safe navigation prevents runtime errors
- **Error Handling**: Centralized error handling in interceptors

---

## =====================================

## PHASE 2 – DOMAIN ABSTRACTION

## =====================================

### Domain-Neutral Architecture

#### Abstracted Concepts

**Old Domain → Neutral Domain:**

- User/Landlord/Tenant → **Actor**
- Boarding House/Room → **Service**
- Booking/Reservation → **Order**
- Payment/Transaction → **Payment**
- Address/Location → **Location**
- Rating/Feedback → **Review**
- Chat/Message → **Communication**

#### Domain-Neutral Backend Architecture

**Core Modules:**

1. **Actor Module**
   - Responsibilities:
     - Actor registration, authentication
     - Profile management
     - Role assignment (Admin, Staff, User, Mechanic)
     - Account status management
   - Boundaries:
     - Does NOT handle business logic for orders/services
     - Does NOT manage payment processing

2. **Order Module**
   - Responsibilities:
     - Order creation and management
     - Order status tracking
     - Order history
   - Boundaries:
     - Does NOT handle payment processing
     - Does NOT manage service details

3. **Service Module**
   - Responsibilities:
     - Service catalog management
     - Service availability
     - Service details and pricing
   - Boundaries:
     - Does NOT handle order creation
     - Does NOT manage actor profiles

4. **Payment Module**
   - Responsibilities:
     - Payment processing
     - Payment status tracking
     - Payment history
   - Boundaries:
     - Does NOT handle order creation
     - Does NOT manage service details

5. **Location Module**
   - Responsibilities:
     - Location data management
     - Address validation
     - Geographic information
   - Boundaries:
     - Does NOT handle order processing
     - Does NOT manage actor profiles

6. **Review Module**
   - Responsibilities:
     - Review creation and management
     - Rating aggregation
     - Review moderation
   - Boundaries:
     - Does NOT handle order creation
     - Does NOT manage service details

7. **Communication Module**
   - Responsibilities:
     - Real-time messaging
     - Notification management
     - Communication history
   - Boundaries:
     - Does NOT handle order processing
     - Does NOT manage payment processing

#### Domain-Neutral Frontend Architecture

**Core Features:**

1. **Actor Feature**
   - Screens: Login, Register, Profile, Settings
   - State: Authentication, profile data
   - Boundaries: UI for actor management only

2. **Order Feature**
   - Screens: Order List, Order Details, Create Order
   - State: Order list, current order
   - Boundaries: UI for order management only

3. **Service Feature**
   - Screens: Service List, Service Details, Service Search
   - State: Service catalog, filters
   - Boundaries: UI for service browsing only

4. **Payment Feature**
   - Screens: Payment Methods, Payment History, Payment Processing
   - State: Payment methods, payment history
   - Boundaries: UI for payment management only

5. **Location Feature**
   - Screens: Location Selection, Address Management
   - State: Selected location, address list
   - Boundaries: UI for location management only

6. **Review Feature**
   - Screens: Review List, Create Review, Review Details
   - State: Reviews, ratings
   - Boundaries: UI for review management only

7. **Communication Feature**
   - Screens: Chat List, Chat Screen, Notifications
   - State: Messages, notifications
   - Boundaries: UI for communication only

---

## ====================================

## PHASE 2.5 – DOMAIN MODEL SPECIFICATION

## =====================================

🎯 Objective

Define a clear Domain Data Contract

Serve as the foundation for:

Backend Models (MongoDB / Mongoose)

API Request & Response structures

Frontend Type definitions

Ensure the design is:

Clear

Scalable

Production-ready

Free from over-engineering

1️⃣ ACTOR

Collection: actors
Description: Represents all system users (Admin, Staff, User, Mechanic)

Attributes

id

email (unique)

passwordHash

fullName

phoneNumber

role → ADMIN | STAFF | USER | MECHANIC

status → ACTIVE | INACTIVE | SUSPENDED

avatarUrl

createdAt

updatedAt

Notes

One Actor may participate in multiple Orders

Roles are stored directly for simplicity (no separate role table)

2️⃣ SERVICE

Collection: services
Description: Services offered by the system

Attributes

id

name

description

basePrice

estimatedDuration (minutes)

isActive

createdBy → Actor

createdAt

updatedAt

Notes

Used for service browsing before placing an order

Forms the basis for preliminary price calculation

3️⃣ ORDER

Collection: orders
Description: A service request initiated by a User

Attributes

id

customerId → Actor (USER)

serviceId → Service

assignedMechanicId → Actor (MECHANIC, optional)

assignedStaffId → Actor (STAFF, optional)

status

CREATED

CONFIRMED

MECHANIC_ASSIGNED

IN_PROGRESS

COMPLETED

CANCELLED

estimatedPrice

voucherId → Voucher (optional)

voucherDiscount (number, default: 0)

finalPrice (estimatedPrice - voucherDiscount)

locationId → Location

createdAt

updatedAt

Notes

Order is the core entity of the system

Payments, reviews, and communications are all tied to an Order

Voucher application is optional and only affects finalPrice

4️⃣ LOCATION

Collection: locations
Description: Geographic data used for tracking and mechanic matching

Attributes

id

actorId → Actor

addressText

latitude

longitude

isDefault

createdAt

Notes

Integrated with Google Maps APIs

One Actor may have multiple saved Locations

5️⃣ PAYMENT

Collection: payments
Description: Payment transactions associated with Orders

Attributes

id

orderId → Order

payerId → Actor

amount

method → CASH | E_WALLET | BANK_TRANSFER

status → PENDING | SUCCESS | FAILED

transactionRef

createdAt

Notes

Each Order has at most one successful payment

transactionRef is used for reconciliation and tracking

6️⃣ REVIEW

Collection: reviews
Description: Post-service feedback and ratings

Attributes

id

orderId → Order

reviewerId → Actor

targetActorId → Actor (MECHANIC)

rating (1–5)

comment

status → PENDING | APPROVED | REJECTED

createdAt

Notes

Reviews are created only when Order status is COMPLETED

Used to calculate mechanic performance scores

Moderation updates the status field

7️⃣ COMMUNICATION (CHAT / CALL)

Collection: messages
Description: Messages exchanged between Actors related to an Order

Attributes

id

orderId → Order

senderId → Actor

receiverId → Actor

content

type → TEXT | IMAGE | SYSTEM

createdAt

readAt

Notes

Can be extended with WebSocket for real-time chat

Call logs may be stored in a separate collection if needed

8️⃣ VOUCHER

Collection: vouchers
Description: Discount codes applied to Orders

Attributes

id

code (unique)

discountType → PERCENTAGE | FIXED_AMOUNT

discountValue

startDate

endDate

isActive

usageLimit (optional, total uses)

usageCount

createdBy → Actor (ADMIN | STAFF)

createdAt

updatedAt

Notes

Voucher is optional and can be applied only when creating an Order

Expired or inactive vouchers cannot be applied

Usage is limited by usageLimit and tracked in usageCount

## =====================================

## PHASE 3 – NEW PROJECT DESIGN

## =====================================

### Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: React Native (Expo)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access + refresh tokens)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API Communication**: Axios

### Backend Folder Structure

exe201/backend/
├── server.ts # Entry point
├── package.json
├── tsconfig.json
├── .env # Environment variables
├── src/
│ ├── config/
│ │ ├── database.ts # MongoDB connection
│ │ ├── jwt.ts # JWT configuration
│ │ └── environment.ts # Environment config
│ ├── core/
│ │ ├── controllers/
│ │ │ └── base.controller.ts # Generic CRUD controller
│ │ └── services/
│ │ └── base.service.ts # Generic CRUD service
│ ├── interfaces/
│ │ ├── express.d.ts # Express type extensions
│ │ └── api-response.ts # Standardized API response
│ ├── middlewares/
│ │ ├── auth.middleware.ts # JWT authentication
│ │ ├── role.middleware.ts # Role-based authorization
│ │ ├── error.middleware.ts # Global error handler
│ │ ├── logger.middleware.ts # Request logging
│ │ └── validator.middleware.ts # Request validation
│ ├── modules/
│ │ ├── actor/
│ │ │ ├── actor.controller.ts
│ │ │ ├── actor.service.ts
│ │ │ ├── actor.model.ts
│ │ │ └── actor.routes.ts
│ │ ├── order/
│ │ │ ├── order.controller.ts
│ │ │ ├── order.service.ts
│ │ │ ├── order.model.ts
│ │ │ └── order.routes.ts
│ │ ├── service/
│ │ │ ├── service.controller.ts
│ │ │ ├── service.service.ts
│ │ │ ├── service.model.ts
│ │ │ └── service.routes.ts
│ │ ├── payment/
│ │ │ ├── payment.controller.ts
│ │ │ ├── payment.service.ts
│ │ │ ├── payment.model.ts
│ │ │ └── payment.routes.ts
│ │ ├── location/
│ │ │ ├── location.controller.ts
│ │ │ ├── location.service.ts
│ │ │ ├── location.model.ts
│ │ │ └── location.routes.ts
│ │ ├── review/
│ │ │ ├── review.controller.ts
│ │ │ ├── review.service.ts
│ │ │ ├── review.model.ts
│ │ │ └── review.routes.ts
│ │ ├── communication/
│ │ │ ├── communication.controller.ts
│ │ │ ├── communication.service.ts
│ │ │ ├── communication.model.ts
│ │ │ └── communication.routes.ts
│ │ └── auth/
│ │ | ├── auth.controller.ts
│ │ | ├── auth.service.ts
│ │ | └── auth.routes.ts
│ │ └── mail/
│ │ | ├── mail.controller.ts
│ │ | ├── mail.service.ts
│ │ | └── mail.routes.ts
│ │ └── voucher/
| | |
│ │ | ├── voucher.controller.ts
│ │ | ├── voucher.service.ts
│ │ | └── voucher.routes.ts
| | | └── voucher.routes.ts
│ ├── routes/
│ │ ├── index.routes.ts # Main router
│ │ └── v1/
│ │ ├── actor.routes.ts
│ │ ├── order.routes.ts
│ │ ├── service.routes.ts
│ │ ├── payment.routes.ts
│ │ ├── location.routes.ts
│ │ ├── review.routes.ts
│ │ └── communication.routes.ts
│ ├── sockets/
│ │ ├── index.ts # Socket server setup
│ │ ├── socket.handler.ts # Connection handlers
│ │ └── client.manager.ts # Client management
│ └── utils/
│ ├── logger.ts # Winston logger
│ ├── image.util.ts # Image processing
│ ├── date.util.ts # Date formatting
│ └── validation.util.ts # Validation helpers

```

### Backend Module Responsibilities

**config/**

- **database.ts**: MongoDB connection setup, connection pooling
- **jwt.ts**: JWT secret, expiration times
- **environment.ts**: Environment variable validation

**core/**

- **base.controller.ts**: Generic CRUD operations (create, getAll, getById, update, delete)
- **base.service.ts**: Generic database operations

**interfaces/**

- **express.d.ts**: Extend Express Request with user property
- **api-response.ts**: Standardized response wrapper function

**middlewares/**

- **auth.middleware.ts**: Verify JWT, attach user to request
- **role.middleware.ts**: Check user role against allowed roles
- **error.middleware.ts**: Catch all errors, format error responses
- **logger.middleware.ts**: Log HTTP requests (method, path, status, time)
- **validator.middleware.ts**: Validate request body/params using schemas

**modules/{module}/**

- **{module}.controller.ts**: HTTP request/response handling, call service
- **{module}.service.ts**: Business logic, database operations
- **{module}.model.ts**: Mongoose schema, TypeScript interface
- **{module}.routes.ts**: Route definitions with middleware chains

**Current implementation status (alignment note):**

- Actor, Service, Order, Payment, Review: model + service + controller implemented
- Location, Communication: model only (service/controller/routes missing)
- Voucher: not implemented (requires full module)

**routes/**

- **index.routes.ts**: Aggregate all route modules
- **v1/**: Versioned API routes

**sockets/**

- **index.ts**: Initialize WebSocket server
- **socket.handler.ts**: Handle socket connections, events
- **client.manager.ts**: Manage connected clients, rooms

**utils/**

- **logger.ts**: Winston logger configuration
- **image.util.ts**: Image upload, resizing (Cloudinary)
- **date.util.ts**: Date formatting utilities
- **validation.util.ts**: Reusable validation functions

### Frontend Folder Structure

```

exe201/frontend/
├── App.tsx # Root component
├── index.ts # Entry point
├── app.json # Expo configuration
├── package.json
├── tsconfig.json
├── .env # Environment variables
├── src/
│ ├── api/
│ │ ├── actor.api.ts
│ │ ├── order.api.ts
│ │ ├── service.api.ts
│ │ ├── payment.api.ts
│ │ ├── location.api.ts
│ │ ├── review.api.ts
│ │ └── communication.api.ts
│ ├── components/
│ │ ├── common/ # Shared components
│ │ │ ├── Button.tsx
│ │ │ ├── Input.tsx
│ │ │ ├── Card.tsx
│ │ │ └── Loading.tsx
│ │ └── layout/ # Layout components
│ │ ├── Header.tsx
│ │ └── TabBar.tsx
│ ├── config/
│ │ ├── colors.ts # Color palette
│ │ ├── fonts.ts # Font configuration
│ │ ├── theme.ts # Theme configuration
│ │ └── env.ts # Environment variables
│ ├── constants/
│ │ ├── routes.ts # Route names
│ │ └── messages.ts # Error/success messages
│ ├── context/
│ │ ├── AuthContext.tsx # Auth state sync
│ │ ├── SocketContext.tsx # WebSocket connection
│ │ └── ThemeContext.tsx # Theme management
│ ├── features/
│ │ ├── actor/
│ │ │ ├── actor.slice.ts # Redux slice
│ │ │ └── actor.types.ts # TypeScript types
│ │ ├── order/
│ │ │ ├── order.slice.ts
│ │ │ └── order.types.ts
│ │ ├── service/
│ │ │ ├── service.slice.ts
│ │ │ └── service.types.ts
│ │ ├── payment/
│ │ │ ├── payment.slice.ts
│ │ │ └── payment.types.ts
│ │ ├── location/
│ │ │ ├── location.slice.ts
│ │ │ └── location.types.ts
│ │ ├── review/
│ │ │ ├── review.slice.ts
│ │ │ └── review.types.ts
│ │ ├── communication/
│ │ │ ├── communication.slice.ts
│ │ │ └── communication.types.ts
│ │ └── auth/
│ │ ├── auth.slice.ts
│ │ └── auth.types.ts
│ ├── navigation/
│ │ ├── index.tsx # Navigation root
│ │ ├── AppNavigator.tsx # Main navigator
│ │ ├── navigation.types.ts # Navigation type definitions
│ │ ├── stacks/
│ │ │ ├── AuthStack.tsx # Authentication flow
│ │ │ ├── MainStack.tsx # Main app flow
│ │ │ └── TabStack.tsx # Bottom tab navigator
│ │ └── guards/
│ │ └── AuthGuard.tsx # Protected route wrapper
│ ├── screens/
│ │ ├── auth/
│ │ │ ├── LoginScreen.tsx
│ │ │ ├── RegisterScreen.tsx
│ │ │ └── ForgotPasswordScreen.tsx
│ │ ├── actor/
│ │ │ ├── ProfileScreen.tsx
│ │ │ └── SettingsScreen.tsx
│ │ ├── order/
│ │ │ ├── OrderListScreen.tsx
│ │ │ ├── OrderDetailScreen.tsx
│ │ │ └── CreateOrderScreen.tsx
│ │ ├── service/
│ │ │ ├── ServiceListScreen.tsx
│ │ │ ├── ServiceDetailScreen.tsx
│ │ │ └── ServiceSearchScreen.tsx
│ │ ├── payment/
│ │ │ ├── PaymentMethodsScreen.tsx
│ │ │ ├── PaymentHistoryScreen.tsx
│ │ │ └── PaymentProcessScreen.tsx
│ │ ├── location/
│ │ │ ├── LocationSelectScreen.tsx
│ │ │ └── AddressManageScreen.tsx
│ │ ├── review/
│ │ │ ├── ReviewListScreen.tsx
│ │ │ ├── CreateReviewScreen.tsx
│ │ │ └── ReviewDetailScreen.tsx
│ │ └── communication/
│ │ ├── ChatListScreen.tsx
│ │ ├── ChatScreen.tsx
│ │ └── NotificationsScreen.tsx
│ ├── services/
│ │ ├── api.service.ts # Axios instance & interceptors
│ │ └── storage.service.ts # AsyncStorage wrapper
│ ├── types/
│ │ ├── actor.types.ts
│ │ ├── order.types.ts
│ │ ├── service.types.ts
│ │ ├── payment.types.ts
│ │ ├── location.types.ts
│ │ ├── review.types.ts
│ │ ├── communication.types.ts
│ │ └── common.types.ts # Shared types
│ └── utils/
│ ├── validators.ts # Form validation
│ ├── formatters.ts # Data formatting
│ └── helpers.ts # Utility functions

```

### Frontend Module Responsibilities

**api/**

- **{module}.api.ts**: API endpoint functions, typed requests/responses
- Boundaries: Only HTTP calls, no business logic

**components/**

- **common/**: Reusable UI components (Button, Input, Card, Loading)
- **layout/**: Layout components (Header, TabBar)
- Boundaries: Presentational only, no business logic

**config/**

- **colors.ts**: Color palette constants
- **fonts.ts**: Font family and sizes
- **theme.ts**: Theme configuration (light/dark)
- **env.ts**: Environment variable access
- Boundaries: Configuration only, no logic

**constants/**

- **routes.ts**: Navigation route name constants
- **messages.ts**: User-facing messages
- Boundaries: Constants only, no logic

**context/**

- **AuthContext.tsx**: Sync auth state between Redux and storage
- **SocketContext.tsx**: WebSocket connection management
- **ThemeContext.tsx**: Theme state management
- Boundaries: Cross-cutting concerns only

**features/{feature}/**

- **{feature}.slice.ts**: Redux slice (state, reducers, async thunks)
- **{feature}.types.ts**: TypeScript types for the feature
- Boundaries: Feature-specific state only

**navigation/**

- **index.tsx**: Navigation root setup
- **AppNavigator.tsx**: Main navigation structure
- **navigation.types.ts**: TypeScript types for navigation
- **stacks/**: Stack navigators (Auth, Main, Tab)
- **guards/**: Route protection (AuthGuard)
- Boundaries: Navigation structure only, no business logic

**screens/{feature}/**

- **{Feature}Screen.tsx**: Screen components, UI and user interactions
- Boundaries: UI presentation only, delegates to Redux/API

**services/**

- **api.service.ts**: Axios instance, interceptors, HTTP methods
- **storage.service.ts**: AsyncStorage wrapper functions
- Boundaries: Infrastructure only, no business logic

**types/**

- **{module}.types.ts**: TypeScript interfaces and types
- **common.types.ts**: Shared types across modules
- Boundaries: Type definitions only

**utils/**

- **validators.ts**: Form validation functions
- **formatters.ts**: Data formatting (dates, currency, etc.)
- **helpers.ts**: General utility functions
- Boundaries: Pure functions only, no side effects

---

## =====================================

## PHASE 4 – USE CASE IMPLEMENTATION MAP

## =====================================

### Admin Role

#### Use Cases:

1. **View All Actors**
   - Backend: `actor.controller.getAll()`, `actor.service.getAll()`
   - Frontend: `screens/actor/ActorListScreen.tsx`
   - Database: `actors` collection

2. **Manage Actor Status** (Lock/Unlock)
   - Backend: `actor.controller.lockAccount()`, `actor.controller.unlockAccount()`
   - Frontend: `screens/actor/ActorManagementScreen.tsx`
   - Database: `actors` collection (update `statusActive`)

3. **View All Orders**
   - Backend: `order.controller.getAll()`, `order.service.getAll()`
   - Frontend: `screens/order/OrderListScreen.tsx`
   - Database: `orders` collection

4. **View System Statistics**
   - Backend: `actor.controller.getStatistics()`, `order.controller.getStatistics()`
   - Frontend: `screens/admin/DashboardScreen.tsx`
   - Database: `actors`, `orders`, `services`, `payments` collections

5. **Manage Services** (Approve/Reject)
   - Backend: `service.controller.approve()`, `service.controller.reject()`
   - Frontend: `screens/service/ServiceManagementScreen.tsx`
   - Database: `services` collection (update `status`)

6. **View All Payments**
   - Backend: `payment.controller.getAll()`, `payment.service.getAll()`
   - Frontend: `screens/payment/PaymentListScreen.tsx`
   - Database: `payments` collection

7. **Moderate Reviews**
   - Backend: `review.controller.moderate()`, `review.service.moderate()`
   - Frontend: `screens/review/ReviewModerationScreen.tsx`
   - Database: `reviews` collection (update `status`)

8. **Manage Vouchers (Create)**
   - Backend: `voucher.controller.create()`, `voucher.service.create()`
   - Frontend: `screens/voucher/VoucherCreateScreen.tsx`
   - Database: `vouchers` collection (create new)
   - Authorization: Admin/Staff only

9. **Manage Vouchers (Update)**
   - Backend: `voucher.controller.update()`, `voucher.service.update()`
   - Frontend: `screens/voucher/VoucherManagementScreen.tsx`
   - Database: `vouchers` collection (update)
   - Authorization: Admin/Staff only

10. **Manage Vouchers (Delete)**
    - Backend: `voucher.controller.delete()`, `voucher.service.delete()`
    - Frontend: `screens/voucher/VoucherManagementScreen.tsx`
    - Database: `vouchers` collection (delete)
    - Authorization: Admin/Staff only

11. **Enable / Disable Vouchers**
    - Backend: `voucher.controller.activate()`, `voucher.controller.deactivate()`
    - Frontend: `screens/voucher/VoucherManagementScreen.tsx`
    - Database: `vouchers` collection (update `isActive`)
    - Authorization: Admin/Staff only

12. **View All Vouchers**
    - Backend: `voucher.controller.getAll()`, `voucher.service.getAll()`
    - Frontend: `screens/voucher/VoucherListScreen.tsx`
    - Database: `vouchers` collection
    - Authorization: Admin/Staff only

### Staff Role

#### Use Cases:

1. **View Assigned Orders**
   - Backend: `order.controller.getByStaff()`, `order.service.getByStaffId()`
   - Frontend: `screens/order/OrderListScreen.tsx` (filtered)
   - Database: `orders` collection (filter by `assignedStaffId`)

2. **Update Order Status**
   - Backend: `order.controller.updateStatus()`, `order.service.updateStatus()`
   - Frontend: `screens/order/OrderDetailScreen.tsx`
   - Database: `orders` collection (update `status`)

3. **View Service Details**
   - Backend: `service.controller.getById()`, `service.service.getById()`
   - Frontend: `screens/service/ServiceDetailScreen.tsx`
   - Database: `services` collection

4. **Communicate with Actors**
   - Backend: `communication.controller.sendMessage()`, `communication.service.createMessage()`
   - Frontend: `screens/communication/ChatScreen.tsx`
   - Database: `messages` collection

5. **View Payment Details**
   - Backend: `payment.controller.getById()`, `payment.service.getById()`
   - Frontend: `screens/payment/PaymentDetailScreen.tsx`
   - Database: `payments` collection

### User Role

#### Use Cases:

1. **Register Account**
   - Backend: `auth.controller.register()`, `actor.controller.createAccount()`
   - Frontend: `screens/auth/RegisterScreen.tsx`
   - Database: `actors` collection (create new)

2. **Login**
   - Backend: `auth.controller.login()`, `auth.service.login()`
   - Frontend: `screens/auth/LoginScreen.tsx`
   - Database: `actors` collection (verify credentials)

3. **Forgot Password**
   - Backend: `auth.controller.forgotPassword()`, `auth.service.forgotPassword()`
   - Frontend: `screens/auth/ForgotPasswordScreen.tsx`
   - Database: `actors` collection (find by email, generate OTP code)
   - Flow: Send OTP code via email (if mail module implemented)
   - Response: Returns success message (OTP sent to email)

4. **Verify OTP**
   - Backend: `auth.controller.verifyOtp()`, `auth.service.verifyOtp()`
   - Frontend: `screens/auth/OtpVerificationScreen.tsx`
   - Database: `actors` collection (verify OTP code, generate reset token)
   - Flow: User provides email and OTP code received from email
   - Response: Returns reset token (used in Reset Password step)

5. **Reset Password**
   - Backend: `auth.controller.resetPassword()`, `auth.service.resetPassword()`
   - Frontend: `screens/auth/ResetPasswordScreen.tsx`
   - Database: `actors` collection (verify reset token, update password)
   - Flow: User provides reset token (from OTP verification) and new password

6. **Change Password**
   - Backend: `auth.controller.changePassword()`, `auth.service.changePassword()`
   - Frontend: `screens/auth/ChangePasswordScreen.tsx` or `screens/user/ProfileScreen.tsx`
   - Database: `actors` collection (verify current password, update password)
   - Authorization: Authenticated user only
   - Flow: User provides current password and new password

7. **Browse Services**
   - Backend: `service.controller.getAll()`, `service.service.getAll()`
   - Frontend: `screens/service/ServiceListScreen.tsx`
   - Database: `services` collection

4. **View Service Details**
   - Backend: `service.controller.getById()`, `service.service.getById()`
   - Frontend: `screens/service/ServiceDetailScreen.tsx`
   - Database: `services` collection

5. **Create Order**
   - Backend: `order.controller.create()`, `order.service.create()`
   - Frontend: `screens/order/CreateOrderScreen.tsx`
   - Database: `orders` collection (create new)
   - Optional: apply voucher during creation (see voucher use case)

8. **View My Orders**
   - Backend: `order.controller.getByActor()`, `order.service.getByActorId()`
   - Frontend: `screens/order/OrderListScreen.tsx` (filtered)
   - Database: `orders` collection (filter by `actorId`)

9. **View Order Details**
   - Backend: `order.controller.getById()`, `order.service.getById()`
   - Frontend: `screens/order/OrderDetailScreen.tsx`
   - Database: `orders` collection

10. **Make Payment**
   - Backend: `payment.controller.create()`, `payment.service.processPayment()`
   - Frontend: `screens/payment/PaymentProcessScreen.tsx`
   - Database: `payments` collection (create new), `orders` collection (update `paymentStatus`)

11. **View Payment History**
   - Backend: `payment.controller.getByActor()`, `payment.service.getByActorId()`
   - Frontend: `screens/payment/PaymentHistoryScreen.tsx`
   - Database: `payments` collection (filter by `actorId`)

12. **Create Review**
    - Backend: `review.controller.create()`, `review.service.create()`
    - Frontend: `screens/review/CreateReviewScreen.tsx`
    - Database: `reviews` collection (create new)

11. **View Reviews**
    - Backend: `review.controller.getByService()`, `review.service.getByServiceId()`
    - Frontend: `screens/review/ReviewListScreen.tsx`
    - Database: `reviews` collection (filter by `serviceId`)

14. **Manage Profile**
    - Backend: `actor.controller.updateProfile()`, `actor.service.updateProfile()`
    - Frontend: `screens/actor/ProfileScreen.tsx`
    - Database: `actors` collection (update profile fields)

15. **Manage Addresses**
    - Backend: `location.controller.create()`, `location.controller.getAll()`
    - Frontend: `screens/location/AddressManageScreen.tsx`
    - Database: `locations` collection

16. **View Available Vouchers**
    - Backend: `voucher.controller.getAvailable()`, `voucher.service.getAvailableForUser()`
    - Frontend: `screens/voucher/AvailableVouchersScreen.tsx`
    - Database: `vouchers` collection (filter active + valid + within usage limits)

17. **Validate Voucher**
    - Backend: `voucher.controller.validate()`, `voucher.service.validateVoucher()`
    - Frontend: `screens/order/CreateOrderScreen.tsx` (inline voucher validation)
    - Database: `vouchers` collection

18. **Apply Voucher to Order**
    - Backend: `order.controller.create()`, `order.service.create()`
    - Frontend: `screens/order/CreateOrderScreen.tsx`
    - Database: `orders` (voucherId, voucherDiscount, finalPrice), `vouchers` (usageCount)

19. **Chat with Staff**
    - Backend: `communication.controller.sendMessage()`, `communication.service.createMessage()`
    - Frontend: `screens/communication/ChatScreen.tsx`
    - Database: `messages` collection

### Mechanic Role

#### Use Cases:

1. **View Assigned Orders**
   - Backend: `order.controller.getByMechanic()`, `order.service.getByMechanicId()`
   - Frontend: `screens/order/OrderListScreen.tsx` (filtered)
   - Database: `orders` collection (filter by `assignedMechanicId`)

2. **Update Order Status** (In Progress, Completed)
   - Backend: `order.controller.updateStatus()`, `order.service.updateStatus()`
   - Frontend: `screens/order/OrderDetailScreen.tsx`
   - Database: `orders` collection (update `status`)

3. **View Service Details**
   - Backend: `service.controller.getById()`, `service.service.getById()`
   - Frontend: `screens/service/ServiceDetailScreen.tsx`
   - Database: `services` collection

4. **Communicate with User**
   - Backend: `communication.controller.sendMessage()`, `communication.service.createMessage()`
   - Frontend: `screens/communication/ChatScreen.tsx`
   - Database: `messages` collection

5. **View Payment Details**
   - Backend: `payment.controller.getById()`, `payment.service.getById()`
   - Frontend: `screens/payment/PaymentDetailScreen.tsx`
   - Database: `payments` collection

6. **Update Profile**
   - Backend: `actor.controller.updateProfile()`, `actor.service.updateProfile()`
   - Frontend: `screens/actor/ProfileScreen.tsx`
   - Database: `actors` collection

7. **Change Password**
   - Backend: `auth.controller.changePassword()`, `auth.service.changePassword()`
   - Frontend: `screens/auth/ChangePasswordScreen.tsx` or `screens/actor/ProfileScreen.tsx`
   - Database: `actors` collection (verify current password, update password)
   - Authorization: Authenticated user only

---

## =====================================

## PHASE 5 – BUILDING GUIDELINES

## =====================================

### Step-by-Step Implementation Roadmap
#### PHASE 1: Infrastructure Completion (Priority First)

**Backend (blocking items):**

1. Create missing infrastructure folders: `config/`, `middlewares/`, `routes/`, `utils/`
2. Add `server.ts` entry point and bootstrap flow
3. Implement centralized routing (versioned routes + module routes)
4. Implement authentication + role middleware (required for all protected endpoints)
5. Implement shared response wrapper (`interfaces/api-response.ts`)

**Frontend (parallel):**

1. Ensure API service layer and navigation scaffolding exist

#### PHASE 2: Complete Core Domain Modules

**Backend:**

1. Finish missing layers for Location and Communication modules
2. Ensure all modules have: model, service, controller, routes

#### PHASE 3: Voucher Module

**Backend:**

1. Add Voucher module (model/service/controller/routes)
2. Support Admin/Staff CRUD + enable/disable + list
3. Support User: view available + validate voucher

#### PHASE 4: Order–Voucher Integration

**Backend:**

1. Update Order model with voucher reference + discount fields
2. Apply voucher validation during order creation
3. Ensure finalPrice is computed from voucherDiscount

#### PHASE 5: Route Hardening & Role Enforcement

**Backend:**

1. Apply auth + role middleware consistently
2. Ensure Admin/Staff voucher routes are protected
3. Ensure Users can only apply vouchers during order creation

#### PHASE 6: Frontend Readiness

1. Confirm endpoints and use cases align with frontend screens
2. Validate response wrapper consistency
3. Ensure versioned route paths are stable for API clients

### Best Practices for Keeping System Clean

1. **Follow Layer Boundaries:**
   - Controllers: HTTP only, no business logic
   - Services: Business logic only, no HTTP concerns
   - Models: Data structure only, no business logic

2. **Use Generic Base Classes:**
   - Extend `GenericController` and `GenericService` for CRUD
   - Add custom methods only when needed

3. **Consistent Naming:**
   - Follow established conventions
   - Use descriptive names

4. **Type Safety:**
   - Use TypeScript interfaces everywhere
   - Avoid `any` type

5. **Error Handling:**
   - Use centralized error handler
   - Return consistent error format

6. **Code Organization:**
   - One feature per module
   - Keep files focused (single responsibility)

7. **Documentation:**
   - Comment complex logic
   - Document API endpoints

8. **Testing:**
   - Test each module independently
   - Test integration between modules

9. **Version Control:**
   - Commit frequently
   - Use meaningful commit messages

10. **Environment Management:**
    - Use `.env` files
    - Never commit secrets

---

## END OF DOCUMENT
```
