const USERS_KEY = 'jet2_users';
const FLIGHTS_KEY = 'jet2_flights';
const BOOKINGS_KEY = 'jet2_bookings';
const AUTH_KEY = 'jet2_auth';
const AIRPORTS_KEY = 'jet2_airports';
const AIRCRAFT_KEY = 'jet2_aircraft';
const STAFF_NICKS_KEY = 'jet2_staff_nicks';
const GAMEPASS_SETTINGS_KEY = 'jet2_gamepass_settings';
const BOOKING_ALERTS_KEY = 'jet2_booking_alerts';
const STAFF_CODE = '1234';
const STAFF_OWNER_NICK = 'nikopro0909';

const MAP_BOUNDS = {
  west: -57,
  east: 67,
  south: 25,
  north: 66
};
const MAP_ZOOM = 5;

const GAMEPASS_TYPES = {
  priority: {
    label: 'Priority',
    idKey: 'priorityGamePassId',
    urlKey: 'priorityGamePassUrl',
    defaultUrl: 'https://www.roblox.com/game-pass/'
  },
  seat: {
    label: 'Seat selection',
    idKey: 'seatGamePassId',
    urlKey: 'seatGamePassUrl',
    defaultUrl: 'https://www.roblox.com/game-pass/'
  }
};

const ORIGIN_AIRPORTS = [
  { name: 'London Stansted', code: 'STN', country: 'England', type: 'base', lat: 51.886, lon: 0.238 },
  { name: 'Bournemouth', code: 'BOH', country: 'England', type: 'base', lat: 50.78, lon: -1.842 },
  { name: 'Bristol', code: 'BRS', country: 'England', type: 'base', lat: 51.382, lon: -2.719 },
  { name: 'Birmingham', code: 'BHX', country: 'England', type: 'base', lat: 52.453, lon: -1.748 },
  { name: 'East Midlands', code: 'EMA', country: 'England', type: 'base', lat: 52.831, lon: -1.328 },
  { name: 'Leeds Bradford', code: 'LBA', country: 'England', type: 'base', lat: 53.865, lon: -1.66 }
];

const DESTINATION_AIRPORTS = [
  { name: 'Reykjavik', code: 'RKV', country: 'Iceland', type: 'destination', lat: 64.146, lon: -21.94 },
  { name: 'Porto', code: 'OPO', country: 'Portugal', type: 'destination', lat: 41.248, lon: -8.681 },
  { name: 'Alicante', code: 'ALC', country: 'Spain', type: 'destination', lat: 38.282, lon: -0.558 },
  { name: 'Reus', code: 'REU', country: 'Spain', type: 'destination', lat: 41.147, lon: 1.167 },
  { name: 'Rome', code: 'FCO', country: 'Italy', type: 'destination', lat: 41.799, lon: 12.246 },
  { name: 'Skiathos', code: 'JSI', country: 'Greece', type: 'destination', lat: 39.177, lon: 23.503 },
  { name: 'Paphos', code: 'PFO', country: 'Cyprus', type: 'destination', lat: 34.718, lon: 32.485 },
  { name: 'Madeira', code: 'FNC', country: 'Portugal', type: 'destination', lat: 32.697, lon: -16.774 },
  { name: 'Tenerife', code: 'TFS', country: 'Spain', type: 'destination', lat: 28.044, lon: -16.572 },
  { name: 'Gran Canaria', code: 'LPA', country: 'Spain', type: 'destination', lat: 27.931, lon: -15.386 }
];

const ALL_AIRPORTS = [...ORIGIN_AIRPORTS, ...DESTINATION_AIRPORTS];

const AIRCRAFT_CONFIG = {
  name: 'Boeing 737-800 Jet2',
  rows: 32,
  seats: ['A', 'B', 'C', 'D', 'E', 'F']
};

const FEATURED_DESTINATIONS = [
  {
    name: 'Rome',
    country: 'Italy',
    rating: '4.8',
    image: 'url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80")'
  },
  {
    name: 'Skiathos',
    country: 'Greece',
    rating: '4.7',
    image: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80")'
  },
  {
    name: 'Madeira',
    country: 'Portugal',
    rating: '4.9',
    image: 'url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80")'
  },
  {
    name: 'Paphos',
    country: 'Cyprus',
    rating: '4.6',
    image: 'url("https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80")'
  }
];

let currentUser = null;
let flights = [];
let bookings = [];
let originAirports = [];
let destinationAirports = [];
let aircraftOptions = [];
let staffNicks = [];
let gamepassSettings = {};
let bookingAlerts = [];
let activeScheduleFilter = null;
let selectedAirport = 'London Stansted';
let pendingBooking = null;
let selectedStaffFlightId = null;
let activeStaffTab = 'flights';
let bookingAlertTimers = [];
const gamepassOwnershipCache = new Map();
const CUSTOM_AIRPORT_SELECT_IDS = ['quick-from', 'quick-to', 'flight-from', 'flight-to'];
const CUSTOM_STAFF_DATE_TIME_IDS = [
  'flight-date',
  'flight-depart',
  'flight-arrive',
  'flight-delete',
  'flight-booking-open',
  'flight-booking-close',
  'edit-flight-departure-time',
  'edit-flight-arrival-time',
  'edit-flight-booking-open',
  'edit-flight-booking-close',
  'edit-flight-delete-on'
];

window.addEventListener('load', () => {
  initializeApp();
  checkAuth();
});

function initializeApp() {
  loadFromStorage();
  setupEventListeners();
  populateAirportSelects();
  setDefaultDates();
  refreshStaffDateTimeControls();
  toggleReturnDateField();
  renderMaps();
  renderAirportList();
  renderFeaturedDestinations();
  scheduleBookingAlerts();
}

function setupEventListeners() {
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('staff-btn')?.addEventListener('click', openStaffPanel);
  document.getElementById('staff-login-form')?.addEventListener('submit', handleStaffLogin);
  document.getElementById('add-flight-form')?.addEventListener('submit', handleAddFlight);
  document.getElementById('quick-book-form')?.addEventListener('submit', searchFlights);
  document.getElementById('clear-filter-btn')?.addEventListener('click', clearScheduleFilter);
  document.getElementById('flight-date')?.addEventListener('change', syncStaffBookingCloseDefault);
  document.getElementById('flight-depart')?.addEventListener('change', syncStaffBookingCloseDefault);

  document.querySelectorAll('input[name="quick-trip-type"]').forEach((input) => {
    input.addEventListener('change', toggleReturnDateField);
  });

  document.querySelectorAll('[data-staff-tab]').forEach((button) => {
    button.addEventListener('click', () => switchStaffTab(button.dataset.staffTab));
  });

  document.querySelectorAll('[data-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      switchView(link.dataset.view);
    });
  });
}

function loadFromStorage() {
  loadEditableData();

  const storedFlights = readStorage(FLIGHTS_KEY);
  flights = Array.isArray(storedFlights) ? storedFlights.map(normalizeFlight) : createDefaultFlights();

  const storedBookings = readStorage(BOOKINGS_KEY);
  bookings = Array.isArray(storedBookings) ? storedBookings.map(normalizeBooking) : [];

  currentUser = readStorage(AUTH_KEY);
  purgeExpiredFlights();
  saveAppState();
}

function loadEditableData() {
  const storedAirports = readStorage(AIRPORTS_KEY);
  if (storedAirports && Array.isArray(storedAirports.origins) && Array.isArray(storedAirports.destinations)) {
    originAirports = storedAirports.origins.map(normalizeAirport).filter(Boolean);
    destinationAirports = storedAirports.destinations.map(normalizeAirport).filter(Boolean);
  } else {
    originAirports = ORIGIN_AIRPORTS.map((airport) => ({ ...airport }));
    destinationAirports = DESTINATION_AIRPORTS.map((airport) => ({ ...airport }));
  }

  const storedAircraft = readStorage(AIRCRAFT_KEY);
  aircraftOptions = Array.isArray(storedAircraft) && storedAircraft.length
    ? storedAircraft.map(normalizeAircraft).filter(Boolean)
    : [{ name: AIRCRAFT_CONFIG.name }];

  const storedStaffNicks = readStorage(STAFF_NICKS_KEY);
  staffNicks = Array.isArray(storedStaffNicks) && storedStaffNicks.length
    ? normalizeStaffNicks(storedStaffNicks)
    : [STAFF_OWNER_NICK];

  gamepassSettings = normalizeGamepassSettings(readStorage(GAMEPASS_SETTINGS_KEY));

  const storedBookingAlerts = readStorage(BOOKING_ALERTS_KEY);
  bookingAlerts = Array.isArray(storedBookingAlerts)
    ? storedBookingAlerts.map(normalizeBookingAlert).filter(Boolean)
    : [];
}

function saveEditableData() {
  localStorage.setItem(AIRPORTS_KEY, JSON.stringify({
    origins: originAirports,
    destinations: destinationAirports
  }));
  localStorage.setItem(AIRCRAFT_KEY, JSON.stringify(aircraftOptions));
  localStorage.setItem(STAFF_NICKS_KEY, JSON.stringify(normalizeStaffNicks(staffNicks)));
  localStorage.setItem(GAMEPASS_SETTINGS_KEY, JSON.stringify(normalizeGamepassSettings(gamepassSettings)));
  localStorage.setItem(BOOKING_ALERTS_KEY, JSON.stringify(bookingAlerts));
}

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return null;
  }
}

function saveAppState() {
  localStorage.setItem(FLIGHTS_KEY, JSON.stringify(flights));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  saveEditableData();
  if (currentUser) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
  }
}

function getUsers() {
  const storedUsers = readStorage(USERS_KEY);
  if (!Array.isArray(storedUsers)) return [];
  return storedUsers.map((user) => ({
    ...user,
    login: user.login || user.email || user.username || '',
    robloxName: user.robloxName || user.name || ''
  }));
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function createDefaultFlights() {
  const pairs = [
    ['LS1897', 'London Stansted', 'Paphos', 'one-way', 3, '19:00', '20:00', '1', 'N/A'],
    ['LS2204', 'Bournemouth', 'Skiathos', 'return', 5, '16:30', '21:05', '1', 'A4'],
    ['LS3102', 'Bristol', 'Madeira', 'return', 6, '09:20', '13:05', '2', 'B2'],
    ['LS4420', 'Birmingham', 'Alicante', 'one-way', 4, '12:15', '15:40', '1', 'C7'],
    ['LS5066', 'East Midlands', 'Porto', 'return', 8, '10:00', '12:25', '1', 'D3'],
    ['LS7215', 'Leeds Bradford', 'Reykjavik', 'one-way', 9, '07:45', '10:20', '2', 'E1'],
    ['LS7741', 'London Stansted', 'Rome', 'return', 10, '14:10', '17:35', '1', 'F5'],
    ['LS8803', 'Birmingham', 'Reus', 'one-way', 12, '08:35', '11:50', '1', 'C2'],
    ['LS9350', 'Bristol', 'Tenerife', 'return', 14, '06:20', '10:45', '2', 'B8'],
    ['LS9418', 'East Midlands', 'Gran Canaria', 'return', 15, '06:50', '11:10', '1', 'D6']
  ];

  return pairs.map(([number, from, to, tripType, days, departure, arrival, terminal, gate]) => ({
    id: createId('flight'),
    number,
    tripType,
    from,
    to,
    flightDate: dateOffset(days),
    departure,
    arrival,
    terminal,
    gate,
    aircraft: getDefaultAircraftName(),
    bookingOpen: dateTimeOffset(-1),
    bookingClose: `${dateOffset(days)}T${departure}`,
    deleteOn: dateOffset(days + 21),
    status: 'On Time',
    createdAt: new Date().toISOString()
  }));
}

function normalizeFlight(flight) {
  const flightDate = flight.flightDate || dateOffset(3);
  const departure = flight.departure || '00:00';
  return {
    id: flight.id || createId('flight'),
    number: flight.number || 'LS0000',
    tripType: flight.tripType || 'one-way',
    from: flight.from || 'London Stansted',
    to: flight.to || 'Paphos',
    flightDate,
    departure,
    arrival: flight.arrival || '00:00',
    terminal: flight.terminal || '1',
    gate: flight.gate || 'N/A',
    aircraft: flight.aircraft || getDefaultAircraftName(),
    bookingOpen: flight.bookingOpen || dateTimeOffset(-1),
    bookingClose: flight.bookingClose || `${flightDate}T${departure}`,
    deleteOn: flight.deleteOn || flight.expiresAt || dateOffset(14),
    status: flight.status || 'On Time',
    createdAt: flight.createdAt || new Date().toISOString()
  };
}

function normalizeBooking(booking) {
  return {
    id: booking.id || createId('booking'),
    userId: booking.userId,
    robloxName: booking.robloxName || 'Unknown passenger',
    flightId: booking.flightId,
    flightNumber: booking.flightNumber || booking.number || 'LS0000',
    tripType: booking.tripType || 'one-way',
    passengers: booking.passengers || '1 Passenger',
    from: booking.from || 'Unknown',
    to: booking.to || 'Unknown',
    flightDate: booking.flightDate || booking.date || '',
    returnDate: booking.returnDate || '',
    departure: booking.departure || '',
    arrival: booking.arrival || '',
    terminal: booking.terminal || '1',
    gate: booking.gate || 'N/A',
    aircraft: booking.aircraft || getDefaultAircraftName(),
    priority: Boolean(booking.priority),
    seat: booking.seat || '',
    seatMode: booking.seatMode || (booking.seat ? 'selected' : 'random'),
    bookingNumber: booking.bookingNumber || generateBookingNumber(),
    bookingDate: booking.bookingDate || new Date().toISOString(),
    status: booking.status || 'Confirmed'
  };
}

function normalizeAirport(airport) {
  if (!airport || !airport.name || !airport.code) return null;
  const type = airport.type === 'destination' ? 'destination' : 'base';
  return {
    name: String(airport.name).trim(),
    code: String(airport.code).trim().toUpperCase(),
    country: String(airport.country || (type === 'base' ? 'England' : 'Unknown')).trim(),
    type,
    lat: Number(airport.lat),
    lon: Number(airport.lon)
  };
}

function normalizeAircraft(aircraft) {
  const name = typeof aircraft === 'string' ? aircraft : aircraft?.name;
  if (!name || !String(name).trim()) return null;
  return { name: String(name).trim() };
}

function normalizeStaffNicks(nicks) {
  const values = nicks
    .map((nick) => String(nick || '').trim())
    .filter(Boolean);
  if (!values.some((nick) => nick.toLowerCase() === STAFF_OWNER_NICK.toLowerCase())) {
    values.unshift(STAFF_OWNER_NICK);
  }
  return [...new Map(values.map((nick) => [nick.toLowerCase(), nick])).values()];
}

function normalizeGamepassSettings(settings = {}) {
  settings = settings || {};
  return {
    priorityGamePassId: String(settings.priorityGamePassId || '').trim(),
    priorityGamePassUrl: String(settings.priorityGamePassUrl || '').trim(),
    seatGamePassId: String(settings.seatGamePassId || '').trim(),
    seatGamePassUrl: String(settings.seatGamePassUrl || '').trim()
  };
}

function normalizeBookingAlert(alert) {
  if (!alert || !alert.flightId || !alert.userId) return null;
  return {
    flightId: String(alert.flightId),
    userId: String(alert.userId),
    createdAt: alert.createdAt || new Date().toISOString(),
    delivered: Boolean(alert.delivered)
  };
}

function checkAuth() {
  if (currentUser) {
    showMainApp();
  } else {
    showAuthContainer();
  }
}

function showAuthContainer() {
  document.getElementById('auth-container').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  updateUserDisplay();
  renderHomeFlight();
  renderSchedule();
  renderBookings();
  renderMaps();
  scheduleBookingAlerts();
}

function switchToLogin(event) {
  event.preventDefault();
  document.getElementById('register-view').classList.remove('active');
  document.getElementById('login-view').classList.add('active');
}

function switchToRegister(event) {
  event.preventDefault();
  document.getElementById('login-view').classList.remove('active');
  document.getElementById('register-view').classList.add('active');
}

function handleRegister(event) {
  event.preventDefault();

  const robloxName = document.getElementById('reg-roblox-name').value.trim();
  const login = document.getElementById('reg-login').value.trim();
  const birthdate = document.getElementById('reg-birthdate').value;

  if (!robloxName || !login || !birthdate) {
    showToast('Please fill Roblox name, login, and birth date.', 'error');
    return;
  }

  const users = getUsers();
  const sameRobloxName = users.some((user) => user.robloxName.toLowerCase() === robloxName.toLowerCase());
  const sameExactAccount = users.some((user) => (
    user.robloxName.toLowerCase() === robloxName.toLowerCase() &&
    user.login.toLowerCase() === login.toLowerCase()
  ));

  if (sameExactAccount || sameRobloxName) {
    showToast('This Roblox name is already registered.', 'error');
    return;
  }

  const user = {
    id: createId('user'),
    robloxName,
    login,
    birthdate,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);
  document.getElementById('register-form').reset();
  document.getElementById('login-name').value = login;
  document.getElementById('login-roblox-name').value = robloxName;
  switchToLogin({ preventDefault: () => {} });
  showToast('Account created. You can login now.', 'success');
}

function handleLogin(event) {
  event.preventDefault();

  const login = document.getElementById('login-name').value.trim();
  const robloxName = document.getElementById('login-roblox-name').value.trim();
  const users = getUsers();
  const user = users.find((item) => (
    item.login.toLowerCase() === login.toLowerCase() &&
    item.robloxName.toLowerCase() === robloxName.toLowerCase()
  ));

  if (!user) {
    showToast('Login and Roblox name do not match. Register first if needed.', 'error');
    return;
  }

  currentUser = {
    id: user.id,
    robloxName: user.robloxName,
    login: user.login
  };

  saveAppState();
  document.getElementById('login-form').reset();
  showMainApp();
  showToast(`Welcome, ${currentUser.robloxName}.`, 'success');
}

function handleLogout() {
  currentUser = null;
  bookingAlertTimers.forEach((timerId) => window.clearTimeout(timerId));
  bookingAlertTimers = [];
  localStorage.removeItem(AUTH_KEY);
  document.getElementById('register-form')?.reset();
  document.getElementById('login-form')?.reset();
  showAuthContainer();
  switchToRegister({ preventDefault: () => {} });
  showToast('Logged out.', 'success');
}

function updateUserDisplay() {
  const name = currentUser?.robloxName || 'Passenger';
  document.getElementById('user-welcome').textContent = name;
  document.getElementById('home-username').textContent = name;
}

function getOriginAirports() {
  return originAirports.length ? originAirports : ORIGIN_AIRPORTS;
}

function getDestinationAirports() {
  return destinationAirports.length ? destinationAirports : DESTINATION_AIRPORTS;
}

function getAllAirports() {
  return [...getOriginAirports(), ...getDestinationAirports()];
}

function getAircraftOptions() {
  return aircraftOptions.length ? aircraftOptions : [{ name: AIRCRAFT_CONFIG.name }];
}

function getDefaultAircraftName() {
  return getAircraftOptions()[0]?.name || AIRCRAFT_CONFIG.name;
}

function isStaffNick(nick) {
  if (!nick) return false;
  return staffNicks.some((item) => item.toLowerCase() === String(nick).trim().toLowerCase());
}

function isStaffOwner() {
  return currentUser?.robloxName?.toLowerCase() === STAFF_OWNER_NICK.toLowerCase();
}

function openStaffPanel() {
  document.getElementById('staff-modal').classList.remove('hidden');
  document.getElementById('staff-login-view').classList.remove('hidden');
  document.getElementById('staff-dashboard-view').classList.add('hidden');
}

function closeStaffModal() {
  document.getElementById('staff-modal').classList.add('hidden');
}

function handleStaffLogin(event) {
  event.preventDefault();
  const code = document.getElementById('staff-code').value.trim();

  if (code !== STAFF_CODE) {
    showToast('Invalid staff code.', 'error');
    return;
  }

  if (!isStaffNick(currentUser?.robloxName)) {
    showToast('Your Roblox name is not allowed for the staff panel.', 'error');
    return;
  }

  document.getElementById('staff-login-view').classList.add('hidden');
  document.getElementById('staff-dashboard-view').classList.remove('hidden');
  switchStaffTab(activeStaffTab);
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffInformations();
  renderStaffAircraft();
  renderStaffBookings();
  showToast('Staff panel opened.', 'success');
}

function logoutStaff() {
  document.getElementById('staff-login-view').classList.remove('hidden');
  document.getElementById('staff-dashboard-view').classList.add('hidden');
  document.getElementById('staff-code').value = '';
  showToast('Staff logged out.', 'success');
}

function handleAddFlight(event) {
  event.preventDefault();

  const flight = {
    id: createId('flight'),
    tripType: document.getElementById('flight-trip-type').value,
    number: document.getElementById('flight-num').value.trim().toUpperCase(),
    from: document.getElementById('flight-from').value,
    to: document.getElementById('flight-to').value,
    aircraft: document.getElementById('flight-aircraft').value,
    flightDate: document.getElementById('flight-date').value,
    departure: document.getElementById('flight-depart').value,
    arrival: document.getElementById('flight-arrive').value,
    terminal: document.getElementById('flight-terminal').value.trim(),
    gate: document.getElementById('flight-gate').value.trim().toUpperCase(),
    deleteOn: document.getElementById('flight-delete').value,
    bookingOpen: document.getElementById('flight-booking-open').value,
    bookingClose: document.getElementById('flight-booking-close').value,
    status: 'On Time',
    createdAt: new Date().toISOString()
  };

  if (Object.values(flight).some((value) => value === '')) {
    showToast('Please fill every flight field.', 'error');
    return;
  }

  if (isDateBeforeToday(flight.deleteOn)) {
    showToast('Delete date cannot be in the past.', 'error');
    return;
  }

  if (new Date(`${flight.deleteOn}T23:59:59`) < new Date(`${flight.flightDate}T00:00:00`)) {
    showToast('Delete date must be on or after the flight date.', 'error');
    return;
  }

  if (new Date(flight.bookingOpen) >= new Date(flight.bookingClose)) {
    showToast('Booking close must be after booking open.', 'error');
    return;
  }

  if (new Date(flight.bookingClose) > new Date(`${flight.flightDate}T${flight.departure || '23:59'}`)) {
    showToast('Booking must close before flight departure.', 'error');
    return;
  }

  flights.push(flight);
  selectedStaffFlightId = flight.id;
  saveAppState();
  document.getElementById('add-flight-form').reset();
  setDefaultDates();
  renderSchedule();
  renderHomeFlight();
  renderMaps();
  renderAirportList();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffBookings();
  showToast(`Flight ${flight.number} added.`, 'success');
}

function deleteFlight(flightId) {
  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight) return;

  if (!confirm(`Delete planned flight ${flight.number}? Related passenger bookings will be cancelled.`)) {
    return;
  }

  const bookingCount = bookings.filter((booking) => String(booking.flightId) === String(flightId)).length;
  flights = flights.filter((item) => String(item.id) !== String(flightId));
  bookings = bookings.filter((booking) => String(booking.flightId) !== String(flightId));
  if (String(selectedStaffFlightId) === String(flightId)) {
    selectedStaffFlightId = flights[0]?.id || null;
  }
  saveAppState();
  renderSchedule();
  renderHomeFlight();
  renderBookings();
  renderMaps();
  renderAirportList();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffBookings();
  showToast(`Flight ${flight.number} deleted. ${bookingCount} booking(s) cancelled.`, 'success');
}

function searchFlights(event) {
  event.preventDefault();

  const tripType = getQuickTripType();
  const from = document.getElementById('quick-from').value;
  const to = document.getElementById('quick-to').value;
  const departureDate = document.getElementById('quick-date').value;
  const returnDate = document.getElementById('quick-return-date').value;
  const passengers = document.getElementById('quick-passengers').value;

  if (!from || !to || !departureDate) {
    showToast('Choose departure, destination, and travel date.', 'error');
    return;
  }

  if (tripType === 'return' && !returnDate) {
    showToast('Choose a return date.', 'error');
    return;
  }

  if (tripType === 'return' && new Date(`${returnDate}T00:00:00`) < new Date(`${departureDate}T00:00:00`)) {
    showToast('Return date must be after the departure date.', 'error');
    return;
  }

  activeScheduleFilter = { tripType, from, to, departureDate, returnDate, passengers };
  selectedAirport = from;
  renderSchedule();
  renderMaps();
  renderAirportList();
  switchView('schedule');
}

function clearScheduleFilter() {
  activeScheduleFilter = null;
  renderSchedule();
}

function bookFlight(flightId) {
  if (!currentUser) {
    showToast('Login before booking a flight.', 'error');
    showAuthContainer();
    return;
  }

  purgeExpiredFlights();

  const existingBooking = getCurrentUserBooking();
  if (existingBooking) {
    showToast('You already have one booked flight. You cannot book a second flight.', 'error');
    renderBookings();
    switchView('bookings');
    return;
  }

  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight) {
    showToast('This flight is no longer available.', 'error');
    renderSchedule();
    return;
  }

  const bookingWindow = getBookingWindowState(flight);
  if (bookingWindow.state === 'upcoming') {
    subscribeBookingAlert(flight.id);
    return;
  }
  if (bookingWindow.state === 'closed') {
    showToast('Booking for this flight is closed.', 'error');
    renderSchedule();
    return;
  }

  pendingBooking = {
    flightId: flight.id,
    priority: false,
    seatMode: 'random',
    selectedSeat: '',
    verifiedGamepasses: {},
    gamepassNotice: null
  };
  renderBookingPriorityStep();
}

function renderBookingPriorityStep() {
  const flight = getPendingBookingFlight();
  if (!flight) return;

  setBookingModalHeading('Booking options', 'Add priority?');
  document.getElementById('booking-details').innerHTML = `
    <div class="booking-wizard-summary">
      <strong>${escapeHtml(flight.number)}: ${escapeHtml(flight.from)} -> ${escapeHtml(flight.to)}</strong>
      <span>${escapeHtml(formatDate(flight.flightDate))} | ${escapeHtml(flight.departure)} -> ${escapeHtml(flight.arrival)}</span>
    </div>
    <div class="choice-grid">
      <label class="choice-card ${pendingBooking.priority ? 'selected' : ''}">
        <input type="radio" name="booking-priority" value="yes" ${pendingBooking.priority ? 'checked' : ''} onchange="setPendingPriority(true)">
        <strong>Yes</strong>
        <span>Requires the configured Roblox priority gamepass.</span>
      </label>
      <label class="choice-card ${!pendingBooking.priority ? 'selected' : ''}">
        <input type="radio" name="booking-priority" value="no" ${!pendingBooking.priority ? 'checked' : ''} onchange="setPendingPriority(false)">
        <strong>No</strong>
        <span>Standard boarding.</span>
      </label>
    </div>
    ${pendingBooking.gamepassNotice?.kind === 'priority' ? renderGamepassNotice('priority', pendingBooking.gamepassNotice.reason) : ''}
  `;
  document.getElementById('booking-actions').innerHTML = `
    <button class="btn-secondary btn-large" type="button" onclick="closeBookingModal()">Cancel</button>
    <button class="btn-primary btn-large" type="button" onclick="continueFromPriorityStep()">Continue</button>
  `;
  document.getElementById('booking-modal').classList.remove('hidden');
}

function setPendingPriority(value) {
  if (!pendingBooking) return;
  pendingBooking.priority = Boolean(value);
  pendingBooking.gamepassNotice = null;
  renderBookingPriorityStep();
}

async function continueFromPriorityStep() {
  if (!pendingBooking) return;
  if (pendingBooking.priority) {
    const hasAccess = await ensureGamepassAccess('priority');
    if (!hasAccess) return;
  }
  pendingBooking.gamepassNotice = null;
  renderBookingSeatStep();
}

async function ensureGamepassAccess(kind) {
  if (!pendingBooking) return false;
  if (pendingBooking.verifiedGamepasses?.[kind]) return true;

  const config = getGamepassConfig(kind);
  if (!config.id) {
    pendingBooking.gamepassNotice = { kind, reason: 'missing-config' };
    renderCurrentBookingStep();
    showToast(`${config.label} gamepass is not configured by staff.`, 'error');
    return false;
  }

  pendingBooking.gamepassNotice = { kind, reason: 'checking' };
  renderCurrentBookingStep();

  try {
    const ownsPass = await checkRobloxGamepassOwnership(currentUser?.robloxName, config.id);
    if (ownsPass) {
      pendingBooking.verifiedGamepasses[kind] = true;
      pendingBooking.gamepassNotice = null;
      showToast(`${config.label} gamepass found.`, 'success');
      return true;
    }

    pendingBooking.gamepassNotice = { kind, reason: 'not-owned' };
    renderCurrentBookingStep();
    showToast(`${config.label} gamepass was not found for ${currentUser?.robloxName}.`, 'error');
    return false;
  } catch (error) {
    console.warn('Roblox gamepass check failed', error);
    pendingBooking.gamepassNotice = { kind, reason: 'check-failed' };
    renderCurrentBookingStep();
    showToast('Could not verify Roblox gamepass right now.', 'error');
    return false;
  }
}

function renderCurrentBookingStep() {
  if (!pendingBooking) return;
  if (pendingBooking.seatMode === 'selected' || pendingBooking.gamepassNotice?.kind === 'seat') {
    renderBookingSeatStep();
  } else {
    renderBookingPriorityStep();
  }
}

function getGamepassConfig(kind) {
  const meta = GAMEPASS_TYPES[kind];
  const id = String(gamepassSettings[meta.idKey] || '').trim();
  const configuredUrl = String(gamepassSettings[meta.urlKey] || '').trim();
  return {
    ...meta,
    id,
    url: configuredUrl || (id ? `${meta.defaultUrl}${encodeURIComponent(id)}` : '')
  };
}

async function checkRobloxGamepassOwnership(robloxName, gamePassId) {
  if (!robloxName || !gamePassId) return false;
  const cacheKey = `${robloxName.toLowerCase()}|${gamePassId}`;
  if (gamepassOwnershipCache.has(cacheKey)) {
    return gamepassOwnershipCache.get(cacheKey);
  }

  const userId = await getRobloxUserId(robloxName);
  if (!userId) {
    gamepassOwnershipCache.set(cacheKey, false);
    return false;
  }

  const ownsPass = await checkRobloxInventoryGamepass(userId, gamePassId)
    .catch(() => checkRobloxGamepassList(userId, gamePassId));
  gamepassOwnershipCache.set(cacheKey, ownsPass);
  return ownsPass;
}

async function checkRobloxInventoryGamepass(userId, gamePassId) {
  const response = await fetch(`https://inventory.roblox.com/v1/users/${encodeURIComponent(userId)}/items/GamePass/${encodeURIComponent(gamePassId)}`);
  if (!response.ok) {
    throw new Error(`Roblox inventory returned ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) && payload.data.length > 0;
}

async function checkRobloxGamepassList(userId, gamePassId) {
  let cursor = '';
  const targetId = String(gamePassId);

  for (let page = 0; page < 5; page += 1) {
    const url = new URL(`https://apis.roblox.com/game-passes/v1/users/${encodeURIComponent(userId)}/game-passes`);
    url.searchParams.set('count', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Roblox game-passes returned ${response.status}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload.data) && payload.data.some((pass) => String(pass.id || pass.gamePassId) === targetId)) {
      return true;
    }

    cursor = payload.nextPageCursor || '';
    if (!cursor) break;
  }

  return false;
}

async function getRobloxUserId(robloxName) {
  const response = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      usernames: [robloxName],
      excludeBannedUsers: true
    })
  });

  if (!response.ok) {
    throw new Error(`Roblox users returned ${response.status}`);
  }

  const payload = await response.json();
  return payload.data?.[0]?.id || null;
}

function renderGamepassNotice(kind, reason) {
  const config = getGamepassConfig(kind);
  const message = {
    'checking': `Checking ${config.label.toLowerCase()} gamepass for ${currentUser?.robloxName || 'this Roblox user'}...`,
    'missing-config': `Staff must set the ${config.label.toLowerCase()} gamepass ID first.`,
    'not-owned': `This Roblox account does not own the ${config.label.toLowerCase()} gamepass yet.`,
    'check-failed': `The Roblox check failed. You can still copy the buy link and try again after buying.`
  }[reason] || `Buy the ${config.label.toLowerCase()} gamepass, then try again.`;

  return `
    <div class="gamepass-gate">
      <div>
        <strong>${escapeHtml(config.label)} gamepass required</strong>
        <span>${escapeHtml(message)}</span>
        ${config.url ? `<code>${escapeHtml(config.url)}</code>` : ''}
      </div>
      <div class="gamepass-actions">
        <button class="btn-secondary" type="button" ${config.url ? '' : 'disabled'} onclick="copyGamepassLink('${escapeAttr(kind)}')">Copy link</button>
        ${config.url ? `<a class="btn-primary" href="${escapeAttr(config.url)}" target="_blank" rel="noopener">Open Roblox</a>` : ''}
      </div>
    </div>
  `;
}

async function copyGamepassLink(kind) {
  const { url } = getGamepassConfig(kind);
  if (!url) {
    showToast('No gamepass link configured.', 'error');
    return;
  }

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    showToast('Gamepass link copied.', 'success');
  } catch (error) {
    showToast(url, 'info');
  }
}

function renderBookingSeatStep() {
  const flight = getPendingBookingFlight();
  if (!flight) return;

  const occupiedSeats = getOccupiedSeats(flight.id);
  const canChooseSeat = Boolean(pendingBooking.verifiedGamepasses?.seat);
  const seatMap = pendingBooking.seatMode === 'selected' && canChooseSeat
    ? `<div class="seat-map-shell">
        <div class="seat-map-plane">
          <div class="seat-map-nose">737-800</div>
          <div class="seat-map-grid">${renderSeatMap(flight.id)}</div>
        </div>
      </div>`
    : '';
  const seatGate = pendingBooking.seatMode === 'selected' && !canChooseSeat && pendingBooking.gamepassNotice?.kind === 'seat'
    ? renderGamepassNotice('seat', pendingBooking.gamepassNotice.reason)
    : '';

  setBookingModalHeading('Seat selection', 'Choose your seat');
  document.getElementById('booking-details').innerHTML = `
    <div class="booking-wizard-summary">
      <strong>${escapeHtml(flight.number)}: ${escapeHtml(flight.from)} -> ${escapeHtml(flight.to)}</strong>
      <span>${escapeHtml(occupiedSeats.size)} seat(s) already booked on ${escapeHtml(flight.aircraft || getDefaultAircraftName())}.</span>
    </div>
    <div class="choice-grid">
      <label class="choice-card ${pendingBooking.seatMode === 'random' ? 'selected' : ''}">
        <input type="radio" name="booking-seat-mode" value="random" ${pendingBooking.seatMode === 'random' ? 'checked' : ''} onchange="setPendingSeatMode('random')">
        <strong>Random seat</strong>
        <span>The system will choose a free seat.</span>
      </label>
      <label class="choice-card ${pendingBooking.seatMode === 'selected' ? 'selected' : ''}">
        <input type="radio" name="booking-seat-mode" value="selected" ${pendingBooking.seatMode === 'selected' ? 'checked' : ''} onchange="setPendingSeatMode('selected')">
        <strong>Choose seat</strong>
        <span>Requires the configured Roblox seat gamepass.</span>
      </label>
    </div>
    ${seatGate}
    ${seatMap}
    ${pendingBooking.selectedSeat ? `<div class="selected-seat-note">Selected seat: <strong>${escapeHtml(pendingBooking.selectedSeat)}</strong></div>` : ''}
  `;
  document.getElementById('booking-actions').innerHTML = `
    <button class="btn-secondary btn-large" type="button" onclick="renderBookingPriorityStep()">Back</button>
    <button class="btn-primary btn-large" type="button" onclick="confirmPendingBooking()">Book flight</button>
  `;
  document.getElementById('booking-modal').classList.remove('hidden');
}

function setPendingSeatMode(mode) {
  if (!pendingBooking) return;
  pendingBooking.seatMode = mode === 'selected' ? 'selected' : 'random';
  if (pendingBooking.seatMode === 'random') {
    pendingBooking.selectedSeat = '';
    pendingBooking.gamepassNotice = null;
    renderBookingSeatStep();
    return;
  }
  renderBookingSeatStep();
  verifySeatGamepassForSeatMap();
}

async function verifySeatGamepassForSeatMap() {
  if (!pendingBooking || pendingBooking.seatMode !== 'selected') return;
  await ensureGamepassAccess('seat');
  renderBookingSeatStep();
}

function selectBookingSeat(seat) {
  const flight = getPendingBookingFlight();
  if (!flight || !pendingBooking) return;
  if (getOccupiedSeats(flight.id).has(seat)) {
    showToast(`Seat ${seat} is already taken.`, 'error');
    return;
  }
  pendingBooking.selectedSeat = seat;
  renderBookingSeatStep();
}

async function confirmPendingBooking() {
  const flight = getPendingBookingFlight();
  if (!flight || !pendingBooking) {
    showToast('This flight is no longer available.', 'error');
    closeBookingModal();
    renderSchedule();
    return;
  }

  const bookingWindow = getBookingWindowState(flight);
  if (bookingWindow.state === 'upcoming') {
    showToast('Booking is not open yet.', 'error');
    closeBookingModal();
    renderSchedule();
    return;
  }
  if (bookingWindow.state === 'closed') {
    showToast('Booking for this flight is closed.', 'error');
    closeBookingModal();
    renderSchedule();
    return;
  }

  const occupiedSeats = getOccupiedSeats(flight.id);
  let seat = pendingBooking.selectedSeat;

  if (pendingBooking.seatMode === 'selected') {
    const hasSeatAccess = await ensureGamepassAccess('seat');
    if (!hasSeatAccess) {
      renderBookingSeatStep();
      return;
    }
    if (!seat) {
      showToast('Choose a seat or use random seat.', 'error');
      return;
    }
    if (occupiedSeats.has(seat)) {
      showToast(`Seat ${seat} is already taken.`, 'error');
      renderBookingSeatStep();
      return;
    }
  } else {
    seat = pickRandomSeat(flight.id);
    if (!seat) {
      showToast('No seats are available on this flight.', 'error');
      return;
    }
  }

  const existingBooking = getCurrentUserBooking();
  if (existingBooking) {
    showToast('You already have one booked flight. You cannot book a second flight.', 'error');
    pendingBooking = null;
    renderBookings();
    switchView('bookings');
    return;
  }

  const booking = {
    id: createId('booking'),
    userId: currentUser.id,
    robloxName: currentUser.robloxName,
    flightId: flight.id,
    flightNumber: flight.number,
    tripType: flight.tripType,
    passengers: activeScheduleFilter?.passengers || '1 Passenger',
    from: flight.from,
    to: flight.to,
    flightDate: flight.flightDate,
    returnDate: flight.tripType === 'return' ? activeScheduleFilter?.returnDate || dateOffsetFrom(flight.flightDate, 7) : '',
    departure: flight.departure,
    arrival: flight.arrival,
    terminal: flight.terminal,
    gate: flight.gate,
    aircraft: flight.aircraft || getDefaultAircraftName(),
    priority: pendingBooking.priority,
    seat,
    seatMode: pendingBooking.seatMode,
    bookingNumber: generateBookingNumber(),
    bookingDate: new Date().toISOString(),
    status: 'Confirmed'
  };

  bookings.push(booking);
  saveAppState();
  showBookingConfirmation(booking);
  renderHomeFlight();
  renderSchedule();
  renderBookings();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffBookings();
  showToast('Flight booked successfully.', 'success');
  pendingBooking = null;
}

function showBookingConfirmation(booking) {
  setBookingModalHeading('Confirmed booking', 'Your flight is booked');
  document.getElementById('booking-details').innerHTML = `
    <div class="boarding-pass">
      <div class="boarding-pass-top">
        <span>${escapeHtml(formatTripType(booking.tripType))}</span>
        <strong>${escapeHtml(booking.bookingNumber)}</strong>
      </div>
      <div class="boarding-route">
        <div>
          <span>${escapeHtml(getAirportCode(booking.from))}</span>
          <strong>${escapeHtml(booking.from)}</strong>
        </div>
        <div class="boarding-line"></div>
        <div>
          <span>${escapeHtml(getAirportCode(booking.to))}</span>
          <strong>${escapeHtml(booking.to)}</strong>
        </div>
      </div>
    </div>
    <div class="confirmation-grid">
      ${renderInfoPill('Passenger', booking.robloxName)}
      ${renderInfoPill('Passengers', booking.passengers)}
      ${renderInfoPill('Flight', booking.flightNumber)}
      ${renderInfoPill('Status', booking.status)}
      ${renderInfoPill('Travel date', formatDate(booking.flightDate))}
      ${renderInfoPill('Return date', booking.returnDate ? formatDate(booking.returnDate) : 'No return')}
      ${renderInfoPill('Time', `${booking.departure} -> ${booking.arrival}`)}
      ${renderInfoPill('Terminal / Gate', `${booking.terminal} / ${booking.gate}`)}
      ${renderInfoPill('Priority', booking.priority ? 'Yes' : 'No')}
      ${renderInfoPill('Seat', booking.seat || 'Not assigned')}
      ${renderInfoPill('Aircraft', booking.aircraft || getDefaultAircraftName())}
    </div>
  `;
  document.getElementById('booking-actions').innerHTML = `
    <button class="btn-secondary btn-large" type="button" onclick="cancelBookingFromModal('${escapeAttr(booking.id)}')">Cancel booking</button>
    <button class="btn-primary btn-large" type="button" onclick="closeBookingModal()">Done</button>
  `;
  document.getElementById('booking-modal').classList.remove('hidden');
}

function closeBookingModal() {
  pendingBooking = null;
  document.getElementById('booking-modal').classList.add('hidden');
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  document.getElementById('current-login').value = currentUser?.login || '';
  document.getElementById('new-login').value = '';
  modal.classList.remove('hidden');

  const form = document.getElementById('change-login-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    updateUserLogin();
  };
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
  document.getElementById('change-login-form').onsubmit = null;
}

function updateUserLogin() {
  const newLogin = document.getElementById('new-login').value.trim();
  if (!newLogin) {
    showToast('Login cannot be empty', 'error');
    return;
  }

  if (newLogin === currentUser?.login) {
    showToast('New login must be different from current login', 'error');
    return;
  }

  const existingUser = getUsers().find((u) => u.login === newLogin);
  if (existingUser) {
    showToast('This login is already in use', 'error');
    return;
  }

  currentUser.login = newLogin;
  const allUsers = getUsers();
  const userIndex = allUsers.findIndex((u) => u.id === currentUser.id);
  if (userIndex >= 0) {
    allUsers[userIndex] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
  }

  persistData();
  closeSettingsModal();
  showToast('Login updated successfully', 'success');
  updateUserDisplay();
}

function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.\n\nAll your bookings will be deleted as well.')) {
    deleteUserAccount();
  }
}

function deleteUserAccount() {
  if (!currentUser) return;

  const allUsers = getUsers().filter((u) => u.id !== currentUser.id);
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));

  bookings = bookings.filter((b) => b.userId !== currentUser.id);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  currentUser = null;
  localStorage.removeItem(AUTH_KEY);
  closeSettingsModal();
  showToast('Account deleted successfully', 'success');
  window.setTimeout(() => {
    showAuthView();
  }, 500);
}

function openEditFlightModal(flightId) {
  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight) return;

  document.getElementById('edit-flight-number').value = flight.number;
  document.getElementById('edit-flight-departure-time').value = flight.departure;
  document.getElementById('edit-flight-arrival-time').value = flight.arrival;
  document.getElementById('edit-flight-terminal').value = flight.terminal;
  document.getElementById('edit-flight-gate').value = flight.gate;
  document.getElementById('edit-flight-booking-open').value = flight.bookingOpen;
  document.getElementById('edit-flight-booking-close').value = flight.bookingClose;
  document.getElementById('edit-flight-delete-on').value = flight.deleteOn;
  refreshStaffDateTimeControls();

  document.getElementById('edit-flight-modal').classList.remove('hidden');
  document.getElementById('edit-flight-form').onsubmit = (e) => {
    e.preventDefault();
    saveFlightEdit(flightId);
  };
}

function closeEditFlightModal() {
  document.getElementById('edit-flight-modal').classList.add('hidden');
  document.getElementById('edit-flight-form').onsubmit = null;
}

function saveFlightEdit(flightId) {
  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight) return;

  flight.number = document.getElementById('edit-flight-number').value;
  flight.departure = document.getElementById('edit-flight-departure-time').value;
  flight.arrival = document.getElementById('edit-flight-arrival-time').value;
  flight.terminal = document.getElementById('edit-flight-terminal').value;
  flight.gate = document.getElementById('edit-flight-gate').value;
  flight.bookingOpen = document.getElementById('edit-flight-booking-open').value;
  flight.bookingClose = document.getElementById('edit-flight-booking-close').value;
  flight.deleteOn = document.getElementById('edit-flight-delete-on').value;

  bookings = bookings.map((booking) => (
    String(booking.flightId) === String(flightId)
      ? {
          ...booking,
          flightNumber: flight.number,
          terminal: flight.terminal,
          gate: flight.gate
        }
      : booking
  ));

  persistData();
  renderStaffFlightDetail();
  closeEditFlightModal();
  showToast('Flight updated successfully', 'success');
}

function setBookingModalHeading(eyebrow, title) {
  const eyebrowElement = document.querySelector('#booking-modal .eyebrow');
  if (eyebrowElement) eyebrowElement.textContent = eyebrow;
  const titleElement = document.getElementById('booking-modal-title');
  if (titleElement) titleElement.textContent = title;
}

function getPendingBookingFlight() {
  if (!pendingBooking) return null;
  return flights.find((item) => String(item.id) === String(pendingBooking.flightId)) || null;
}

function renderSeatMap(flightId) {
  const occupiedSeats = getOccupiedSeats(flightId);
  let html = '';

  for (let row = 1; row <= AIRCRAFT_CONFIG.rows; row += 1) {
    html += `
      <div class="seat-row">
        ${AIRCRAFT_CONFIG.seats.map((letter) => renderSeatButton(`${row}${letter}`, occupiedSeats, row)).join('')}
      </div>
    `;
  }

  return html;
}

function renderSeatButton(seat, occupiedSeats, row) {
  const isOccupied = occupiedSeats.has(seat);
  const isSelected = pendingBooking?.selectedSeat === seat;
  const classes = [
    'seat-button',
    isOccupied ? 'occupied' : '',
    isSelected ? 'selected' : '',
    row <= 4 ? 'priority-zone' : ''
  ].filter(Boolean).join(' ');

  return `
    <button
      class="${classes}"
      type="button"
      ${isOccupied ? 'disabled' : ''}
      onclick="selectBookingSeat('${escapeAttr(seat)}')"
      title="${escapeAttr(isOccupied ? `Seat ${seat} taken` : `Seat ${seat}`)}">
      ${escapeHtml(seat)}
    </button>
  `;
}

function getAircraftSeats() {
  const seats = [];
  for (let row = 1; row <= AIRCRAFT_CONFIG.rows; row += 1) {
    AIRCRAFT_CONFIG.seats.forEach((letter) => seats.push(`${row}${letter}`));
  }
  return seats;
}

function getOccupiedSeats(flightId) {
  return new Set(
    bookings
      .filter((booking) => String(booking.flightId) === String(flightId) && booking.seat)
      .map((booking) => booking.seat)
  );
}

function pickRandomSeat(flightId) {
  const occupiedSeats = getOccupiedSeats(flightId);
  const availableSeats = getAircraftSeats().filter((seat) => !occupiedSeats.has(seat));
  if (availableSeats.length === 0) return '';
  return availableSeats[Math.floor(Math.random() * availableSeats.length)];
}

function renderHomeFlight() {
  const card = document.getElementById('home-flight-card');
  if (!card) return;

  const booking = getCurrentUserBooking();
  const nextFlight = booking || [...flights].sort(sortFlightsByDate)[0];

  if (!nextFlight) {
    card.innerHTML = `
      <div class="empty-state compact-empty">
        No flights are planned yet.
      </div>
    `;
    return;
  }

  card.innerHTML = renderFlightInfo(nextFlight, Boolean(booking));
}

function renderFlightInfo(item, isBooking) {
  const fromCode = getAirportCode(item.from);
  const toCode = getAirportCode(item.to);
  const subtitle = isBooking ? `Booking ${item.bookingNumber}` : formatTripType(item.tripType);
  const travelClass = isBooking ? item.seat || 'Seat' : 'Economy';

  return `
    <div class="flight-route-line">
      <div>
        <div class="route-time">${escapeHtml(item.departure)}</div>
        <div class="route-code">${escapeHtml(fromCode)}</div>
        <div class="route-airport">${escapeHtml(item.from)}</div>
      </div>
      <div class="route-mid"><div class="route-plane">J2</div></div>
      <div class="route-destination">
        <div class="route-time">${escapeHtml(item.arrival)}</div>
        <div class="route-code">${escapeHtml(toCode)}</div>
        <div class="route-airport">${escapeHtml(item.to)}</div>
      </div>
    </div>
    <div class="flight-mini-grid">
      <div><span>${escapeHtml(subtitle)}</span><strong>${escapeHtml(travelClass)}</strong></div>
      <div><span>Gate</span><strong>${escapeHtml(item.gate || 'N/A')}</strong></div>
      <div><span>Terminal</span><strong>${escapeHtml(item.terminal || '1')}</strong></div>
      <div><span>Flight</span><strong>${escapeHtml(item.flightNumber || item.number)}</strong></div>
    </div>
  `;
}

function renderSchedule() {
  const container = document.getElementById('schedule-list');
  const filterLabel = document.getElementById('schedule-filter-label');
  const clearFilterButton = document.getElementById('clear-filter-btn');
  if (!container) return;

  purgeExpiredFlights();

  const existingBooking = getCurrentUserBooking();
  const visibleFlights = getVisibleFlights().sort(sortFlightsByDate);

  if (activeScheduleFilter) {
    filterLabel.textContent = `${formatTripType(activeScheduleFilter.tripType)} from ${activeScheduleFilter.from} to ${activeScheduleFilter.to} on ${formatDate(activeScheduleFilter.departureDate)}.`;
    clearFilterButton.classList.remove('hidden');
  } else {
    filterLabel.textContent = 'Search a route above or book directly from all planned flights.';
    clearFilterButton.classList.add('hidden');
  }

  if (visibleFlights.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No planned flights match this search. Staff can create one in the staff panel.
      </div>
    `;
    return;
  }

  container.innerHTML = visibleFlights.map((flight) => {
    const isBookedFlight = existingBooking && String(existingBooking.flightId) === String(flight.id);
    const bookingWindow = getBookingWindowState(flight);
    const alertSet = isBookingAlertSet(flight.id);
    const buttonLabel = getScheduleButtonLabel(flight, existingBooking, isBookedFlight, bookingWindow, alertSet);
    const buttonClass = bookingWindow.state === 'upcoming' && !existingBooking ? 'btn-secondary booking-notify-btn' : 'btn-primary';
    const buttonAction = bookingWindow.state === 'upcoming' && !existingBooking
      ? `subscribeBookingAlert('${escapeAttr(flight.id)}')`
      : `bookFlight('${escapeAttr(flight.id)}')`;
    const buttonDisabled = isBookedFlight || (Boolean(existingBooking) && !isBookedFlight) || bookingWindow.state === 'closed';

    return `
      <article class="flight-card">
        <div class="flight-main">
          <span class="trip-badge">${escapeHtml(formatTripType(flight.tripType))}</span>
          <h3>${escapeHtml(flight.number)}: ${escapeHtml(flight.from)} -> ${escapeHtml(flight.to)}</h3>
          <p>${escapeHtml(getAirportCode(flight.from))} to ${escapeHtml(getAirportCode(flight.to))} on ${escapeHtml(formatDate(flight.flightDate))}</p>
        </div>
        <div class="flight-times">
          ${renderInfoPill('Departure', flight.departure)}
          ${renderInfoPill('Arrival', flight.arrival)}
          ${renderInfoPill('Terminal', flight.terminal)}
          ${renderInfoPill('Gate', flight.gate)}
          ${renderInfoPill('Status', flight.status)}
          ${renderInfoPill('Booking opens', formatDateTime(flight.bookingOpen))}
          ${renderInfoPill('Booking closes', formatDateTime(flight.bookingClose))}
          ${renderInfoPill('Deletes', formatDate(flight.deleteOn))}
        </div>
        <button class="${buttonClass}" type="button" ${buttonDisabled ? 'disabled' : ''} onclick="${buttonAction}">${buttonLabel}</button>
      </article>
    `;
  }).join('');
}

function getScheduleButtonLabel(flight, existingBooking, isBookedFlight, bookingWindow, alertSet) {
  if (isBookedFlight) return 'Booked';
  if (existingBooking) return 'One booking only';
  if (bookingWindow.state === 'closed') return 'Closed';
  if (bookingWindow.state === 'upcoming') return alertSet ? 'Alert set' : 'Notify me';
  return 'Book';
}

function renderBookings() {
  const container = document.getElementById('bookings-list');
  if (!container || !currentUser) return;

  const userBookings = bookings
    .filter((booking) => booking.userId === currentUser.id)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  if (userBookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        You do not have a booked flight yet.
      </div>
    `;
    return;
  }

  container.innerHTML = userBookings.map((booking) => `
    <article class="booking-card booking-card-polished">
      <div class="booking-card-main">
        <div class="booking-code-row">
          <span class="booking-code">${escapeHtml(booking.bookingNumber)}</span>
          <span class="trip-badge">${escapeHtml(booking.seat || 'Seat')}</span>
        </div>
        <h3>${escapeHtml(booking.flightNumber)}: ${escapeHtml(booking.from)} -> ${escapeHtml(booking.to)}</h3>
        <p>${escapeHtml(formatTripType(booking.tripType))} booking for ${escapeHtml(booking.robloxName)} on ${escapeHtml(booking.aircraft || getDefaultAircraftName())}</p>
      </div>
      <div class="booking-info">
        ${renderInfoPill('Travel date', formatDate(booking.flightDate))}
        ${renderInfoPill('Return date', booking.returnDate ? formatDate(booking.returnDate) : 'No return')}
        ${renderInfoPill('Passengers', booking.passengers)}
        ${renderInfoPill('Terminal / Gate', `${booking.terminal} / ${booking.gate}`)}
        ${renderInfoPill('Priority', booking.priority ? 'Yes' : 'No')}
        ${renderInfoPill('Seat', booking.seat || 'Not assigned')}
      </div>
      <div class="booking-actions-column">
        <button class="btn-secondary" type="button" onclick="showBookingConfirmationById('${escapeAttr(booking.id)}')">View</button>
        <button class="btn-danger" type="button" onclick="cancelBooking('${escapeAttr(booking.id)}')">Cancel</button>
      </div>
    </article>
  `).join('');
}

function showBookingConfirmationById(bookingId) {
  const booking = bookings.find((item) => String(item.id) === String(bookingId));
  if (booking) showBookingConfirmation(booking);
}

let pendingCancelBookingId = null;

function cancelBooking(bookingId) {
  const booking = bookings.find((item) => String(item.id) === String(bookingId));
  if (!booking || booking.userId !== currentUser?.id) return;
  pendingCancelBookingId = bookingId;
  document.getElementById('cancel-booking-message').textContent = `Are you sure you want to cancel booking ${booking.bookingNumber}? This action cannot be undone.`;
  document.getElementById('cancel-booking-modal').classList.remove('hidden');
}

function closeCancelBookingModal() {
  document.getElementById('cancel-booking-modal').classList.add('hidden');
  pendingCancelBookingId = null;
}

function confirmCancelBooking() {
  if (!pendingCancelBookingId) return;
  removeBookingById(pendingCancelBookingId);
  showToast('Booking cancelled.', 'success');
  closeCancelBookingModal();
  if (isModalContext) {
    closeBookingModal();
    isModalContext = false;
  }
}

let isModalContext = false;

function cancelBookingFromModal(bookingId) {
  isModalContext = true;
  cancelBooking(bookingId);
}

function deleteStaffBooking(bookingId) {
  const booking = bookings.find((item) => String(item.id) === String(bookingId));
  if (!booking) return;
  if (!confirm(`Delete booking ${booking.bookingNumber}?`)) return;
  removeBookingById(bookingId);
  showToast('Booking deleted.', 'success');
}

function removeBookingById(bookingId) {
  bookings = bookings.filter((item) => String(item.id) !== String(bookingId));
  saveAppState();
  renderHomeFlight();
  renderSchedule();
  renderBookings();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffBookings();
}

function renderStaffFlights() {
  const container = document.getElementById('staff-flights');
  const counter = document.getElementById('staff-flight-count');
  if (!container) return;

  const sortedFlights = [...flights].sort(sortFlightsByDate);
  counter.textContent = `${sortedFlights.length} ${sortedFlights.length === 1 ? 'flight' : 'flights'}`;
  if (!selectedStaffFlightId && sortedFlights.length) {
    selectedStaffFlightId = sortedFlights[0].id;
  }

  if (sortedFlights.length === 0) {
    container.innerHTML = '<div class="empty-state">No planned flights yet.</div>';
    renderStaffFlightDetail();
    return;
  }

  container.innerHTML = sortedFlights.map((flight) => {
    const bookedPassengers = bookings.filter((booking) => String(booking.flightId) === String(flight.id)).length;
    const isSelected = String(selectedStaffFlightId) === String(flight.id);
    return `
      <article class="staff-flight-card ${isSelected ? 'selected' : ''}">
        <button class="staff-flight-select" type="button" onclick="selectStaffFlight('${escapeAttr(flight.id)}')">
          <h4>${escapeHtml(flight.number)} <span>${escapeHtml(formatTripType(flight.tripType))}</span></h4>
          ${renderStaffRow('Route', `${flight.from} -> ${flight.to}`)}
          ${renderStaffRow('Date', formatDate(flight.flightDate))}
          ${renderStaffRow('Time', `${flight.departure} -> ${flight.arrival}`)}
          ${renderStaffRow('Booking opens', formatDateTime(flight.bookingOpen))}
          ${renderStaffRow('Booking closes', formatDateTime(flight.bookingClose))}
          ${renderStaffRow('Booked', `${bookedPassengers} passenger booking(s)`)}
          ${renderStaffRow('Aircraft', flight.aircraft || getDefaultAircraftName())}
          ${renderStaffRow('Deletes', formatDate(flight.deleteOn))}
        </button>
        <button class="btn-danger" type="button" onclick="deleteFlight('${escapeAttr(flight.id)}')">Delete</button>
      </article>
    `;
  }).join('');
  renderStaffFlightDetail();
}

function renderStaffBookings() {
  const container = document.getElementById('staff-bookings');
  const counter = document.getElementById('staff-booking-count');
  if (!container) return;

  counter.textContent = `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`;
  const staffManager = renderGamepassSettingsManager() + renderStaffAccessManager();

  if (bookings.length === 0) {
    container.innerHTML = `${staffManager}<div class="empty-state">No passengers have booked flights yet.</div>`;
    return;
  }

  container.innerHTML = staffManager + [...bookings]
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
    .map((booking) => `
      <article class="staff-booking-card">
        <div class="staff-booking-body">
          <h4>${escapeHtml(booking.robloxName)} <span>${escapeHtml(booking.bookingNumber)}</span></h4>
          ${renderStaffRow('Flight', `${booking.flightNumber} | ${booking.from} -> ${booking.to}`)}
          ${renderStaffRow('Trip type', formatTripType(booking.tripType))}
          ${renderStaffRow('Passengers', booking.passengers)}
          ${renderStaffRow('Date', formatDate(booking.flightDate))}
          ${renderStaffRow('Return', booking.returnDate ? formatDate(booking.returnDate) : 'No return')}
          ${renderStaffRow('Terminal / Gate', `${booking.terminal} / ${booking.gate}`)}
          ${renderStaffRow('Priority', booking.priority ? 'Yes' : 'No')}
          ${renderStaffRow('Seat', booking.seat || 'Not assigned')}
          ${renderStaffRow('Status', booking.status)}
        </div>
        <button class="btn-danger" type="button" onclick="deleteStaffBooking('${escapeAttr(booking.id)}')">Delete booking</button>
      </article>
    `).join('');
}

function renderGamepassSettingsManager() {
  if (!isStaffOwner()) {
    return `
      <div class="staff-access-card">
        <strong>Roblox gamepasses</strong>
        <span>Only ${escapeHtml(STAFF_OWNER_NICK)} can change gamepass IDs and buy links.</span>
      </div>
    `;
  }

  return `
    <div class="staff-access-card">
      <div>
        <strong>Roblox gamepasses</strong>
        <span>Set the gamepass IDs used for priority boarding and manual seat selection.</span>
      </div>
      <form class="staff-inline-form" onsubmit="updateGamepassSettings(event)">
        <div class="form-row two-equal">
          <div class="form-group">
            <label for="priority-gamepass-id">Priority gamepass ID</label>
            <input id="priority-gamepass-id" type="text" inputmode="numeric" value="${escapeAttr(gamepassSettings.priorityGamePassId || '')}" placeholder="123456789">
          </div>
          <div class="form-group">
            <label for="priority-gamepass-url">Priority buy link</label>
            <input id="priority-gamepass-url" type="url" value="${escapeAttr(gamepassSettings.priorityGamePassUrl || '')}" placeholder="https://www.roblox.com/game-pass/123456789">
          </div>
        </div>
        <div class="form-row two-equal">
          <div class="form-group">
            <label for="seat-gamepass-id">Seat gamepass ID</label>
            <input id="seat-gamepass-id" type="text" inputmode="numeric" value="${escapeAttr(gamepassSettings.seatGamePassId || '')}" placeholder="987654321">
          </div>
          <div class="form-group">
            <label for="seat-gamepass-url">Seat buy link</label>
            <input id="seat-gamepass-url" type="url" value="${escapeAttr(gamepassSettings.seatGamePassUrl || '')}" placeholder="https://www.roblox.com/game-pass/987654321">
          </div>
        </div>
        <button class="btn-primary" type="submit">Save gamepasses</button>
      </form>
    </div>
  `;
}

function updateGamepassSettings(event) {
  event.preventDefault();
  if (!isStaffOwner()) return;

  gamepassSettings = normalizeGamepassSettings({
    priorityGamePassId: document.getElementById('priority-gamepass-id')?.value,
    priorityGamePassUrl: document.getElementById('priority-gamepass-url')?.value,
    seatGamePassId: document.getElementById('seat-gamepass-id')?.value,
    seatGamePassUrl: document.getElementById('seat-gamepass-url')?.value
  });
  gamepassOwnershipCache.clear();
  saveAppState();
  renderStaffBookings();
  showToast('Gamepass settings saved.', 'success');
}

function renderStaffAccessManager() {
  if (!isStaffOwner()) {
    return `
      <div class="staff-access-card">
        <strong>Staff access</strong>
        <span>Only ${escapeHtml(STAFF_OWNER_NICK)} can add or delete staff nicks.</span>
      </div>
    `;
  }

  return `
    <div class="staff-access-card">
      <div>
        <strong>Staff access</strong>
        <span>Add or delete Roblox names allowed to open this staff panel.</span>
      </div>
      <form class="staff-inline-form" onsubmit="addStaffNick(event)">
        <div class="form-row two">
          <div class="form-group">
            <label for="staff-nick">Roblox nick</label>
            <input id="staff-nick" type="text" placeholder="Player nick" required>
          </div>
          <button class="btn-primary" type="submit">Add nick</button>
        </div>
      </form>
      <div class="staff-nick-list">
        ${staffNicks.map((nick) => `
          <span class="staff-nick-chip">
            ${escapeHtml(nick)}
            ${nick.toLowerCase() === STAFF_OWNER_NICK.toLowerCase() ? '' : `<button type="button" onclick="removeStaffNick('${escapeAttr(nick)}')" aria-label="Remove ${escapeAttr(nick)}">x</button>`}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

function addStaffNick(event) {
  event.preventDefault();
  if (!isStaffOwner()) return;
  const input = document.getElementById('staff-nick');
  const nick = input.value.trim();
  if (!nick) return;
  if (staffNicks.some((item) => item.toLowerCase() === nick.toLowerCase())) {
    showToast('This nick is already allowed.', 'error');
    return;
  }
  staffNicks.push(nick);
  staffNicks = normalizeStaffNicks(staffNicks);
  input.value = '';
  saveAppState();
  renderStaffBookings();
  showToast('Staff nick added.', 'success');
}

function removeStaffNick(nick) {
  if (!isStaffOwner()) return;
  if (nick.toLowerCase() === STAFF_OWNER_NICK.toLowerCase()) return;
  staffNicks = normalizeStaffNicks(staffNicks.filter((item) => item.toLowerCase() !== nick.toLowerCase()));
  saveAppState();
  renderStaffBookings();
  showToast('Staff nick removed.', 'success');
}

function switchStaffTab(tabName) {
  activeStaffTab = ['flights', 'informations', 'aircraft', 'staff'].includes(tabName) ? tabName : 'flights';
  document.querySelectorAll('[data-staff-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.staffTab === activeStaffTab);
  });
  document.querySelectorAll('.staff-tab-panel').forEach((panel) => {
    panel.classList.remove('active');
  });
  document.getElementById(`staff-${activeStaffTab}-tab`)?.classList.add('active');

  if (activeStaffTab === 'flights') {
    renderStaffFlights();
  } else if (activeStaffTab === 'informations') {
    renderStaffInformations();
  } else if (activeStaffTab === 'aircraft') {
    renderStaffAircraft();
  } else {
    renderStaffBookings();
  }
}

function selectStaffFlight(flightId) {
  selectedStaffFlightId = flightId;
  renderStaffFlights();
  renderStaffFlightDetail();
}

function renderStaffFlightDetail() {
  const container = document.getElementById('staff-flight-detail');
  if (!container) return;

  const flight = flights.find((item) => String(item.id) === String(selectedStaffFlightId));
  if (!flight) {
    container.innerHTML = '<div class="empty-state">Choose a planned flight to see booked players and aircraft setup.</div>';
    return;
  }

  const flightBookings = bookings
    .filter((booking) => String(booking.flightId) === String(flight.id))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  const occupiedSeats = getOccupiedSeats(flight.id);

  container.innerHTML = `
    <div class="section-title-row">
      <h3>${escapeHtml(flight.number)}</h3>
      <div>
        <span>${escapeHtml(flightBookings.length)} booked</span>
        <button class="btn-secondary" type="button" onclick="openEditFlightModal('${escapeAttr(flight.id)}')">Edit</button>
      </div>
    </div>
    <div class="staff-detail-grid">
      ${renderInfoPill('Route', `${flight.from} -> ${flight.to}`)}
      ${renderInfoPill('Date', formatDate(flight.flightDate))}
      ${renderInfoPill('Aircraft', flight.aircraft || getDefaultAircraftName())}
      ${renderInfoPill('Seats taken', `${occupiedSeats.size}/${getAircraftSeats().length}`)}
      ${renderInfoPill('Booking opens', formatDateTime(flight.bookingOpen))}
      ${renderInfoPill('Booking closes', formatDateTime(flight.bookingClose))}
    </div>
    <div class="staff-aircraft-setup">
      <h4>Aircraft setup</h4>
      <div class="form-row two">
        <div class="form-group">
          <label for="staff-aircraft-select">Aircraft</label>
          <select id="staff-aircraft-select">
            ${renderAircraftOptions(flight.aircraft || getDefaultAircraftName())}
          </select>
        </div>
        <button class="btn-secondary" type="button" onclick="updateStaffAircraft('${escapeAttr(flight.id)}')">Save setup</button>
      </div>
    </div>
    <div class="staff-passenger-list">
      <h4>Booked Players</h4>
      ${
        flightBookings.length
          ? flightBookings.map((booking) => `
              <article class="staff-booking-card">
                <div class="staff-booking-body">
                  <h4>${escapeHtml(booking.robloxName)} <span>${escapeHtml(booking.bookingNumber)}</span></h4>
                  ${renderStaffRow('Seat', booking.seat || 'Not assigned')}
                  ${renderStaffRow('Priority', booking.priority ? 'Yes' : 'No')}
                  ${renderStaffRow('Passengers', booking.passengers)}
                  ${renderStaffRow('Status', booking.status)}
                </div>
                <button class="btn-danger" type="button" onclick="deleteStaffBooking('${escapeAttr(booking.id)}')">Delete booking</button>
              </article>
            `).join('')
          : '<div class="empty-state compact-empty">No players booked this flight yet.</div>'
      }
    </div>
  `;
}

function updateStaffAircraft(flightId) {
  const flight = flights.find((item) => String(item.id) === String(flightId));
  const select = document.getElementById('staff-aircraft-select');
  if (!flight || !select) return;
  flight.aircraft = select.value;
  bookings = bookings.map((booking) => (
    String(booking.flightId) === String(flightId)
      ? { ...booking, aircraft: flight.aircraft }
      : booking
  ));
  saveAppState();
  renderSchedule();
  renderHomeFlight();
  renderBookings();
  renderStaffFlights();
  renderStaffFlightDetail();
  showToast('Aircraft setup saved.', 'success');
}

function addStaffAirport(event) {
  event.preventDefault();
  const airport = normalizeAirport({
    type: document.getElementById('airport-type').value,
    name: document.getElementById('airport-name').value,
    code: document.getElementById('airport-code').value,
    country: document.getElementById('airport-country').value,
    lat: document.getElementById('airport-lat').value,
    lon: document.getElementById('airport-lon').value
  });
  if (!airport || Number.isNaN(airport.lat) || Number.isNaN(airport.lon)) {
    showToast('Fill airport name, code, country, latitude, and longitude.', 'error');
    return;
  }
  if (getAllAirports().some((item) => item.code.toLowerCase() === airport.code.toLowerCase())) {
    showToast('Airport code already exists.', 'error');
    return;
  }
  if (airport.type === 'base') {
    originAirports.push(airport);
  } else {
    destinationAirports.push(airport);
  }
  saveAppState();
  populateAirportSelects();
  renderMaps();
  renderAirportList();
  renderStaffInformations();
  showToast(`${airport.name} added.`, 'success');
}

function updateAirportName(key) {
  const [type, code] = key.split('|');
  const list = type === 'destination' ? destinationAirports : originAirports;
  const airport = list.find((item) => item.code === code);
  const input = document.getElementById(`airport-edit-${code}`);
  if (!airport || !input) return;
  const oldName = airport.name;
  const newName = input.value.trim();
  if (!newName) {
    showToast('Airport name cannot be empty.', 'error');
    return;
  }
  airport.name = newName;
  renameAirportReferences(oldName, newName);
  saveAppState();
  populateAirportSelects();
  renderHomeFlight();
  renderSchedule();
  renderBookings();
  renderMaps();
  renderAirportList();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffInformations();
  showToast('Airport updated.', 'success');
}

function renameAirportReferences(oldName, newName) {
  flights = flights.map((flight) => ({
    ...flight,
    from: flight.from === oldName ? newName : flight.from,
    to: flight.to === oldName ? newName : flight.to
  }));
  bookings = bookings.map((booking) => ({
    ...booking,
    from: booking.from === oldName ? newName : booking.from,
    to: booking.to === oldName ? newName : booking.to
  }));
  if (selectedAirport === oldName) selectedAirport = newName;
  if (activeScheduleFilter?.from === oldName) activeScheduleFilter.from = newName;
  if (activeScheduleFilter?.to === oldName) activeScheduleFilter.to = newName;
}

function addStaffAircraft(event) {
  event.preventDefault();
  const input = document.getElementById('aircraft-name');
  const aircraft = normalizeAircraft({ name: input.value });
  if (!aircraft) {
    showToast('Aircraft name cannot be empty.', 'error');
    return;
  }
  if (aircraftOptions.some((item) => item.name.toLowerCase() === aircraft.name.toLowerCase())) {
    showToast('Aircraft already exists.', 'error');
    return;
  }
  aircraftOptions.push(aircraft);
  input.value = '';
  saveAppState();
  populateAircraftSelects();
  renderStaffAircraft();
  showToast('Aircraft added.', 'success');
}

function updateAircraftName(index) {
  const aircraft = aircraftOptions[index];
  const input = document.getElementById(`aircraft-edit-${index}`);
  if (!aircraft || !input) return;
  const oldName = aircraft.name;
  const newName = input.value.trim();
  if (!newName) {
    showToast('Aircraft name cannot be empty.', 'error');
    return;
  }
  aircraft.name = newName;
  flights = flights.map((flight) => (
    flight.aircraft === oldName ? { ...flight, aircraft: newName } : flight
  ));
  bookings = bookings.map((booking) => (
    booking.aircraft === oldName ? { ...booking, aircraft: newName } : booking
  ));
  saveAppState();
  populateAircraftSelects();
  renderSchedule();
  renderHomeFlight();
  renderBookings();
  renderStaffFlights();
  renderStaffFlightDetail();
  renderStaffAircraft();
  showToast('Aircraft updated.', 'success');
}

function renderAircraftOptions(selectedAircraft = '') {
  return getAircraftOptions().map((aircraft) => (
    `<option value="${escapeAttr(aircraft.name)}" ${aircraft.name === selectedAircraft ? 'selected' : ''}>${escapeHtml(aircraft.name)}</option>`
  )).join('');
}

function renderStaffInformations() {
  const container = document.getElementById('staff-informations');
  const counter = document.getElementById('staff-information-count');
  if (!container) return;
  const airports = getAllAirports();
  if (counter) counter.textContent = `${airports.length} airports`;
  container.innerHTML = `
    <form class="staff-inline-form" onsubmit="addStaffAirport(event)">
      <div class="form-row four">
        <div class="form-group">
          <label for="airport-type">Type</label>
          <select id="airport-type">
            <option value="base">England base</option>
            <option value="destination">Destination</option>
          </select>
        </div>
        <div class="form-group">
          <label for="airport-name">Airport name</label>
          <input id="airport-name" type="text" placeholder="New airport" required>
        </div>
        <div class="form-group">
          <label for="airport-code">Code</label>
          <input id="airport-code" type="text" placeholder="ABC" maxlength="4" required>
        </div>
        <div class="form-group">
          <label for="airport-country">Country</label>
          <input id="airport-country" type="text" placeholder="Country" required>
        </div>
      </div>
      <div class="form-row three">
        <div class="form-group">
          <label for="airport-lat">Latitude</label>
          <input id="airport-lat" type="number" step="0.001" placeholder="51.886" required>
        </div>
        <div class="form-group">
          <label for="airport-lon">Longitude</label>
          <input id="airport-lon" type="number" step="0.001" placeholder="0.238" required>
        </div>
        <button class="btn-primary" type="submit">Add airport</button>
      </div>
    </form>
    <div class="staff-edit-list">
      ${airports.map(renderEditableAirport).join('')}
    </div>
  `;
}

function renderEditableAirport(airport) {
  const key = `${airport.type}|${airport.code}`;
  return `
    <article class="editable-item">
      <div>
        <strong>${escapeHtml(airport.code)}</strong>
        <span>${escapeHtml(airport.type === 'base' ? 'England base' : airport.country)}</span>
      </div>
      <div class="editable-fields">
        <input id="airport-edit-${escapeAttr(airport.code)}" type="text" value="${escapeAttr(airport.name)}" aria-label="${escapeAttr(airport.name)} name">
        <button class="btn-secondary" type="button" onclick="updateAirportName('${escapeAttr(key)}')">Save</button>
      </div>
    </article>
  `;
}

function renderStaffAircraft() {
  const container = document.getElementById('staff-aircraft');
  const counter = document.getElementById('staff-aircraft-count');
  if (!container) return;
  const aircraft = getAircraftOptions();
  if (counter) counter.textContent = `${aircraft.length} aircraft`;
  container.innerHTML = `
    <form class="staff-inline-form" onsubmit="addStaffAircraft(event)">
      <div class="form-row two">
        <div class="form-group">
          <label for="aircraft-name">Aircraft name</label>
          <input id="aircraft-name" type="text" placeholder="Boeing 737-800 Jet2" required>
        </div>
        <button class="btn-primary" type="submit">Add aircraft</button>
      </div>
    </form>
    <div class="staff-edit-list">
      ${aircraft.map((item, index) => `
        <article class="editable-item">
          <div>
            <strong>Aircraft</strong>
            <span>Available in flight planning</span>
          </div>
          <div class="editable-fields">
            <input id="aircraft-edit-${index}" type="text" value="${escapeAttr(item.name)}" aria-label="${escapeAttr(item.name)} name">
            <button class="btn-secondary" type="button" onclick="updateAircraftName(${index})">Save</button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderMaps() {
  renderMap('home-map', true);
  renderMap('route-map', false);
}

function renderMap(containerId, compact) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const routes = getRoutesForMap();
  const connectedAirports = new Set();
  routes.forEach((route) => {
    connectedAirports.add(route.from);
    connectedAirports.add(route.to);
  });

  container.innerHTML = `
    <div class="real-route-map ${compact ? 'compact-real-map' : ''}">
      <div class="map-tile-layer" aria-hidden="true">
        ${renderMapTiles()}
      </div>
      <div class="map-scrim"></div>
      <svg class="route-overlay" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${renderFallbackLand()}
        ${routes.map((route, index) => renderRouteLine(route, index, containerId)).join('')}
      </svg>
      <div class="map-pins">
        ${getAllAirports().map((airport) => renderAirportPin(airport, connectedAirports)).join('')}
      </div>
      <div class="map-caption">
        <strong>${escapeHtml(selectedAirport)}</strong>
        <span>${routes.length ? `${routes.length} planned route(s)` : 'No planned routes'}</span>
      </div>
      <div class="map-credit">Map data OpenStreetMap</div>
    </div>
  `;
}

function renderFallbackLand() {
  const shapes = [
    [
      [-10, 36], [-9, 43], [-5, 48], [0, 51], [5, 53], [11, 54], [18, 55],
      [25, 54], [33, 50], [36, 44], [31, 40], [24, 38], [18, 39], [14, 42],
      [9, 44], [4, 43], [-1, 43], [-5, 40], [-8, 37]
    ],
    [
      [-6, 50], [-7, 55], [-4, 58], [1, 58], [2, 54], [1, 51], [-2, 50]
    ],
    [
      [-10, 51], [-10, 55], [-7, 56], [-6, 53], [-8, 51]
    ],
    [
      [-25, 63], [-21, 66], [-16, 65], [-13, 63], [-18, 62]
    ],
    [
      [5, 55], [8, 62], [14, 66], [25, 66], [31, 61], [25, 56], [15, 55]
    ],
    [
      [7, 44], [10, 45], [13, 42], [15, 39], [18, 38], [17, 41], [14, 43], [12, 46], [9, 46]
    ],
    [
      [19, 39], [24, 41], [27, 39], [25, 36], [20, 36]
    ],
    [
      [-18, 33], [-14, 34], [-10, 32], [-12, 29], [-17, 28], [-20, 30]
    ],
    [
      [-12, 35], [-5, 35], [5, 34], [14, 33], [25, 32], [35, 31], [36, 27], [-25, 27], [-22, 31]
    ]
  ];

  return shapes.map((points) => (
    `<path class="fallback-land" d="${pointsToPath(points)}"></path>`
  )).join('');
}

function pointsToPath(points) {
  return points.map((point, index) => {
    const projected = projectGeoPoint(point[0], point[1]);
    return `${index === 0 ? 'M' : 'L'} ${projected.x} ${projected.y}`;
  }).join(' ') + ' Z';
}

function projectGeoPoint(lon, lat) {
  const projection = getMapProjection();
  const xPercent = ((lonToTileX(lon) - projection.xMin) / projection.xRange) * 100;
  const yPercent = ((latToTileY(lat) - projection.yMin) / projection.yRange) * 100;
  return {
    x: (xPercent / 100) * 1000,
    y: (yPercent / 100) * 620
  };
}

function renderMapTiles() {
  const projection = getMapProjection();
  const xStart = Math.floor(projection.xMin);
  const xEnd = Math.floor(projection.xMax);
  const yStart = Math.floor(projection.yMin);
  const yEnd = Math.floor(projection.yMax);
  let html = '';

  for (let x = xStart; x <= xEnd; x += 1) {
    for (let y = yStart; y <= yEnd; y += 1) {
      const left = ((x - projection.xMin) / projection.xRange) * 100;
      const top = ((y - projection.yMin) / projection.yRange) * 100;
      const width = (1 / projection.xRange) * 100;
      const height = (1 / projection.yRange) * 100;
      html += `
        <img
          class="map-tile"
          alt=""
          loading="eager"
          fetchpriority="high"
          decoding="async"
          referrerpolicy="no-referrer"
          src="https://tile.openstreetmap.org/${MAP_ZOOM}/${x}/${y}.png"
          style="left:${left}%; top:${top}%; width:${width}%; height:${height}%;">
      `;
    }
  }

  return html;
}

function renderRouteLine(route, index, mapId) {
  const start = projectAirport(getAirport(route.from));
  const end = projectAirport(getAirport(route.to));
  const controlX = (start.x + end.x) / 2;
  const controlY = Math.min(start.y, end.y) - 70;
  const pathId = `${mapId}-route-path-${index}`;

  return `
    <path id="${pathId}" class="route-line" d="M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}"></path>
    <g class="route-plane-marker">
      <path d="M -8 -4 L 10 0 L -8 4 L -4 0 Z"></path>
      <animateMotion dur="5.5s" repeatCount="indefinite" rotate="auto">
        <mpath href="#${pathId}" xlink:href="#${pathId}"></mpath>
      </animateMotion>
    </g>
  `;
}

function renderAirportPin(airport, connectedAirports) {
  const point = projectAirport(airport);
  const isSelected = airport.name === selectedAirport;
  const isConnected = connectedAirports.has(airport.name);
  const classes = [
    'map-airport-pin',
    airport.type === 'base' ? 'base' : 'destination',
    isSelected ? 'selected' : '',
    isConnected ? 'connected' : '',
    point.xPercent > 78 ? 'label-left' : '',
    point.yPercent > 86 ? 'label-up' : '',
    point.yPercent < 12 ? 'label-down' : ''
  ].filter(Boolean).join(' ');

  return `
    <button
      class="${classes}"
      type="button"
      style="--x:${point.xPercent}%; --y:${point.yPercent}%;"
      onclick="selectMapAirport('${escapeAttr(airport.name)}')"
      title="${escapeAttr(airport.name)}">
      <span class="pin-dot"></span>
      <span class="pin-label">${escapeHtml(airport.name)}</span>
    </button>
  `;
}

function selectMapAirport(name) {
  selectedAirport = name;
  renderMaps();
  renderAirportList();
  renderAirportFlights(name);
  showToast(`${name} selected on the route map.`, 'success');
}

function renderAirportFlights(airportName) {
  const panel = document.getElementById('airport-flights-panel');
  const listContainer = document.getElementById('airport-flights-list');
  const titleElement = document.getElementById('airport-flights-title');
  if (!panel || !listContainer) return;

  const airportFlights = flights.filter((flight) =>
    flight.from === airportName || flight.to === airportName
  );

  titleElement.textContent = `${airportName} Flights`;

  if (airportFlights.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No flights for this airport.</div>';
    panel.classList.remove('hidden');
    return;
  }

  listContainer.innerHTML = airportFlights.map((flight) => `
    <div class="airport-flight-item">
      <strong>${escapeHtml(flight.number)}</strong>
      <span class="airport-flight-item-route">${escapeHtml(flight.from)} → ${escapeHtml(flight.to)}</span>
      <span>${formatDate(flight.flightDate)}</span>
      <span>${escapeHtml(flight.departure)} - ${escapeHtml(flight.arrival)}</span>
      <div class="airport-flight-item-booking">
        <button type="button" onclick="navigateToScheduleAndBook('${escapeAttr(flight.from)}', '${escapeAttr(flight.to)}', '${escapeAttr(flight.flightDate)}')">
          Book Now
        </button>
      </div>
    </div>
  `).join('');

  panel.classList.remove('hidden');
}

function closeAirportFlightsPanel() {
  const panel = document.getElementById('airport-flights-panel');
  if (panel) panel.classList.add('hidden');
}

function navigateToScheduleAndBook(from, to, date) {
  const flight = flights.find((item) => (
    item.from === from &&
    item.to === to &&
    item.flightDate === date
  ));
  const tripType = flight?.tripType || 'one-way';
  const fromSelect = document.getElementById('quick-from');
  const toSelect = document.getElementById('quick-to');
  const dateInput = document.getElementById('quick-date');
  const returnInput = document.getElementById('quick-return-date');
  const passengerSelect = document.getElementById('quick-passengers');
  const tripInput = document.querySelector(`input[name="quick-trip-type"][value="${tripType}"]`);

  if (tripInput) tripInput.checked = true;
  if (fromSelect) fromSelect.value = from;
  if (toSelect) toSelect.value = to;
  if (dateInput) dateInput.value = date;
  if (returnInput) returnInput.value = flight?.returnDate || '';
  toggleReturnDateField();
  refreshCustomAirportSelects();

  activeScheduleFilter = {
    tripType,
    from,
    to,
    departureDate: date,
    returnDate: flight?.returnDate || '',
    passengers: passengerSelect?.value || '1 Passenger'
  };
  selectedAirport = from;
  renderSchedule();
  renderMaps();
  renderAirportList();
  switchView('schedule');
  closeAirportFlightsPanel();
  showToast('Flight opened in Schedule.', 'success');
}

function renderAirportList() {
  const container = document.getElementById('airport-list');
  if (!container) return;

  container.innerHTML = getAllAirports().map((airport) => `
    <button class="airport-chip ${airport.type === 'base' ? 'base' : ''} ${airport.name === selectedAirport ? 'selected' : ''}" type="button" onclick="selectMapAirport('${escapeAttr(airport.name)}')">
      <strong>${escapeHtml(airport.name)}</strong>
      <span>${escapeHtml(airport.type === 'base' ? 'England base' : airport.country)}</span>
    </button>
  `).join('');
}

function renderFeaturedDestinations() {
  const container = document.getElementById('featured-destinations');
  if (!container) return;

  container.innerHTML = FEATURED_DESTINATIONS.map((destination) => `
    <article class="destination-card">
      <div class="destination-image" style="--image: ${escapeAttr(destination.image)}"></div>
      <div class="destination-meta">
        <div>
          <strong>${escapeHtml(destination.name)}</strong>
          <span>${escapeHtml(destination.country)}</span>
        </div>
        <div class="destination-rating">${escapeHtml(destination.rating)} *</div>
      </div>
    </article>
  `).join('');
}

function populateAirportSelects() {
  fillSelect('quick-from', getOriginAirports(), 'Enter your airport');
  fillSelect('flight-from', getOriginAirports(), 'Select origin');
  fillSelect('quick-to', getDestinationAirports(), 'Where to go');
  fillSelect('flight-to', getDestinationAirports(), 'Select destination');
  populateAircraftSelects();
  refreshCustomAirportSelects();
}

function populateAircraftSelects() {
  const select = document.getElementById('flight-aircraft');
  if (!select) return;
  select.innerHTML = renderAircraftOptions(select.value || getDefaultAircraftName());
}

function fillSelect(id, airports, placeholder) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` + airports.map((airport) => (
    `<option value="${escapeAttr(airport.name)}">${escapeHtml(airport.name)} (${escapeHtml(airport.code)})</option>`
  )).join('');
}

function refreshCustomAirportSelects() {
  CUSTOM_AIRPORT_SELECT_IDS.forEach(setupCustomAirportSelect);
}

function setupCustomAirportSelect(id) {
  const select = document.getElementById(id);
  if (!select) return;

  select.required = false;
  select.classList.add('native-airport-select');

  let custom = select.parentElement?.querySelector(`.custom-airport-select[data-select-id="${id}"]`);
  if (!custom) {
    custom = document.createElement('div');
    custom.className = 'custom-airport-select';
    custom.dataset.selectId = id;
    custom.innerHTML = `
      <button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span class="custom-select-value"></span>
        <span class="custom-select-arrow" aria-hidden="true"></span>
      </button>
      <div class="custom-select-options" role="listbox"></div>
    `;
    select.insertAdjacentElement('afterend', custom);

    custom.querySelector('.custom-select-trigger')?.addEventListener('click', () => {
      closeCustomAirportSelects(custom);
      const isOpen = custom.classList.toggle('open');
      custom.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (!select.dataset.customSelectBound) {
    select.addEventListener('change', () => syncCustomAirportSelect(select, custom));
    select.dataset.customSelectBound = 'true';
  }

  const options = custom.querySelector('.custom-select-options');
  if (!options) return;

  options.innerHTML = Array.from(select.options).map((option) => `
    <button
      class="custom-select-option ${option.value === select.value ? 'selected' : ''}"
      type="button"
      role="option"
      aria-selected="${option.value === select.value}"
      data-value="${escapeAttr(option.value)}">
      ${escapeHtml(option.textContent)}
    </button>
  `).join('');

  options.querySelectorAll('.custom-select-option').forEach((optionButton) => {
    optionButton.addEventListener('click', () => {
      select.value = optionButton.dataset.value || '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closeCustomAirportSelects();
    });
  });

  syncCustomAirportSelect(select, custom);
  bindCustomAirportSelectClose();
}

function syncCustomAirportSelect(select, custom) {
  if (!select || !custom) return;

  const selectedOption = select.options[select.selectedIndex] || select.options[0];
  const label = selectedOption?.textContent || 'Choose airport';
  const value = custom.querySelector('.custom-select-value');
  if (value) value.textContent = label;

  custom.querySelectorAll('.custom-select-option').forEach((optionButton) => {
    const isSelected = optionButton.dataset.value === select.value;
    optionButton.classList.toggle('selected', isSelected);
    optionButton.setAttribute('aria-selected', String(isSelected));
  });
}

function bindCustomAirportSelectClose() {
  if (document.body.dataset.customAirportSelectCloseBound) return;

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-airport-select')) {
      closeCustomAirportSelects();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCustomAirportSelects();
  });

  document.body.dataset.customAirportSelectCloseBound = 'true';
}

function closeCustomAirportSelects(except = null) {
  document.querySelectorAll('.custom-airport-select.open').forEach((custom) => {
    if (custom === except) return;
    custom.classList.remove('open');
    custom.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function refreshStaffDateTimeControls() {
  CUSTOM_STAFF_DATE_TIME_IDS.forEach(setupStaffDateTimeControl);
}

function setupStaffDateTimeControl(id) {
  const input = document.getElementById(id);
  if (!input) return;

  const type = input.getAttribute('type');
  if (!['date', 'time', 'datetime-local'].includes(type)) return;

  if (input.required) {
    input.dataset.originalRequired = 'true';
    input.required = false;
  }
  input.classList.add('native-date-time-input');

  let custom = input.parentElement?.querySelector(`.custom-date-time-control[data-input-id="${id}"]`);
  if (!custom) {
    custom = document.createElement('div');
    custom.className = `custom-date-time-control custom-date-time-${type.replace('-local', '')}`;
    custom.dataset.inputId = id;
    custom.innerHTML = `
      <button class="custom-date-time-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">
        <span class="custom-date-time-value"></span>
        <span class="custom-date-time-icon" aria-hidden="true">${type === 'time' ? 'HH' : 'DD'}</span>
      </button>
      <div class="custom-date-time-panel"></div>
    `;
    input.insertAdjacentElement('afterend', custom);

    custom.querySelector('.custom-date-time-trigger')?.addEventListener('click', () => {
      closeStaffDateTimeControls(custom);
      closeCustomAirportSelects();
      const isOpen = custom.classList.toggle('open');
      custom.querySelector('.custom-date-time-trigger')?.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (!input.dataset.customDateTimeBound) {
    input.addEventListener('change', () => syncStaffDateTimeControl(input, custom));
    input.dataset.customDateTimeBound = 'true';
  }

  renderStaffDateTimePanel(input, custom);
  syncStaffDateTimeControl(input, custom);
  bindStaffDateTimeClose();
}

function renderStaffDateTimePanel(input, custom) {
  const type = input.getAttribute('type');
  const panel = custom.querySelector('.custom-date-time-panel');
  if (!panel) return;

  const state = getStaffDateTimeState(input);
  const maxDay = getDaysInMonth(state.year, state.month);
  const selectedDay = Math.min(state.day, maxDay);
  const dateFields = type === 'date' || type === 'datetime-local'
    ? `
      ${renderStaffDateTimePart('day', 'Day', renderNumberOptions(1, maxDay, selectedDay), selectedDay)}
      ${renderStaffDateTimePart('month', 'Month', renderNumberOptions(1, 12, state.month), state.month)}
      ${renderStaffDateTimePart('year', 'Year', renderYearOptions(state.year), state.year)}
    `
    : '';
  const timeFields = type === 'time' || type === 'datetime-local'
    ? `
      ${renderStaffDateTimePart('hour', 'Hour', renderNumberOptions(0, 23, state.hour), state.hour)}
      ${renderStaffDateTimePart('minute', 'Minute', renderNumberOptions(0, 59, state.minute), state.minute)}
    `
    : '';

  panel.innerHTML = `
    <div class="custom-date-time-grid">
      ${dateFields}
      ${timeFields}
    </div>
    <div class="custom-date-time-actions">
      <button type="button" data-action="now">${type === 'time' ? 'Now' : 'Today'}</button>
      <button type="button" data-action="done">Done</button>
    </div>
  `;

  panel.querySelectorAll('.custom-date-time-part-trigger').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const part = button.closest('.custom-date-time-part');
      closeStaffDateTimePartMenus(custom, part);
      const isOpen = part?.classList.toggle('part-open') || false;
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  panel.querySelectorAll('.custom-date-time-part-option').forEach((option) => {
    option.addEventListener('click', (event) => {
      event.stopPropagation();
      const part = option.closest('.custom-date-time-part');
      const trigger = part?.querySelector('.custom-date-time-part-trigger');
      if (!part || !trigger) return;

      trigger.dataset.value = option.dataset.value || '';
      trigger.textContent = option.textContent || '';
      part.querySelectorAll('.custom-date-time-part-option').forEach((button) => {
        const isSelected = button === option;
        button.classList.toggle('selected', isSelected);
        button.setAttribute('aria-selected', String(isSelected));
      });
      closeStaffDateTimePartMenus(custom);
      setStaffDateTimeValueFromPanel(input, custom);
    });
  });

  panel.querySelector('[data-action="now"]')?.addEventListener('click', () => {
    setStaffDateTimeToNow(input, custom);
  });

  panel.querySelector('[data-action="done"]')?.addEventListener('click', () => {
    closeStaffDateTimeControls();
  });
}

function renderStaffDateTimePart(name, label, optionsHtml, selected) {
  const value = name === 'year'
    ? String(selected)
    : String(selected).padStart(2, '0');

  return `
    <div class="custom-date-time-part" data-part-name="${escapeAttr(name)}">
      <span>${escapeHtml(label)}</span>
      <button
        class="custom-date-time-part-trigger"
        type="button"
        data-part="${escapeAttr(name)}"
        data-value="${escapeAttr(value)}"
        aria-haspopup="listbox"
        aria-expanded="false">
        ${escapeHtml(value)}
      </button>
      <div class="custom-date-time-part-options" role="listbox">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function getStaffDateTimeState(input) {
  const type = input.getAttribute('type');
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();

  if (input.value) {
    if (type === 'date') {
      const parsed = parseInputDate(input.value);
      ({ year, month, day } = parsed);
    } else if (type === 'time') {
      const parsed = parseInputTime(input.value);
      ({ hour, minute } = parsed);
    } else if (type === 'datetime-local') {
      const [datePart, timePart] = input.value.split('T');
      const parsedDate = parseInputDate(datePart);
      const parsedTime = parseInputTime(timePart);
      ({ year, month, day } = parsedDate);
      ({ hour, minute } = parsedTime);
    }
  }

  return { year, month, day, hour, minute };
}

function parseInputDate(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  const now = new Date();
  return {
    year: year || now.getFullYear(),
    month: month || now.getMonth() + 1,
    day: day || now.getDate()
  };
}

function parseInputTime(value) {
  const [hour, minute] = String(value || '').split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0
  };
}

function renderNumberOptions(start, end, selected) {
  let html = '';
  for (let value = start; value <= end; value += 1) {
    const label = String(value).padStart(2, '0');
    const isSelected = value === Number(selected);
    html += `
      <button
        class="custom-date-time-part-option ${isSelected ? 'selected' : ''}"
        type="button"
        role="option"
        aria-selected="${isSelected}"
        data-value="${escapeAttr(label)}">
        ${escapeHtml(label)}
      </button>
    `;
  }
  return html;
}

function renderYearOptions(selected) {
  const currentYear = new Date().getFullYear();
  const start = Math.min(currentYear - 1, Number(selected) || currentYear);
  const end = Math.max(currentYear + 8, Number(selected) || currentYear);
  let html = '';
  for (let year = start; year <= end; year += 1) {
    const isSelected = year === Number(selected);
    html += `
      <button
        class="custom-date-time-part-option ${isSelected ? 'selected' : ''}"
        type="button"
        role="option"
        aria-selected="${isSelected}"
        data-value="${year}">
        ${year}
      </button>
    `;
  }
  return html;
}

function getDaysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate();
}

function setStaffDateTimeValueFromPanel(input, custom) {
  const type = input.getAttribute('type');
  const part = (name) => custom.querySelector(`.custom-date-time-part-trigger[data-part="${name}"]`)?.dataset.value;
  const year = part('year');
  const month = part('month');
  const hour = part('hour');
  const minute = part('minute');
  const dateValue = year && month
    ? `${year}-${month}-${String(Math.min(Number(part('day')), getDaysInMonth(year, month))).padStart(2, '0')}`
    : '';

  if (type === 'date') {
    input.value = dateValue;
  } else if (type === 'time') {
    input.value = `${hour}:${minute}`;
  } else if (type === 'datetime-local') {
    input.value = `${dateValue}T${hour}:${minute}`;
  }

  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function setStaffDateTimeToNow(input, custom) {
  const now = new Date();
  const type = input.getAttribute('type');
  if (type === 'date') {
    input.value = formatDateTimeInput(now).slice(0, 10);
  } else if (type === 'time') {
    input.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  } else {
    input.value = formatDateTimeInput(now);
  }
  input.dispatchEvent(new Event('change', { bubbles: true }));
  renderStaffDateTimePanel(input, custom);
  syncStaffDateTimeControl(input, custom);
}

function syncStaffDateTimeControl(input, custom) {
  if (!input || !custom) return;

  const value = custom.querySelector('.custom-date-time-value');
  if (value) {
    value.textContent = input.value
      ? formatStaffDateTimeValue(input)
      : getStaffDateTimePlaceholder(input);
    value.classList.toggle('placeholder', !input.value);
  }

  renderStaffDateTimePanel(input, custom);
}

function formatStaffDateTimeValue(input) {
  const type = input.getAttribute('type');
  if (type === 'date') return formatDisplayDate(input.value);
  if (type === 'time') return input.value;
  const [datePart, timePart] = input.value.split('T');
  return `${formatDisplayDate(datePart)} ${timePart || ''}`.trim();
}

function formatDisplayDate(value) {
  const { year, month, day } = parseInputDate(value);
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function getStaffDateTimePlaceholder(input) {
  const type = input.getAttribute('type');
  if (type === 'date') return 'Choose date';
  if (type === 'time') return 'Choose time';
  return 'Choose date and time';
}

function bindStaffDateTimeClose() {
  if (document.body.dataset.staffDateTimeCloseBound) return;

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-date-time-control')) {
      closeStaffDateTimeControls();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeStaffDateTimeControls();
  });

  document.body.dataset.staffDateTimeCloseBound = 'true';
}

function closeStaffDateTimeControls(except = null) {
  document.querySelectorAll('.custom-date-time-control.open').forEach((custom) => {
    if (custom === except) return;
    closeStaffDateTimePartMenus(custom);
    custom.classList.remove('open');
    custom.querySelector('.custom-date-time-trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function closeStaffDateTimePartMenus(custom, except = null) {
  const scope = custom || document;
  scope.querySelectorAll('.custom-date-time-part.part-open').forEach((part) => {
    if (part === except) return;
    part.classList.remove('part-open');
    part.querySelector('.custom-date-time-part-trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  document.querySelectorAll('[data-view]').forEach((link) => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  const view = document.getElementById(`${viewName}-view`);
  if (view) view.classList.add('active');

  if (viewName === 'schedule') renderSchedule();
  if (viewName === 'bookings') renderBookings();
}

function getVisibleFlights() {
  if (!activeScheduleFilter) return flights;
  return flights.filter((flight) => (
    flight.from === activeScheduleFilter.from &&
    flight.to === activeScheduleFilter.to &&
    flight.tripType === activeScheduleFilter.tripType &&
    flight.flightDate === activeScheduleFilter.departureDate
  ));
}

function getBookingWindowState(flight) {
  const now = new Date();
  const opensAt = new Date(flight.bookingOpen || dateTimeOffset(-1));
  const closesAt = new Date(flight.bookingClose || `${flight.flightDate}T${flight.departure || '23:59'}`);

  if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime())) {
    return { state: 'open', opensAt: null, closesAt: null };
  }

  if (now < opensAt) return { state: 'upcoming', opensAt, closesAt };
  if (now > closesAt) return { state: 'closed', opensAt, closesAt };
  return { state: 'open', opensAt, closesAt };
}

function isBookingAlertSet(flightId) {
  return Boolean(currentUser && bookingAlerts.some((alert) => (
    alert.userId === currentUser.id &&
    String(alert.flightId) === String(flightId) &&
    !alert.delivered
  )));
}

async function subscribeBookingAlert(flightId) {
  if (!currentUser) {
    showToast('Login before setting booking alerts.', 'error');
    return;
  }

  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight) {
    showToast('This flight is no longer available.', 'error');
    renderSchedule();
    return;
  }

  const bookingWindow = getBookingWindowState(flight);
  if (bookingWindow.state === 'open') {
    bookFlight(flightId);
    return;
  }
  if (bookingWindow.state === 'closed') {
    showToast('Booking for this flight is closed.', 'error');
    renderSchedule();
    return;
  }

  if (!isBookingAlertSet(flightId)) {
    bookingAlerts.push({
      flightId: String(flightId),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      delivered: false
    });
    saveAppState();
  }

  await requestNotificationPermission();
  scheduleBookingAlerts();
  renderSchedule();
  showToast(`Alert set for ${flight.number}.`, 'success');
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (error) {
      return false;
    }
  }
  return Notification.permission === 'granted';
}

function scheduleBookingAlerts() {
  bookingAlertTimers.forEach((timerId) => window.clearTimeout(timerId));
  bookingAlertTimers = [];
  if (!currentUser) return;

  bookingAlerts
    .filter((alert) => alert.userId === currentUser.id && !alert.delivered)
    .forEach((alert) => {
      const flight = flights.find((item) => String(item.id) === String(alert.flightId));
      if (!flight) return;

      const bookingWindow = getBookingWindowState(flight);
      if (bookingWindow.state === 'open') {
        notifyBookingOpen(alert.flightId);
        return;
      }
      if (bookingWindow.state !== 'upcoming' || !bookingWindow.opensAt) return;

      const delay = bookingWindow.opensAt.getTime() - Date.now();
      const timerId = window.setTimeout(() => notifyBookingOpen(alert.flightId), Math.min(delay, 2147483647));
      bookingAlertTimers.push(timerId);
    });
}

function notifyBookingOpen(flightId) {
  const flight = flights.find((item) => String(item.id) === String(flightId));
  if (!flight || !currentUser) return;

  bookingAlerts = bookingAlerts.map((alert) => (
    alert.userId === currentUser.id && String(alert.flightId) === String(flightId)
      ? { ...alert, delivered: true }
      : alert
  ));
  saveAppState();
  renderSchedule();

  const title = `Booking open: ${flight.number}`;
  const body = `${flight.from} to ${flight.to} is ready to book.`;
  showToast(body, 'success');
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function getRoutesForMap() {
  const selected = getAirport(selectedAirport);
  let routeFlights = flights;

  if (selected?.type === 'base') {
    routeFlights = flights.filter((flight) => flight.from === selectedAirport);
  } else if (selected?.type === 'destination') {
    routeFlights = flights.filter((flight) => flight.to === selectedAirport);
  }

  const seen = new Set();
  return routeFlights
    .filter((flight) => getAirport(flight.from) && getAirport(flight.to))
    .filter((flight) => {
      const key = `${flight.from}|${flight.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((flight) => ({ from: flight.from, to: flight.to }));
}

function getCurrentUserBooking() {
  if (!currentUser) return null;
  return bookings.find((booking) => booking.userId === currentUser.id) || null;
}

function purgeExpiredFlights() {
  const before = flights.length;
  const activeFlightIds = new Set();
  flights = flights.filter((flight) => {
    const keep = !isFlightExpired(flight);
    if (keep) activeFlightIds.add(String(flight.id));
    return keep;
  });
  bookings = bookings.filter((booking) => activeFlightIds.has(String(booking.flightId)));
  if (before !== flights.length) {
    saveAppState();
  }
}

function isFlightExpired(flight) {
  if (!flight.deleteOn) return false;
  return new Date(`${flight.deleteOn}T23:59:59`) < new Date();
}

function isDateBeforeToday(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateString}T00:00:00`) < today;
}

function sortFlightsByDate(a, b) {
  const aDate = new Date(`${a.flightDate || '2099-01-01'}T${a.departure || '00:00'}`);
  const bDate = new Date(`${b.flightDate || '2099-01-01'}T${b.departure || '00:00'}`);
  return aDate - bDate;
}

function generateBookingNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const code = `${randomChars(letters, 3)}${randomChars(digits, 3)}${randomChars(letters, 1)}`;
    if (!bookings.some((booking) => booking.bookingNumber === code)) {
      return code;
    }
  }

  return `${randomChars(letters, 3)}${Date.now().toString().slice(-3)}${randomChars(letters, 1)}`;
}

function randomChars(source, length) {
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += source[Math.floor(Math.random() * source.length)];
  }
  return value;
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateOffsetFrom(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateTimeOffset(days = 0, time = '') {
  const date = new Date();
  date.setDate(date.getDate() + days);
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
  }
  return formatDateTimeInput(date);
}

function formatDateTimeInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function setDefaultDates() {
  const travelDate = document.getElementById('quick-date');
  const returnDate = document.getElementById('quick-return-date');
  const flightDate = document.getElementById('flight-date');
  const bookingOpen = document.getElementById('flight-booking-open');
  const bookingClose = document.getElementById('flight-booking-close');
  const firstFlight = [...flights].sort(sortFlightsByDate)[0];
  const minDate = dateOffset(0);
  if (travelDate) {
    travelDate.min = minDate;
    travelDate.value = firstFlight?.flightDate || dateOffset(3);
  }
  if (returnDate) {
    returnDate.min = minDate;
    returnDate.value = dateOffsetFrom(travelDate?.value || dateOffset(3), 7);
  }
  if (flightDate) {
    flightDate.min = minDate;
    flightDate.value = firstFlight?.flightDate || dateOffset(3);
  }
  if (bookingOpen) {
    bookingOpen.min = dateTimeOffset(0);
    bookingOpen.value = dateTimeOffset(0);
  }
  if (bookingClose) {
    bookingClose.min = dateTimeOffset(0);
    bookingClose.value = `${flightDate?.value || dateOffset(3)}T23:00`;
  }
  refreshStaffDateTimeControls();
}

function toggleReturnDateField() {
  const tripType = getQuickTripType();
  const field = document.getElementById('return-date-field');
  const input = document.getElementById('quick-return-date');
  if (!field || !input) return;

  const isReturn = tripType === 'return';
  field.classList.toggle('hidden', !isReturn);
  input.required = isReturn;
}

function syncStaffBookingCloseDefault() {
  const flightDate = document.getElementById('flight-date');
  const departure = document.getElementById('flight-depart');
  const close = document.getElementById('flight-booking-close');
  if (!flightDate || !close || !flightDate.value) return;
  close.value = `${flightDate.value}T${departure?.value || '23:00'}`;
  refreshStaffDateTimeControls();
}

function getQuickTripType() {
  return document.querySelector('input[name="quick-trip-type"]:checked')?.value || 'one-way';
}

function getAirportCode(name) {
  return getAirport(name)?.code || name.slice(0, 3).toUpperCase();
}

function getAirport(name) {
  return getAllAirports().find((airport) => airport.name === name);
}

function projectAirport(airport) {
  const projection = getMapProjection();
  const xPercent = ((lonToTileX(airport.lon) - projection.xMin) / projection.xRange) * 100;
  const yPercent = ((latToTileY(airport.lat) - projection.yMin) / projection.yRange) * 100;
  return {
    xPercent,
    yPercent,
    x: (xPercent / 100) * 1000,
    y: (yPercent / 100) * 620
  };
}

function getMapProjection() {
  const xMin = lonToTileX(MAP_BOUNDS.west);
  const xMax = lonToTileX(MAP_BOUNDS.east);
  const yMin = latToTileY(MAP_BOUNDS.north);
  const yMax = latToTileY(MAP_BOUNDS.south);
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    xRange: xMax - xMin,
    yRange: yMax - yMin
  };
}

function lonToTileX(lon) {
  return ((lon + 180) / 360) * (2 ** MAP_ZOOM);
}

function latToTileY(lat) {
  const radians = lat * Math.PI / 180;
  return ((1 - Math.log(Math.tan(radians) + (1 / Math.cos(radians))) / Math.PI) / 2) * (2 ** MAP_ZOOM);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTripType(type) {
  return type === 'return' ? 'Return' : 'One way';
}

function renderInfoPill(label, value) {
  return `
    <div class="info-pill">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || 'N/A')}</strong>
    </div>
  `;
}

function renderStaffRow(label, value) {
  return `
    <div class="staff-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value)}</span>
    </div>
  `;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    window.setTimeout(() => toast.remove(), 180);
  }, 3200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}
