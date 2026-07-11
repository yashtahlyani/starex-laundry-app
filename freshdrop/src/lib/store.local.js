/*
 * StareX data engine
 * ------------------------------------------------------------------
 * A fully-functional, event-driven data layer for accounts + orders.
 * Persists to localStorage NOW (works end-to-end, real-time across tabs).
 * Structured so every call can be swapped for a Supabase/API call later
 * without touching any component — see `lib/README-going-live.md`.
 */

const DB_KEY = 'starex_db_v1'
const SESSION_KEY = 'starex_session_v1'

// ── Order pipeline ────────────────────────────────────────────────
export const ORDER_STAGES = [
  { id: 'placed',            label: 'Order Placed',      short: 'Placed' },
  { id: 'confirmed',         label: 'Confirmed',         short: 'Confirmed' },
  { id: 'picked_up',         label: 'Picked Up',         short: 'Picked up' },
  { id: 'washing',           label: 'Washing',           short: 'Washing' },
  { id: 'folding',           label: 'Folding & Pressing',short: 'Folding' },
  { id: 'out_for_delivery',  label: 'Out for Delivery',  short: 'On the way' },
  { id: 'delivered',         label: 'Delivered',         short: 'Delivered' },
]
export const STAGE_INDEX = Object.fromEntries(ORDER_STAGES.map((s, i) => [s.id, i]))

export const OWNER_EMAIL = 'owner@starex.ca'
const OWNER_PASSWORD = 'starex2025'

// ── Low-level persistence ─────────────────────────────────────────
function read() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function write(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  emit()
}

// simple obfuscation — NOT real security (real hashing happens server-side once live)
const enc = s => btoa(unescape(encodeURIComponent(s)))

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
function orderCode() {
  return '#SX' + Math.floor(1000 + Math.random() * 9000)
}
function nowISO() { return new Date().toISOString() }

// ── Seed (first run) ──────────────────────────────────────────────
function seed() {
  const ownerId = uid()
  const demoId = uid()

  const t = (mins) => new Date(Date.now() - mins * 60000).toISOString()

  const mkHistory = (stages, spacingMin) =>
    stages.map((id, i) => ({ status: id, at: t((stages.length - i) * spacingMin) }))

  const db = {
    users: [
      { id: ownerId, name: 'StareX Owner', email: OWNER_EMAIL, password: enc(OWNER_PASSWORD), phone: '(416) 555-0100', role: 'owner', addresses: [], prefs: {}, createdAt: t(60 * 24 * 90) },
      { id: demoId, name: 'Ava Thompson', email: 'ava@example.com', password: enc('password'), phone: '(416) 555-0192', role: 'customer',
        addresses: [{ id: uid(), label: 'Home', line: '812 King St W, Toronto, ON M5V 1N6', isDefault: true }],
        prefs: { detergent: 'Hypoallergenic', fold: 'Standard fold', water: 'Warm' }, createdAt: t(60 * 24 * 40) },
    ],
    orders: [
      { id: uid(), code: orderCode(), userId: demoId, customerName: 'Ava Thompson', email: 'ava@example.com', phone: '(416) 555-0192',
        address: '812 King St W, Toronto, ON M5V 1N6', service: 'washfold', serviceTitle: 'Wash & Fold', date: 'Today',
        timeSlot: '2:00 PM – 4:00 PM', notes: 'Buzzer 812#, please text on arrival', status: 'washing',
        statusHistory: mkHistory(['placed', 'confirmed', 'picked_up', 'washing'], 55), weight: '8.2 lbs', price: 20.5, rating: null,
        createdAt: t(220), updatedAt: t(20) },
      { id: uid(), code: orderCode(), userId: demoId, customerName: 'Ava Thompson', email: 'ava@example.com', phone: '(416) 555-0192',
        address: '812 King St W, Toronto, ON M5V 1N6', service: 'drycleaning', serviceTitle: 'Dry Cleaning', date: 'Jun 28',
        timeSlot: '10:00 AM – 12:00 PM', notes: '', status: 'delivered',
        statusHistory: mkHistory(ORDER_STAGES.map(s => s.id), 90), weight: '3 items', price: 38.5, rating: 5,
        createdAt: t(60 * 24 * 6), updatedAt: t(60 * 24 * 5) },
    ],
  }
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  return db
}

function getDB() {
  return read() || seed()
}

// ── Pub/sub (drives live UI + cross-tab real-time) ────────────────
const listeners = new Set()
function emit() { listeners.forEach(fn => { try { fn() } catch {} }) }
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
if (typeof window !== 'undefined') {
  // another tab (e.g. the owner's admin tab) wrote → refresh here too
  window.addEventListener('storage', e => { if (e.key === DB_KEY || e.key === SESSION_KEY) emit() })
}

// ── Auth ──────────────────────────────────────────────────────────
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
export function getCurrentUser() {
  const s = getSession()
  if (!s) return null
  return getDB().users.find(u => u.id === s.userId) || null
}
export function isOwner() {
  const u = getCurrentUser()
  return !!u && u.role === 'owner'
}
export function isAuthReady() { return true }  // local is synchronous — always ready

export function login(email, password) {
  const db = getDB()
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return { ok: false, error: 'No account found with that email.' }
  if (user.password !== enc(password)) return { ok: false, error: 'Incorrect password. Please try again.' }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
  emit()
  return { ok: true, user }
}

export function signup({ name, email, password, phone = '' }) {
  const db = getDB()
  if (db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase()))
    return { ok: false, error: 'An account with that email already exists.' }
  const user = {
    id: uid(), name: name.trim(), email: email.trim(), password: enc(password),
    phone, role: 'customer', addresses: [], prefs: {}, createdAt: nowISO(),
  }
  db.users.push(user)
  write(db)
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
  emit()
  return { ok: true, user }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  emit()
}

export function updateProfile(patch) {
  const db = getDB()
  const u = getCurrentUser()
  if (!u) return { ok: false }
  Object.assign(u, patch)
  write(db)
  return { ok: true, user: u }
}

// ── Addresses ─────────────────────────────────────────────────────
export function addAddress({ label, line, isDefault }) {
  const db = getDB()
  const u = db.users.find(x => x.id === getSession()?.userId)
  if (!u) return { ok: false }
  const addr = { id: uid(), label, line, isDefault: !!isDefault || u.addresses.length === 0 }
  if (addr.isDefault) u.addresses.forEach(a => (a.isDefault = false))
  u.addresses.push(addr)
  write(db)
  return { ok: true }
}
export function removeAddress(id) {
  const db = getDB()
  const u = db.users.find(x => x.id === getSession()?.userId)
  if (!u) return
  u.addresses = u.addresses.filter(a => a.id !== id)
  if (u.addresses.length && !u.addresses.some(a => a.isDefault)) u.addresses[0].isDefault = true
  write(db)
}

// ── Orders ────────────────────────────────────────────────────────
export function createOrder(data) {
  const db = getDB()
  const user = getCurrentUser()
  const order = {
    id: uid(),
    code: orderCode(),
    userId: user?.id || null,
    customerName: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    service: data.service,
    serviceTitle: data.serviceTitle,
    date: data.date,
    timeSlot: data.time || data.timeSlot,
    notes: data.notes || '',
    status: 'placed',
    statusHistory: [{ status: 'placed', at: nowISO() }],
    weight: data.weight || 'TBD',
    price: data.price ?? null,
    rating: null,
    isNew: true,            // owner hasn't seen it yet
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  db.orders.unshift(order)
  write(db)
  return order
}

export function getAllOrders() {
  return [...getDB().orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
export function getUserOrders(userId) {
  const id = userId || getSession()?.userId
  return getAllOrders().filter(o => o.userId === id)
}
export function getOrder(id) {
  return getDB().orders.find(o => o.id === id) || null
}

export function advanceOrder(id) {
  const db = getDB()
  const o = db.orders.find(x => x.id === id)
  if (!o) return
  const i = STAGE_INDEX[o.status]
  if (i < ORDER_STAGES.length - 1) {
    o.status = ORDER_STAGES[i + 1].id
    o.statusHistory.push({ status: o.status, at: nowISO() })
    o.updatedAt = nowISO()
    write(db)
  }
}
export function setOrderStatus(id, status) {
  const db = getDB()
  const o = db.orders.find(x => x.id === id)
  if (!o || !STAGE_INDEX.hasOwnProperty(status)) return
  o.status = status
  if (o.statusHistory[o.statusHistory.length - 1]?.status !== status)
    o.statusHistory.push({ status, at: nowISO() })
  o.updatedAt = nowISO()
  write(db)
}
export function acknowledgeOrder(id) {
  const db = getDB()
  const o = db.orders.find(x => x.id === id)
  if (!o) return
  o.isNew = false
  if (o.status === 'placed') { o.status = 'confirmed'; o.statusHistory.push({ status: 'confirmed', at: nowISO() }) }
  o.updatedAt = nowISO()
  write(db)
}
export function setOrderPrice(id, price, weight) {
  const db = getDB()
  const o = db.orders.find(x => x.id === id)
  if (!o) return
  o.price = price
  if (weight) o.weight = weight
  o.updatedAt = nowISO()
  write(db)
}
export function rateOrder(id, rating) {
  const db = getDB()
  const o = db.orders.find(x => x.id === id)
  if (!o) return
  o.rating = rating
  write(db)
}

// ── Admin analytics ───────────────────────────────────────────────
export function getStats() {
  const orders = getAllOrders()
  const isToday = d => new Date(d).toDateString() === new Date().toDateString()
  const delivered = orders.filter(o => o.status === 'delivered')
  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const revenue = orders.reduce((s, o) => s + (o.price || 0), 0)
  const ratings = orders.filter(o => o.rating).map(o => o.rating)
  return {
    total: orders.length,
    newCount: orders.filter(o => o.isNew).length,
    todayCount: orders.filter(o => isToday(o.createdAt)).length,
    activeCount: active.length,
    deliveredCount: delivered.length,
    revenue,
    revenueToday: orders.filter(o => isToday(o.createdAt)).reduce((s, o) => s + (o.price || 0), 0),
    avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
    customers: getDB().users.filter(u => u.role === 'customer').length,
  }
}
export function getCustomers() {
  const db = getDB()
  const orders = getAllOrders()
  return db.users.filter(u => u.role === 'customer').map(u => {
    const uOrders = orders.filter(o => o.userId === u.id)
    return {
      ...u,
      orderCount: uOrders.length,
      spent: uOrders.reduce((s, o) => s + (o.price || 0), 0),
      lastOrder: uOrders[0]?.createdAt || null,
    }
  })
}

// dev helper
export function _resetDB() { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); seed(); emit() }
