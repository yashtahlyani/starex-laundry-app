/*
 * StareX data engine — Supabase (cloud) backend.
 * Same public API as store.local.js, but backed by a shared Postgres DB
 * with real-time updates. Reads are served synchronously from an in-memory
 * cache that is hydrated on load and kept fresh via Supabase Realtime, so
 * the existing synchronous hooks/selectors keep working unchanged.
 */
import { supabase } from './supabaseClient'
import { ORDER_STAGES, STAGE_INDEX, OWNER_EMAIL } from './store.local'

export { ORDER_STAGES, STAGE_INDEX, OWNER_EMAIL }

// ── in-memory cache ───────────────────────────────────────────────
const cache = { user: null, orders: [], customers: [] }
let ready = false
export function isAuthReady() { return ready }

// ── pub/sub ───────────────────────────────────────────────────────
const listeners = new Set()
function emit() { listeners.forEach(fn => { try { fn() } catch {} }) }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }

const nowISO = () => new Date().toISOString()
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2))
const orderCode = () => '#SX' + Math.floor(1000 + Math.random() * 9000)

// map a DB row (snake_case) → app shape (camelCase)
function fromRow(r) {
  return {
    id: r.id, code: r.code, userId: r.user_id,
    customerName: r.customer_name, email: r.email, phone: r.phone, address: r.address,
    service: r.service, serviceTitle: r.service_title, date: r.date, timeSlot: r.time_slot,
    notes: r.notes, status: r.status, statusHistory: r.status_history || [],
    weight: r.weight, price: r.price, rating: r.rating, isNew: r.is_new,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}
function toRow(o) {
  return {
    id: o.id, code: o.code, user_id: o.userId,
    customer_name: o.customerName, email: o.email, phone: o.phone, address: o.address,
    service: o.service, service_title: o.serviceTitle, date: o.date, time_slot: o.timeSlot,
    notes: o.notes, status: o.status, status_history: o.statusHistory,
    weight: o.weight, price: o.price, rating: o.rating, is_new: o.isNew,
    created_at: o.createdAt, updated_at: o.updatedAt,
  }
}

// ── hydration + realtime ──────────────────────────────────────────
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { cache.user = null; return }
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  cache.user = data ? { ...data, addresses: data.addresses || [], prefs: data.prefs || {} } : { id: user.id, email: user.email, role: 'customer', addresses: [], prefs: {} }
}
async function loadOrders() {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  cache.orders = (data || []).map(fromRow)
}
async function loadCustomers() {
  if (cache.user?.role !== 'owner') { cache.customers = []; return }
  const { data } = await supabase.from('profiles').select('*').eq('role', 'customer')
  cache.customers = data || []
}

async function hydrate() {
  await loadProfile()
  await Promise.all([loadOrders(), loadCustomers()])
  ready = true
  emit()
}

if (supabase) {
  hydrate()
  supabase.auth.onAuthStateChange(() => { hydrate() })
  supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => { await loadOrders(); emit() })
    .subscribe()
}

// ── Auth ──────────────────────────────────────────────────────────
export function getSession() { return cache.user ? { userId: cache.user.id } : null }
export function getCurrentUser() { return cache.user }
export function isOwner() { return cache.user?.role === 'owner' }

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return { ok: false, error: error.message.includes('Invalid') ? 'Incorrect email or password.' : error.message }
  await hydrate()
  return { ok: true, user: cache.user }
}

export async function signup({ name, email, password, phone = '' }) {
  const { error } = await supabase.auth.signUp({
    email: email.trim(), password,
    options: { data: { name: name.trim(), phone } },
  })
  if (error) return { ok: false, error: error.message }
  await hydrate()
  return { ok: true, user: cache.user }
}

export async function logout() {
  await supabase.auth.signOut()
  cache.user = null; cache.customers = []
  emit()
}

export async function updateProfile(patch) {
  if (!cache.user) return { ok: false }
  cache.user = { ...cache.user, ...patch }; emit()
  await supabase.from('profiles').update(patch).eq('id', cache.user.id)
  return { ok: true, user: cache.user }
}

// ── Addresses ─────────────────────────────────────────────────────
export async function addAddress({ label, line, isDefault }) {
  if (!cache.user) return { ok: false }
  const addr = { id: uid(), label, line, isDefault: !!isDefault || cache.user.addresses.length === 0 }
  const addresses = cache.user.addresses.map(a => ({ ...a, isDefault: addr.isDefault ? false : a.isDefault }))
  addresses.push(addr)
  await updateProfile({ addresses })
  return { ok: true }
}
export async function removeAddress(id) {
  if (!cache.user) return
  let addresses = cache.user.addresses.filter(a => a.id !== id)
  if (addresses.length && !addresses.some(a => a.isDefault)) addresses[0].isDefault = true
  await updateProfile({ addresses })
}

// ── Orders ────────────────────────────────────────────────────────
export async function createOrder(data) {
  const order = {
    id: uid(), code: orderCode(), userId: cache.user?.id || null,
    customerName: data.name, email: data.email, phone: data.phone, address: data.address,
    service: data.service, serviceTitle: data.serviceTitle, date: data.date, timeSlot: data.time || data.timeSlot,
    notes: data.notes || '', status: 'placed', statusHistory: [{ status: 'placed', at: nowISO() }],
    weight: data.weight || 'TBD', price: data.price ?? null, rating: null, isNew: true,
    createdAt: nowISO(), updatedAt: nowISO(),
  }
  const { error } = await supabase.from('orders').insert(toRow(order))
  if (error) throw new Error(error.message)
  cache.orders = [order, ...cache.orders]; emit()          // reflect immediately (realtime also refreshes)
  return order
}

export function getAllOrders() { return cache.orders }
export function getUserOrders(userId) {
  const id = userId || cache.user?.id
  return cache.orders.filter(o => o.userId === id)
}
export function getOrder(id) { return cache.orders.find(o => o.id === id) || null }

async function patchOrder(id, patch) {
  cache.orders = cache.orders.map(o => o.id === id ? { ...o, ...patch } : o); emit()   // optimistic
  await supabase.from('orders').update(toRow({ id, ...patch })).eq('id', id)
}
export async function advanceOrder(id) {
  const o = getOrder(id); if (!o) return
  const i = STAGE_INDEX[o.status]
  if (i < ORDER_STAGES.length - 1) {
    const status = ORDER_STAGES[i + 1].id
    await patchOrder(id, { status, statusHistory: [...o.statusHistory, { status, at: nowISO() }], updatedAt: nowISO() })
  }
}
export async function setOrderStatus(id, status) {
  const o = getOrder(id); if (!o || !STAGE_INDEX.hasOwnProperty(status)) return
  const hist = o.statusHistory[o.statusHistory.length - 1]?.status === status ? o.statusHistory : [...o.statusHistory, { status, at: nowISO() }]
  await patchOrder(id, { status, statusHistory: hist, updatedAt: nowISO() })
}
export async function acknowledgeOrder(id) {
  const o = getOrder(id); if (!o) return
  const patch = { isNew: false, updatedAt: nowISO() }
  if (o.status === 'placed') { patch.status = 'confirmed'; patch.statusHistory = [...o.statusHistory, { status: 'confirmed', at: nowISO() }] }
  await patchOrder(id, patch)
}
export async function setOrderPrice(id, price, weight) {
  const patch = { price, updatedAt: nowISO() }; if (weight) patch.weight = weight
  await patchOrder(id, patch)
}
export async function rateOrder(id, rating) { await patchOrder(id, { rating }) }

// ── Analytics ─────────────────────────────────────────────────────
export function getStats() {
  const orders = cache.orders
  const isToday = d => new Date(d).toDateString() === new Date().toDateString()
  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const ratings = orders.filter(o => o.rating).map(o => o.rating)
  return {
    total: orders.length,
    newCount: orders.filter(o => o.isNew).length,
    todayCount: orders.filter(o => isToday(o.createdAt)).length,
    activeCount: active.length,
    deliveredCount: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((s, o) => s + (o.price || 0), 0),
    revenueToday: orders.filter(o => isToday(o.createdAt)).reduce((s, o) => s + (o.price || 0), 0),
    avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    customers: cache.customers.length,
  }
}
export function getCustomers() {
  return cache.customers.map(u => {
    const uOrders = cache.orders.filter(o => o.userId === u.id)
    return { ...u, orderCount: uOrders.length, spent: uOrders.reduce((s, o) => s + (o.price || 0), 0), lastOrder: uOrders[0]?.createdAt || null }
  })
}

export function _resetDB() { /* no-op in cloud mode */ }
