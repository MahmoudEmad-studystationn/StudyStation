# 📚 StudyStation — Complete Project Documentation

> **Repository**: `MahmoudEmad-studystationn/StudyStation`
> **Generated**: May 9, 2026
> **Stack**: ASP.NET Core 9 (Backend) + React 18 / Vite (Frontend)

---

## 1. Project Overview

**StudyStation** is a full-stack educational platform that helps students collaborate, share resources, manage study sessions, and engage through a community feed. It features real-time communication via SignalR, JWT-based authentication with OTP email verification, a resource library, study rooms, user profiles with dashboards, and an admin panel.

---

## 2. Architecture & Tech Stack

### Backend (`BackEnd/StudyStation.API/`)
| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 9 (.NET 9) |
| Pattern | **CQRS + MediatR** (Feature-based folder structure) |
| Database | SQL Server (hosted on `databaseasp.net`) |
| ORM | Entity Framework Core 9 (Code-First migrations) |
| Auth | ASP.NET Identity + JWT Bearer Tokens |
| Real-Time | SignalR (StudyHub, NotificationHub) |
| Validation | FluentValidation 11 |
| API Docs | OpenAPI + Scalar UI (`/scalar/v1`) |
| Email | SMTP via Gmail (`studystation835@gmail.com`) |

### Frontend (`FrontEnd/study-station/`)
| Layer | Technology |
|---|---|
| Framework | React 18.3 + Vite 7 |
| Styling | TailwindCSS 3 + Bootstrap 5 + MUI 7 |
| HTTP Client | Axios |
| Routing | React Router DOM 7 |
| Forms | React Hook Form + Zod validation |
| Notifications | React Toastify |
| Icons | FontAwesome 7 + MUI Icons |

### Deployment
- **Backend**: `https://study-station.runasp.net`
- **Frontend**: `https://study-station-alpha.vercel.app`

---

## 3. Project Structure

```
StudyStation/
├── .github/workflows/          # CI/CD (empty)
├── .gitignore
├── README.md
├── BackEnd/
│   └── StudyStation.API/
│       ├── StudyStation.API.sln
│       └── StudyStation.API/
│           ├── Program.cs              # App entry, DI, middleware
│           ├── appsettings.json        # Config (DB, JWT, Email)
│           ├── Controllers/            # API Controllers
│           ├── Data/                   # DatabaseContext (EF Core)
│           ├── Features/               # CQRS feature modules
│           │   ├── Admin/
│           │   ├── Comments/
│           │   ├── Library/
│           │   ├── Posts/
│           │   ├── Profile/
│           │   ├── Reactions/
│           │   ├── StudyWithFriends/
│           │   └── Users/
│           ├── Hubs/                   # SignalR hubs
│           ├── Migrations/             # EF Core migrations
│           ├── Models/                 # Core domain models
│           └── Services/              # Shared services (JWT, Email)
└── FrontEnd/
    └── study-station/
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx                # Routes
            ├── Components/
            │   ├── Auth/              # Login, SignUp, ForgotPassword, ResetPassword
            │   ├── Home/              # Home page
            │   ├── Schema/            # Zod validation schemas
            │   ├── Services/          # API service layer (authServices.js)
            │   └── WelcomePage/
            └── Pages/                 # LoadingScreen, WelcomePage
```

---

## 4. Database Schema

### Core Models (`Models/`)

#### `ApplicationUser` (extends `IdentityUser<int>`)
| Property | Type | Notes |
|---|---|---|
| FirstName | string (max 50) | Required |
| LastName | string (max 50) | Required |
| DateOfBirth | DateTime | Required |
| Gender | string | |
| CreatedOn | DateTime | Default: UTC now |
| OtpCodeHash | string? | OTP for verification |
| OtpExpiryDate | DateTime? | OTP expiry |
| EmailVerificationCode | string? | Email verification OTP |
| EmailVerificationCodeExpiry | DateTime? | Code expiry |
| Track | string | Academic track |
| AcademicYear | string (max 50) | |
| CurrentStreak | int | Study streak counter |
| DailyGoalHours | decimal | Daily study goal |

**Navigation Properties**: Posts, Comments, Reactions, RefreshTokens, OwnedStudyRooms, RoomParticipations, ProfileStudyTasks, StudySessions, ActivityLogs, SavedItems

#### `Post`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| Title | string | |
| Content | string | |
| ImageUrl | string? | Optional image |
| ParentPostId | int? | For shared/reposted posts |
| UserId | int (FK) | Post author |
| CreatedAt / UpdatedAt | DateTime | |

**Navigation**: User, Comments, Reactions, ParentPost

#### `Comment`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| Content | string | |
| PostId | int (FK) | |
| UserId | int (FK) | |
| ParentCommentId | int? | Nested/threaded comments |
| CreatedAt | DateTime | |

**Navigation**: Post, User, ParentComment, Replies, Reactions

#### `Reaction`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| Type | string | Reaction type (like, love, etc.) |
| PostId | int? | Nullable — for post reactions |
| CommentId | int? | Nullable — for comment reactions |
| UserId | int (FK) | |

#### `RefreshToken`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| Token | string | Base64 GUID |
| ExpiryDate | DateTime | 7 days from creation |
| UserId | int (FK) | |

---

### Library Models (`Features/Library/Models/`)

#### `LibraryResource`
| Property | Type |
|---|---|
| Id | int (PK) |
| Title, Type, Url, FilePath, Description | string |
| IsApproved | bool (default: false) |
| CategoryId | int (FK → LibraryCategory) |
| ResourceTypeId | int (FK → ResourceType) |

#### `LibraryCategory`
Id, Name, Description

#### `ResourceType`
Id, Name (e.g., Video, Article, Book)

---

### StudyWithFriends Models (`Features/StudyWithFriends/Models/`)

#### `StudyRoom`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| Name | string (max 100) | Required |
| Subject | string (max 100) | |
| Description | string? | |
| IsPublic | bool | Default: true |
| RoomCode | string? (max 50) | Unique, for private rooms |
| OwnerId | int (FK) | Room creator |
| CreatedAt | DateTime | |

**Navigation**: Owner, Participants, Tasks, Messages, FocusSessions

#### `RoomParticipant` (Composite PK: RoomId + UserId)
RoomId, UserId, Role (enum: Owner/Member), JoinedAt

#### `StudyTask` (Room-level)
Id, RoomId, Title, IsCompleted, CreatedById, CreatedAt

#### `RoomMessage`
Id, RoomId, SenderId, Content, SentAt

#### `FocusSession`
Id, RoomId, StartTime, DurationMinutes, Status (enum: NotStarted/Active/Stopped/Completed), StartedById

#### Enums
- `RoomRole`: Owner, Member
- `FocusSessionStatus`: NotStarted, Active, Stopped, Completed

---

### Profile Models (`Features/Profile/Models/`)

#### `StudyTask` (Profile-level, table: `ProfileStudyTasks`)
Id, UserId, Title, Description, DueDate, IsCompleted, CreatedAt

#### `StudySession`
Id, UserId, StartTime, EndTime, DurationInHours, SubjectName

#### `ActivityLog`
Id, UserId, ActionType (max 50), Description (max 500), Timestamp

---

### Admin Models (`Features/Admin/Models/`)

#### `FlaggedItem`
Id, ContentType ("Post"/"Resource"/"Room"), ContentId, ReporterId (FK), Reason, ReportedAt, IsResolved

---

### Saved Items Models (`Features/SavedItems/Models/`)

#### `SavedItem`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| UserId | int (FK) | User who saved the item |
| ItemType | string (Enum) | "Post" or "LibraryResource" |
| PostId | int? (FK) | Nullable — for saved posts |
| LibraryResourceId | int? (FK) | Nullable — for saved resources |
| SavedAt | DateTime | |

---

### Notifications Models (`Features/Notifications/Models/`)

#### `Notification`
| Property | Type | Notes |
|---|---|---|
| Id | int (PK) | |
| RecipientId | int (FK) | User receiving notification |
| SenderId | int (FK) | User who triggered the action |
| Type | string (Enum) | Like, Comment, Reply, System, StudyRoomInvite, Follow |
| ReferenceId | int? | ID of the related entity |
| TargetTitle | string | Denormalized title for UI |
| IsRead | bool | Default: false |
| CreatedAt | DateTime | |

## 5. DatabaseContext Configuration

- Inherits `IdentityDbContext<ApplicationUser, IdentityRole<int>, int>`
- **Global rule**: All foreign keys set to `DeleteBehavior.Restrict` by default
- **Comment replies**: `DeleteBehavior.NoAction` for self-referencing
- **StudyRoom cascades**: Participants, Tasks, Messages, FocusSessions cascade-delete when room is deleted
- **RoomCode**: Unique index on `StudyRoom.RoomCode`
- **RoomParticipant**: Composite key `(RoomId, UserId)`

---

## 6. Features & API Endpoints

### 6.1 Authentication & Users (`/api/Users`, `/api/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Users/register` | ❌ | Register new user + send OTP email |
| POST | `/api/Users/login` | ❌ | Login → returns JWT access + refresh tokens |
| POST | `/api/Users/forgot-password` | ❌ | Send password reset OTP |
| POST | `/api/users/verify-email` | ❌ | Verify email with OTP code |
| POST | `/api/users/reset-password` | ❌ | Reset password with OTP |
| POST | `/api/users/resend-code` | ❌ | Resend OTP verification code |

**Registration Flow**:
1. User submits: FirstName, LastName, Email, Password, DateOfBirth, Gender
2. System creates user via ASP.NET Identity
3. Generates 6-digit OTP (cryptographically secure)
4. Sends OTP to user's email via SMTP
5. Returns `userId`, `email`, success message

**Login Flow**:
1. Validates email + password via Identity
2. Generates JWT access token (15 min expiry) with claims: Sub, Email, GivenName, FamilyName, Roles
3. Generates refresh token (7 days, stored in DB)
4. Returns both tokens

**JWT Claims**: Sub (UserId), Email, GivenName, FamilyName, Jti, Roles

---

### 6.2 Posts (`/api/Posts`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Posts` | ✅ | Create post (title, content, imageUrl) |
| GET | `/api/Posts` | ❌ | Get all posts (AllowAnonymous) |
| PUT | `/api/Posts/{id}` | ✅ | Update post (owner only) |
| DELETE | `/api/Posts/{id}` | ✅ | Delete post + all comments (owner only) |
| POST | `/api/Posts/{postId}/reactions` | ✅ | Add reaction to post |

**Features**: CQRS with CreatePost, GetAllPosts, UpdatePost, DeletePost commands/queries. Supports image URLs and post sharing (ParentPostId).

---

### 6.3 Comments (`/api/posts/{postId}/comments`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/posts/{postId}/comments` | ✅ | Add comment (supports nested replies via ParentCommentId) |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | ✅ | Delete comment (owner only) |
| POST | `/api/posts/{postId}/comments/{commentId}/reactions` | ✅ | React to a comment |

**Features**: Threaded/nested comments, reactions on comments.

---

### 6.4 Reactions

Reactions can be added to both posts and comments. The `Reaction` model uses nullable `PostId` and `CommentId` to differentiate. Reaction types stored as strings (e.g., "like", "love").

---

### 6.5 Library (`/api/Library`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Library/add` | ❌ | Submit a new resource (pending approval) |
| GET | `/api/Library/all` | ❌ | Get all resources |
| GET | `/api/Library/{id}` | ❌ | Get resource by ID |
| PUT | `/api/Library/approve/{id}` | ❌ | Approve a resource |
| DELETE | `/api/Library/reject/{id}` | ❌ | Reject/delete a resource |
| PUT | `/api/Library/update/{id}` | ❌ | Update resource details |

**Seeder**: Pre-seeds categories (Frontend, Backend) and resource types (Video, Article, Book).

---

### 6.6 Study Rooms — Study With Friends (`/api/StudyRooms`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/StudyRooms` | ✅ | List all rooms |
| GET | `/api/StudyRooms/{id}` | ✅ | Get room details |
| POST | `/api/StudyRooms` | ✅ | Create room (name, subject, description, isPublic) |
| POST | `/api/StudyRooms/{id}/join` | ✅ | Join room (roomCode for private) |
| POST | `/api/StudyRooms/{id}/leave` | ✅ | Leave room |
| DELETE | `/api/StudyRooms/{id}` | ✅ | Delete room (owner only) |
| POST | `/api/StudyRooms/{id}/tasks` | ✅ | Create task in room |
| PATCH | `/api/StudyRooms/{id}/tasks/{taskId}/toggle` | ✅ | Toggle task completion |
| PUT | `/api/StudyRooms/{id}/tasks/{taskId}` | ✅ | Update task |
| DELETE | `/api/StudyRooms/{id}/tasks/{taskId}` | ✅ | Delete task |
| POST | `/api/StudyRooms/{id}/focus/start` | ✅ | Start focus session (duration in minutes) |
| POST | `/api/StudyRooms/{id}/focus/{sessionId}/stop` | ✅ | Stop focus session |
| POST | `/api/StudyRooms/{id}/messages` | ✅ | Send chat message |
| GET | `/api/StudyRooms/{id}/messages` | ✅ | Get room messages |

**CQRS Commands**: CreateRoom, JoinRoom, LeaveRoom, DeleteRoom, CreateTask, ToggleTask, UpdateTask, DeleteTask, StartFocusSession, StopFocusSession, SendMessage

**DTOs**: StudyRoomDto, CreateRoomDto, StudyTaskDto, UpdateTaskDto, FocusSessionDto, RoomMessageDto, RoomParticipantDto

---

### 6.7 User Profile (`/api/Profile`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Profile` | ✅ | Get current user's profile |
| PUT | `/api/Profile` | ✅ | Update profile (track, academicYear, dailyGoalHours) |
| GET | `/api/Profile/dashboard` | ✅ | Get profile dashboard with stats |

**Dashboard Data** (`UserProfileDashboardDto`):
- **UserDetails**: Name, Track, AcademicYear, CurrentStreak
- **Stats**: TotalStudyHours, TasksDone, TotalSessions, ThisWeekHours, TasksToday, ActiveStudyRooms
- **PlannerTasks**: List of user's study tasks
- **WeeklyHours**: Study hours breakdown by day
- **ActivityLogs**: Recent activity history

---

### 6.8 Admin Panel (`/api/Admin`) — Role: Admin Only

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Admin/dashboard` | ✅ Admin | Global stats & recent activities |
| GET | `/api/Admin/users?search=` | ✅ Admin | List/search users |
| PUT | `/api/Admin/users/{id}/role` | ✅ Admin | Change user role |
| PUT | `/api/Admin/users/{id}/status` | ✅ Admin | Suspend/activate user |
| GET | `/api/Admin/resources?search=` | ✅ Admin | List/search library resources |
| DELETE | `/api/Admin/resources/{id}` | ✅ Admin | Delete resource |
| GET | `/api/Admin/moderation` | ✅ Admin | List flagged content |
| DELETE | `/api/Admin/moderation/{id}` | ✅ Admin | Delete flagged item |

**Dashboard Stats** (`AdminDashboardDto`):
- **GlobalStats**: TotalUsers, TotalResources, ActiveSessions, PostsCount (with % changes)
- **QuickStats**: ActiveUsers, StudyRoomsOpen, FlaggedContent, AvgSessionMinutes, ResourcesToday, NewSignupsToday
- **RecentActivities**: List of GlobalActivityLogDto

**Admin Seeder**: Auto-creates on startup:
- Roles: `Admin`, `User`, `Moderator`
- Default admin: `admin@studystation.com` / `Admin@12345`

---

### 6.9 Saved Items (`/api/SavedItems`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/SavedItems` | ✅ | Get all saved items for the current user |
| POST | `/api/SavedItems` | ✅ | Save a Post or LibraryResource |
| DELETE | `/api/SavedItems/{id}` | ✅ | Unsave an item by its SavedItemId |

**CQRS Commands**: SaveItemCommand, UnsaveItemCommand, GetSavedItemsQuery

**DTOs**: SaveItemRequest, SavedItemResponse

---

### 6.10 Notification System (`/api/Notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Notifications` | ✅ | Get user notifications (paginated, supports unreadOnly filter) |
| GET | `/api/Notifications/unread-count` | ✅ | Get unread notifications count |
| PUT | `/api/Notifications/mark-all-read` | ✅ | Mark all notifications as read |
| PUT | `/api/Notifications/{id}/mark-read` | ✅ | Mark a specific notification as read |
| DELETE | `/api/Notifications/{id}` | ✅ | Delete a specific notification |

**CQRS Commands/Queries**: GetUserNotificationsQuery, GetUnreadNotificationsCountQuery, MarkAllNotificationsAsReadCommand, MarkNotificationAsReadCommand, DeleteNotificationCommand, CreateNotificationCommand

**Real-time**: Triggered via `NotificationHub` upon `CreateNotificationCommand`.

---

## 7. Services

### JwtService
- `GenerateAccessToken(user, roles)` → JWT with 15-min expiry, HMAC-SHA256 signing
- `GenerateRefreshToken(userId)` → Base64 GUID token, 7-day expiry

### EmailService (IEmailService)
- `SendEmailAsync(toEmail, subject, body)` → HTML email via Gmail SMTP (port 587, SSL)

---

## 8. SignalR Hubs

### StudyHub (`/Hubs/StudyHub`) — Requires Auth
**Client Interface** (`IStudyClient`):
- `ReceiveMessage(object)` — New chat message
- `UserJoined(int userId, string name)` — User joined room
- `UserLeft(int userId, string name)` — User left room
- `TaskCreated/Updated/Deleted(object/int)` — Task events
- `FocusSessionStarted/Stopped(object/int)` — Focus session events

**Server Methods**:
- `JoinRoomGroup(string roomId)` — Join SignalR group
- `LeaveRoomGroup(string roomId)` — Leave SignalR group

### NotificationHub (`/Hubs/NotificationHub`)
- Pushes real-time notifications to users
- Client listens for the `ReceiveNotification` event
- Payload: `NotificationDto`

---

## 9. Middleware Pipeline (Program.cs)

```
1. CORS (AllowFrontend policy — localhost + production URLs)
2. OpenAPI + Scalar API Reference
3. HTTPS Redirection
4. Routing
5. CORS middleware
6. Authentication (JWT Bearer)
7. Authorization
8. Map Controllers
9. Map SignalR Hubs
10. Seed Admin Account
11. Run
```

**CORS Origins**: `localhost:5173`, `localhost:5174`, `localhost:5177`, `study-station.runasp.net`, `study-station-alpha.vercel.app`

**Identity Config**:
- Password: min 8 chars, require digit + uppercase, no special char required
- Unique email required
- Email confirmation required for sign-in

---

## 10. Frontend Details

### Routes (App.jsx)
| Path | Component | Description |
|---|---|---|
| `/` | WelcomePage | Landing page |
| `/signup` | SignUp | Registration form |
| `/login` | Login | Login form |
| `/auth` | AuthPage | Auth container |
| `/forgot-password` | ForgotPassword | Password recovery |
| `/reset-password` | ResetPassword | Password reset form |
| `/home` | Home | Main app home |

### Key Components
- **SignUp.jsx** (24KB) — Full registration form with Zod validation
- **Login.jsx** (14KB) — Login with form validation
- **ForgotPassword.jsx** — OTP-based password recovery
- **ResetPassword.jsx** — Password reset with code verification
- **authServices.js** — Axios-based API service layer

### Validation Schemas (Zod)
- `signupSchema.js` — Registration validation rules
- `loginSchema.js` — Login validation rules

### Features
- 3-second loading screen on app startup
- Client-side routing with React Router
- Form validation with React Hook Form + Zod
- Toast notifications (React Toastify)
- Responsive UI with Tailwind + Bootstrap + MUI

---

## 11. Database Migrations History

| Date | Migration | Description |
|---|---|---|
| 2025-11-24 | AddPostUserForeignKey | Initial schema with posts & user FK |
| 2025-11-25 | AddOtpFieldsToUser | OTP verification fields |
| 2025-11-25 | AddNestedComments | Threaded comment support |
| 2025-11-29 | AddLibraryResourceTable | Library resources |
| 2025-11-30 | AddCategoryAndTypeToLibraryResource | Categories & resource types |
| 2025-12-07 | AddLibrary | Library refinements |
| 2026-02-23 | ManualFixForImageAndShare | Post image & sharing |
| 2026-02-28 | ResetPasswordResendCode | Password reset flow |
| 2026-04-15 | AddStudyWithFriendsFeatures | Study rooms, tasks, messages, focus |
| 2026-04-21 | AddUserProfileDashboard | Profile dashboard entities |
| 2026-04-26 | UpdateStudyWithFriends | Study rooms updates |
| 2026-04-26 | AddAdminDashboard | Admin panel entities |
| 2026-04-26 | UpdateBeforeAdminPush | Pre-push fixes |
| 2026-04-26 | FixDeletePostComments | Cascade delete comments |
| 2026-04-26 | UpdateLibraryLogic | Library logic fixes |
| 2026-04-29 | StudyRoomUpdates | Room refinements |
| 2026-04-29 | updateStrudyWithFriend2 | Further room fixes |
| 2026-04-29 | AddAdminPanelEndpoints | Admin endpoints support |
| 2026-05-12 | AddSavedItemsFeature | Saved items functionality |
| 2026-05-12 | AddNotifications | Notification system |

---

## 12. NuGet Packages

| Package | Version |
|---|---|
| FluentValidation | 11.11.0 |
| FluentValidation.AspNetCore | 11.3.0 |
| MediatR | 12.4.1 |
| Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 9.0.0 |
| Microsoft.AspNetCore.OpenApi | 9.0.0 |
| Microsoft.EntityFrameworkCore.SqlServer | 9.0.0 |
| Microsoft.EntityFrameworkCore.Tools | 9.0.0 |
| Scalar.AspNetCore | 2.12.46 |

---

## 13. Key Design Decisions

1. **CQRS + MediatR**: Every feature uses Command/Query separation with dedicated handlers — keeps controllers thin
2. **Feature-based folders**: Each module (Users, Posts, Library, etc.) is self-contained with its own Commands, Queries, DTOs, Models, Handlers
3. **Int-based Identity**: Uses `IdentityUser<int>` instead of default string GUIDs for simpler FKs
4. **Restrict deletes globally**: All FKs default to `Restrict` to prevent accidental cascading, with explicit `Cascade` only on StudyRoom children
5. **OTP via email**: Registration requires email verification before login (configurable)
6. **Admin seeding**: Automatic admin account creation on startup ensures admin access is always available
7. **Dual token auth**: Short-lived JWT (15 min) + long-lived refresh token (7 days) for security

---

*End of Documentation*
