export const users = [
  ['USR-001', 'Taylor Smith', 'User', 'taylor@example.com', '+66 81 111 1001', '1กข-1001', 1250, 'Active'],
  ['USR-002', 'Maya Chen', 'User', 'maya@example.com', '+66 81 111 1002', '2กค-2042', 780, 'Active'],
  ['USR-003', 'Noah Williams', 'User', 'noah@example.com', '+66 81 111 1003', '3ขค-3303', 420, 'Active'],
  ['USR-004', 'Aria Patel', 'User', 'aria@example.com', '+66 81 111 1004', '4กง-4404', 1980, 'Active'],
  ['USR-005', 'Liam Brown', 'User', 'liam@example.com', '+66 81 111 1005', '5ขจ-5505', 90, 'Suspended'],
  ['USR-006', 'Sofia Garcia', 'User', 'sofia@example.com', '+66 81 111 1006', '6กฉ-6606', 635, 'Active'],
  ['USR-007', 'Ethan Kim', 'User', 'ethan@example.com', '+66 81 111 1007', '7ขช-7707', 1140, 'Active'],
  ['USR-008', 'Emma Wilson', 'User', 'emma@example.com', '+66 81 111 1008', '8กซ-8808', 325, 'Inactive'],
  ['USR-009', 'Lucas Martin', 'User', 'lucas@example.com', '+66 81 111 1009', '9ขญ-9909', 860, 'Active'],
  ['USR-010', 'Nina Davis', 'User', 'nina@example.com', '+66 81 111 1010', '1กฎ-1010', 510, 'Active'],
].map(([id, name, role, email, phone, vehiclePlate, walletBalance, status]) => ({ id, name, role, email, phone, vehiclePlate, walletBalance, status }))

export const handlers = [
  ['HND-001', 'Jordan Lee', 'jordan@qrparking.test', '+66 82 200 1001', 'Active'],
  ['HND-002', 'Sam Rivera', 'sam@qrparking.test', '+66 82 200 1002', 'Active'],
  ['HND-003', 'Avery Nguyen', 'avery@qrparking.test', '+66 82 200 1003', 'Off Duty'],
  ['HND-004', 'Casey Johnson', 'casey@qrparking.test', '+66 82 200 1004', 'Active'],
  ['HND-005', 'Riley Wong', 'riley@qrparking.test', '+66 82 200 1005', 'Inactive'],
].map(([id, name, email, phone, status]) => ({ id, name, email, phone, status }))

export const parkingSites = [
  { id: 'S1', name: 'City Center Parking', address: '23 Tran Phu, Hai Chau, Da Nang', lat: 16.0544, lng: 108.2022, area: 'Hai Chau', postalCode: '550000', totalSlots: 50, availableSlots: 18, rate: 5000 },
  { id: 'S2', name: 'Airport Parking', address: '01 Duy Tan, Cam Le, Da Nang', lat: 16.0438, lng: 108.1994, area: 'Cam Le', postalCode: '550100', totalSlots: 80, availableSlots: 32, rate: 8000 },
  { id: 'S3', name: 'University Parking', address: '03 Quang Trung, Hai Chau, Da Nang', lat: 16.0726, lng: 108.2208, area: 'Hai Chau', postalCode: '550000', totalSlots: 30, availableSlots: 5, rate: 3000 },
  { id: 'S4', name: 'Mall Parking', address: '255 Hung Vuong, Thanh Khe, Da Nang', lat: 16.0631, lng: 108.1930, area: 'Thanh Khe', postalCode: '550200', totalSlots: 100, availableSlots: 60, rate: 6000 },
]

const slotStatuses = ['Available', 'Occupied', 'Reserved', 'Maintenance']
export const parkingSlots = Array.from({ length: 20 }, (_, index) => {
  const site = parkingSites[index % parkingSites.length]
  return {
    id: `SLOT-${String(index + 1).padStart(3, '0')}`,
    siteId: site.id,
    siteName: site.name,
    area: site.area,
    postalCode: site.postalCode,
    slotType: index % 5 === 0 ? 'EV' : index % 4 === 0 ? 'Accessible' : 'Standard',
    rate: site.rate + (index % 5 === 0 ? 15 : 0),
    status: slotStatuses[index % slotStatuses.length],
  }
})

export const bookings = Array.from({ length: 10 }, (_, index) => {
  const user = users[index]
  const site = parkingSites[index % parkingSites.length]
  const slot = parkingSlots[index]
  return {
    id: `BKG-${String(index + 1).padStart(4, '0')}`,
    userId: user.id,
    userName: user.name,
    vehiclePlate: user.vehiclePlate,
    siteId: site.id,
    siteName: site.name,
    slotId: slot.id,
    slotNumber: `${String.fromCharCode(65 + (index % 4))}-${String(index + 1).padStart(2, '0')}`,
    date: `2026-06-${String(18 + index).padStart(2, '0')}`,
    startTime: `${String(8 + (index % 9)).padStart(2, '0')}:00`,
    duration: `${1 + (index % 4)} hours`,
    estimatedFee: site.rate * (1 + (index % 4)),
    status: ['Confirmed', 'Active', 'Completed', 'Cancelled'][index % 4],
    qrCode: `QR-BKG-${String(index + 1).padStart(4, '0')}`,
  }
})

export const parkingSessions = Array.from({ length: 8 }, (_, index) => {
  const booking = bookings[index]
  return {
    id: `SES-${String(index + 1).padStart(4, '0')}`,
    bookingId: booking.id,
    userId: booking.userId,
    userName: booking.userName,
    vehiclePlate: booking.vehiclePlate,
    siteName: booking.siteName,
    slotNumber: booking.slotNumber,
    entryTime: `${booking.date}T${booking.startTime}:00+07:00`,
    exitTime: index < 3 ? null : `${booking.date}T${String(11 + (index % 7)).padStart(2, '0')}:30:00+07:00`,
    duration: index < 3 ? 'In progress' : `${2 + (index % 3)}h 30m`,
    fee: index < 3 ? null : booking.estimatedFee,
    paymentMethod: index % 2 ? 'Card' : 'Wallet',
    handlerId: handlers[index % handlers.length].id,
    status: index < 3 ? 'Active' : 'Completed',
  }
})

export const walletTransactions = Array.from({ length: 10 }, (_, index) => ({
  id: `TXN-${String(index + 1).padStart(4, '0')}`,
  userId: users[index].id,
  userName: users[index].name,
  amount: [200, 500, 1000, 300, 750][index % 5],
  method: ['PromptPay', 'Card', 'Cash'][index % 3],
  gatewayRef: `GATE-202606-${10001 + index}`,
  handlerId: index % 3 === 2 ? handlers[index % handlers.length].id : null,
  date: `2026-06-${String(17 + index).padStart(2, '0')}T${String(9 + (index % 8)).padStart(2, '0')}:15:00+07:00`,
  status: index === 8 ? 'Pending' : index === 9 ? 'Failed' : 'Completed',
}))

export const feedbacks = [
  ['FDB-001', 0, 0, 5, 'Fast entry and plenty of available spaces.', '2026-06-19', 'Published'],
  ['FDB-002', 1, 1, 4, 'QR scanner worked well, signage could be clearer.', '2026-06-20', 'Published'],
  ['FDB-003', 2, 2, 5, 'Great value and easy to find.', '2026-06-21', 'Published'],
  ['FDB-004', 3, 3, 3, 'Exit queue was longer than expected.', '2026-06-22', 'Pending'],
  ['FDB-005', 5, 0, 4, 'Convenient booking experience.', '2026-06-23', 'Published'],
  ['FDB-006', 6, 1, 2, 'My reserved slot was occupied.', '2026-06-24', 'Under Review'],
].map(([id, userIndex, siteIndex, rating, message, date, status]) => ({
  id,
  userId: users[userIndex].id,
  userName: users[userIndex].name,
  siteName: parkingSites[siteIndex].name,
  rating,
  message,
  date,
  status,
}))
