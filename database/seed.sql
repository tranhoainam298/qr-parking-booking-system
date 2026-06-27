-- ===========================================================================
-- QR Parking Booking System Database Seeding Script (SQL Server)
-- ===========================================================================

-- USE QRParkingDB;
-- GO

-- Disable foreign key constraints temporarily to facilitate clean insert
-- (Optional, since we insert in correct dependency order)

-- 1. Insert Users
INSERT INTO Users (UserId, FullName, Email, Phone, UserRole, VehiclePlate, VehicleType, WalletBalance, UserStatus, CreatedDate) VALUES
('USR-001', 'Taylor Smith', 'taylor@qrparking.test', '+66 81 111 1001', 'User', '1กข-1001', 'Sedan', 250000, 'Active', '2026-01-10 08:00:00'),
('USR-002', 'Morgan Doe', 'morgan@qrparking.test', '+66 81 222 1002', 'User', '2ขค-2002', 'SUV', 50000, 'Active', '2026-02-15 09:30:00'),
('USR-003', 'Jamie Chan', 'jamie@qrparking.test', '+66 81 333 1003', 'User', '3คง-3003', 'Compact', 15000, 'Blocked', '2026-03-20 10:15:00'),
('HND-001', 'Jordan Lee', 'jordan@qrparking.test', '+66 82 200 1001', 'Handler', NULL, NULL, 0, 'Active', '2026-01-05 08:00:00'),
('HND-002', 'Casey Kim', 'casey@qrparking.test', '+66 82 300 1002', 'Handler', NULL, NULL, 0, 'Active', '2026-02-10 09:00:00'),
('ADM-001', 'Alex Morgan', 'alex@qrparking.test', '+66 82 100 1001', 'Admin', NULL, NULL, 0, 'Active', '2026-01-01 08:00:00');

-- 2. Insert Parking Sites
INSERT INTO ParkingSites (SiteId, SiteName, SiteAddress, Area, PostalCode, Latitude, Longitude, BaseRate) VALUES
('SITE-1', 'City Center Parking', '123 Le Loi Street, Ben Nghe Ward, District 1', 'District 1', '700000', 10.7769, 106.7009, 40000),
('SITE-2', 'Airport Parking', 'Tan Binh District, HCMC', 'Tan Binh', '700000', 10.8162, 106.6633, 50000),
('SITE-3', 'Westside Mall', '456 Hau Giang Street, District 6', 'District 6', '700000', 10.7511, 106.6378, 30000);

-- 3. Insert Parking Slots
INSERT INTO ParkingSlots (SlotId, SiteId, SlotNumber, SlotType, HourlyRate, SlotStatus, LastUpdated) VALUES
('SLOT-1-A01', 'SITE-1', 'A-01', 'Standard', 40000, 'Occupied', '2026-06-27 08:30:00'),
('SLOT-1-A02', 'SITE-1', 'A-02', 'Compact', 40000, 'Available', '2026-06-27 09:00:00'),
('SLOT-1-A03', 'SITE-1', 'A-03', 'Large', 40000, 'Reserved', '2026-06-27 08:45:00'),
('SLOT-1-A04', 'SITE-1', 'A-04', 'Disabled', 40000, 'Available', '2026-06-27 08:00:00'),
('SLOT-2-B01', 'SITE-2', 'B-01', 'Standard', 50000, 'Occupied', '2026-06-27 08:30:00'),
('SLOT-2-B02', 'SITE-2', 'B-02', 'Compact', 50000, 'Available', '2026-06-27 09:00:00'),
('SLOT-2-B03', 'SITE-2', 'B-03', 'Large', 50000, 'Reserved', '2026-06-27 08:45:00'),
('SLOT-2-B04', 'SITE-2', 'B-04', 'Disabled', 50000, 'Maintenance', '2026-06-27 08:00:00'),
('SLOT-3-C01', 'SITE-3', 'C-01', 'Standard', 30000, 'Available', '2026-06-27 08:30:00'),
('SLOT-3-C02', 'SITE-3', 'C-02', 'Compact', 30000, 'Available', '2026-06-27 09:00:00'),
('SLOT-3-C03', 'SITE-3', 'C-03', 'Large', 30000, 'Available', '2026-06-27 08:45:00'),
('SLOT-3-C04', 'SITE-3', 'C-04', 'Disabled', 30000, 'Available', '2026-06-27 08:00:00');

-- 4. Insert Bookings
INSERT INTO Bookings (BookingId, UserId, SlotId, VehiclePlate, BookingDate, StartTime, DurationHours, EstimatedFee, BookingStatus, QrCode, CreatedAt) VALUES
('BKG-00001001', 'USR-001', 'SLOT-1-A01', '1กข-1001', '2026-06-27', '08:00:00', 3, 120000, 'Active', 'QR-BKG-00001001', '2026-06-27 07:30:00'),
('BKG-00001002', 'USR-001', 'SLOT-1-A03', '1กข-1001', '2026-06-27', '10:00:00', 2, 80000, 'Reserved', 'QR-BKG-00001002', '2026-06-27 07:45:00'),
('BKG-00001003', 'USR-002', 'SLOT-2-B01', '2ขค-2002', '2026-06-27', '08:00:00', 4, 200000, 'Active', 'QR-BKG-00001003', '2026-06-27 07:15:00'),
('BKG-00001004', 'USR-002', 'SLOT-2-B03', '2ขค-2002', '2026-06-27', '12:00:00', 2, 100000, 'Reserved', 'QR-BKG-00001004', '2026-06-27 07:50:00');

-- 5. Insert QR Tickets
INSERT INTO QrTickets (TicketId, BookingId, UserId, QrValue, QrType, TicketStatus, CreatedAt) VALUES
('QRT-0001', 'BKG-00001001', 'USR-001', 'QR-BKG-00001001', 'ParkingTicket', 'Active', '2026-06-27 07:30:00'),
('QRT-0002', 'BKG-00001002', 'USR-001', 'QR-BKG-00001002', 'ParkingTicket', 'Active', '2026-06-27 07:45:00'),
('QRT-0003', 'BKG-00001003', 'USR-002', 'QR-BKG-00001003', 'ParkingTicket', 'Active', '2026-06-27 07:15:00'),
('QRT-0004', 'BKG-00001004', 'USR-002', 'QR-BKG-00001004', 'ParkingTicket', 'Active', '2026-06-27 07:50:00'),
('QRP-0001', NULL, 'USR-001', 'USR-001', 'UserProfile', 'Active', '2026-06-27 07:00:00'),
('QRP-0002', NULL, 'USR-002', 'USR-002', 'UserProfile', 'Active', '2026-06-27 07:00:00'),
('QRP-0003', NULL, 'USR-003', 'USR-003', 'UserProfile', 'Active', '2026-06-27 07:00:00');

-- 6. Insert Parking Sessions
INSERT INTO ParkingSessions (SessionId, BookingId, UserId, VehiclePlate, SlotId, EntryTime, ExitTime, DurationString, ActualFee, PaymentMethod, HandlerId, SessionStatus) VALUES
('SES-0001', 'BKG-00001001', 'USR-001', '1กข-1001', 'SLOT-1-A01', '2026-06-27 08:05:00', NULL, NULL, NULL, NULL, 'HND-001', 'Active'),
('SES-0002', 'BKG-00001003', 'USR-002', '2ขค-2002', 'SLOT-2-B01', '2026-06-27 08:12:00', NULL, NULL, NULL, NULL, 'HND-002', 'Active');

-- 7. Insert Wallet Transactions (Recharges)
INSERT INTO WalletTransactions (TransactionId, UserId, Amount, PaymentMethod, GatewayReference, HandlerId, TransactionDate, TransactionStatus, Note) VALUES
('TXN-0001', 'USR-001', 300000, 'Card', 'GATE-111111', NULL, '2026-06-27 07:00:00', 'Completed', 'Online Card Top-up'),
('TXN-0002', 'USR-001', 50000, 'Cash', 'CASH-HANDLER-222', 'HND-001', '2026-06-27 08:30:00', 'Completed', 'Cash Recharge at Gate'),
('TXN-0003', 'USR-002', 100000, 'Card', 'GATE-333333', NULL, '2026-06-27 07:10:00', 'Completed', 'Online Card Top-up');

-- 8. Insert Feedbacks
INSERT INTO Feedbacks (FeedbackId, UserId, SiteId, Rating, FeedbackMessage, SubmittedDate, FeedbackStatus, AdminResponse) VALUES
('FDB-0001', 'USR-001', 'SITE-1', 5, 'Great app! Booking a slot was seamless and QR entry was fast.', '2026-06-25', 'Resolved', 'Thank you Taylor for your kind words!'),
('FDB-0002', 'USR-002', 'SITE-2', 4, 'Very convenient, but slot indicators at airport parking could be clearer.', '2026-06-26', 'Reviewed', NULL);
GO
