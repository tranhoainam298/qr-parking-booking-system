-- ===========================================================================
-- QR Parking Booking System Database Schema (SQL Server)
-- ===========================================================================

-- Create Database if not exists (Optional / Administrative step)
-- CREATE DATABASE QRParkingDB;
-- GO
-- USE QRParkingDB;
-- GO

-- 1. Users Table
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    UserRole NVARCHAR(20) NOT NULL CHECK (UserRole IN ('Admin', 'Handler', 'User')),
    VehiclePlate NVARCHAR(30) NULL,
    VehicleType NVARCHAR(30) NULL,
    WalletBalance INT NOT NULL DEFAULT 0 CHECK (WalletBalance >= 0),
    UserStatus NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (UserStatus IN ('Active', 'Blocked')),
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 2. Parking Sites Table
CREATE TABLE ParkingSites (
    SiteId NVARCHAR(50) PRIMARY KEY,
    SiteName NVARCHAR(100) NOT NULL,
    SiteAddress NVARCHAR(200) NOT NULL,
    Area NVARCHAR(50) NOT NULL,
    PostalCode NVARCHAR(20) NOT NULL,
    Latitude DECIMAL(9, 6) NOT NULL,
    Longitude DECIMAL(9, 6) NOT NULL,
    BaseRate INT NOT NULL DEFAULT 0 CHECK (BaseRate >= 0)
);

-- 3. Parking Slots Table
CREATE TABLE ParkingSlots (
    SlotId NVARCHAR(50) PRIMARY KEY,
    SiteId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ParkingSites(SiteId),
    SlotNumber NVARCHAR(20) NOT NULL,
    SlotType NVARCHAR(20) NOT NULL CHECK (SlotType IN ('Standard', 'Compact', 'Large', 'Disabled')),
    HourlyRate INT NOT NULL CHECK (HourlyRate >= 0),
    SlotStatus NVARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (SlotStatus IN ('Available', 'Reserved', 'Occupied', 'Maintenance')),
    LastUpdated DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UC_Site_SlotNumber UNIQUE (SiteId, SlotNumber)
);

-- 4. Bookings Table
CREATE TABLE Bookings (
    BookingId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    SlotId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ParkingSlots(SlotId),
    VehiclePlate NVARCHAR(30) NOT NULL,
    BookingDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    StartTime TIME(0) NOT NULL,
    DurationHours INT NOT NULL CHECK (DurationHours > 0),
    EstimatedFee INT NOT NULL CHECK (EstimatedFee >= 0),
    BookingStatus NVARCHAR(20) NOT NULL DEFAULT 'Reserved' CHECK (BookingStatus IN ('Reserved', 'Active', 'Completed', 'Cancelled')),
    QrCode NVARCHAR(100) UNIQUE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 5. QR Tickets Table
CREATE TABLE QrTickets (
    TicketId NVARCHAR(50) PRIMARY KEY,
    BookingId NVARCHAR(50) NULL FOREIGN KEY REFERENCES Bookings(BookingId),
    UserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    QrValue NVARCHAR(100) UNIQUE NOT NULL,
    QrType NVARCHAR(20) NOT NULL CHECK (QrType IN ('ParkingTicket', 'UserProfile')),
    TicketStatus NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (TicketStatus IN ('Active', 'Revoked')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 6. Parking Sessions Table
CREATE TABLE ParkingSessions (
    SessionId NVARCHAR(50) PRIMARY KEY,
    BookingId NVARCHAR(50) NULL FOREIGN KEY REFERENCES Bookings(BookingId),
    UserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    VehiclePlate NVARCHAR(30) NOT NULL,
    SlotId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ParkingSlots(SlotId),
    EntryTime DATETIME2 NOT NULL,
    ExitTime DATETIME2 NULL,
    DurationString NVARCHAR(50) NULL,
    ActualFee INT NULL CHECK (ActualFee >= 0),
    PaymentMethod NVARCHAR(20) NULL CHECK (PaymentMethod IN ('Wallet', 'Cash')),
    HandlerId NVARCHAR(50) NULL FOREIGN KEY REFERENCES Users(UserId),
    SessionStatus NVARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (SessionStatus IN ('Active', 'Completed'))
);

-- 7. Wallet Transactions Table
CREATE TABLE WalletTransactions (
    TransactionId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Amount INT NOT NULL CHECK (Amount > 0),
    PaymentMethod NVARCHAR(20) NOT NULL CHECK (PaymentMethod IN ('Card', 'Cash')),
    GatewayReference NVARCHAR(100) NULL,
    HandlerId NVARCHAR(50) NULL FOREIGN KEY REFERENCES Users(UserId),
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    TransactionStatus NVARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (TransactionStatus IN ('Completed', 'Pending', 'Failed')),
    Note NVARCHAR(200) NULL
);

-- 8. Feedbacks Table
CREATE TABLE Feedbacks (
    FeedbackId NVARCHAR(50) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    SiteId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ParkingSites(SiteId),
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    FeedbackMessage NVARCHAR(MAX) NOT NULL,
    SubmittedDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    FeedbackStatus NVARCHAR(20) NOT NULL DEFAULT 'Submitted' CHECK (FeedbackStatus IN ('Submitted', 'Reviewed', 'Resolved')),
    AdminResponse NVARCHAR(MAX) NULL
);

-- 9. Audit Logs Table (Optional for operations logging)
CREATE TABLE AuditLogs (
    LogId NVARCHAR(50) PRIMARY KEY,
    LogAction NVARCHAR(100) NOT NULL,
    ActorUserId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    TargetUserId NVARCHAR(50) NULL FOREIGN KEY REFERENCES Users(UserId),
    LoggedAmount INT NULL,
    LoggedDate DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO
