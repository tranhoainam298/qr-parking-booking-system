-- =====================================================
-- SQL Server Schema — Data Access Layer
-- QR Parking Booking System
-- =====================================================

-- Users table
CREATE TABLE Users (
    Id          NVARCHAR(10)   PRIMARY KEY,
    Name        NVARCHAR(100)  NOT NULL,
    Email       NVARCHAR(150)  UNIQUE NOT NULL,
    Phone       NVARCHAR(20)   NOT NULL,
    Password    NVARCHAR(255)  NOT NULL,
    Role        NVARCHAR(10)   NOT NULL CHECK (Role IN ('Admin', 'Handler', 'User')),
    VehiclePlate NVARCHAR(20)  NULL,
    VehicleType NVARCHAR(30)   NULL,
    WalletBalance DECIMAL(12,0) DEFAULT 0,
    Status      NVARCHAR(15)   DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    CreatedAt   DATETIME2      DEFAULT GETDATE(),
    UpdatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Parking Sites table
CREATE TABLE ParkingSites (
    Id          NVARCHAR(10)   PRIMARY KEY,
    Name        NVARCHAR(100)  NOT NULL,
    Address     NVARCHAR(255)  NOT NULL,
    Lat         FLOAT          NOT NULL,
    Lng         FLOAT          NOT NULL,
    Area        NVARCHAR(50)   NOT NULL,
    PostalCode  NVARCHAR(10)   NOT NULL,
    TotalSlots  INT            DEFAULT 0,
    AvailableSlots INT         DEFAULT 0,
    Rate        DECIMAL(10,0)  NOT NULL,
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Parking Slots table
CREATE TABLE ParkingSlots (
    Id          NVARCHAR(15)   PRIMARY KEY,
    SiteId      NVARCHAR(10)   NOT NULL REFERENCES ParkingSites(Id),
    SlotType    NVARCHAR(20)   DEFAULT 'Standard' CHECK (SlotType IN ('Standard', 'EV', 'Accessible')),
    Rate        DECIMAL(10,0)  NOT NULL,
    Status      NVARCHAR(15)   DEFAULT 'Available' CHECK (Status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')),
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Bookings table
CREATE TABLE Bookings (
    Id          NVARCHAR(20)   PRIMARY KEY,
    UserId      NVARCHAR(10)   NOT NULL REFERENCES Users(Id),
    SiteId      NVARCHAR(10)   NOT NULL REFERENCES ParkingSites(Id),
    SlotId      NVARCHAR(15)   NOT NULL REFERENCES ParkingSlots(Id),
    SlotNumber  NVARCHAR(10)   NOT NULL,
    VehiclePlate NVARCHAR(20)  NOT NULL,
    BookingDate DATE           NOT NULL,
    StartTime   NVARCHAR(5)    NOT NULL,
    Duration    NVARCHAR(20)   NOT NULL,
    EstimatedFee DECIMAL(12,0) NOT NULL,
    QrCode      NVARCHAR(50)   NOT NULL,
    Status      NVARCHAR(15)   DEFAULT 'Reserved' CHECK (Status IN ('Reserved', 'Active', 'Completed', 'Cancelled')),
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Parking Sessions table
CREATE TABLE ParkingSessions (
    Id          NVARCHAR(20)   PRIMARY KEY,
    BookingId   NVARCHAR(20)   NOT NULL REFERENCES Bookings(Id),
    UserId      NVARCHAR(10)   NOT NULL REFERENCES Users(Id),
    HandlerId   NVARCHAR(10)   NULL REFERENCES Users(Id),
    EntryTime   DATETIME2      NOT NULL,
    ExitTime    DATETIME2      NULL,
    Duration    NVARCHAR(20)   NULL,
    Fee         DECIMAL(12,0)  NULL,
    PaymentMethod NVARCHAR(10) NULL CHECK (PaymentMethod IN ('Wallet', 'Cash', 'Card')),
    Status      NVARCHAR(15)   DEFAULT 'Active' CHECK (Status IN ('Active', 'Completed')),
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Wallet Transactions table
CREATE TABLE WalletTransactions (
    Id          NVARCHAR(20)   PRIMARY KEY,
    UserId      NVARCHAR(10)   NOT NULL REFERENCES Users(Id),
    Amount      DECIMAL(12,0)  NOT NULL,
    Method      NVARCHAR(15)   NOT NULL CHECK (Method IN ('PromptPay', 'Card', 'Cash', 'Debit Card', 'Credit Card')),
    GatewayRef  NVARCHAR(50)   NULL,
    HandlerId   NVARCHAR(10)   NULL REFERENCES Users(Id),
    Status      NVARCHAR(15)   DEFAULT 'Completed' CHECK (Status IN ('Pending', 'Completed', 'Failed', 'Successful')),
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);

-- Feedbacks table
CREATE TABLE Feedbacks (
    Id          NVARCHAR(15)   PRIMARY KEY,
    UserId      NVARCHAR(10)   NOT NULL REFERENCES Users(Id),
    SiteId      NVARCHAR(10)   NOT NULL REFERENCES ParkingSites(Id),
    Rating      INT            NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Message     NVARCHAR(500)  NOT NULL,
    Status      NVARCHAR(15)   DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Published', 'Under Review', 'Submitted', 'Reviewed', 'Resolved')),
    CreatedAt   DATETIME2      DEFAULT GETDATE()
);
