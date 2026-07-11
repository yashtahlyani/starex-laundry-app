/*
 * StareX data engine — facade.
 * Delegates to the local (localStorage) backend by default, or the Supabase
 * (shared cloud) backend automatically once VITE_SUPABASE_URL + ANON_KEY are
 * set. Components import only from here and never change.
 */
import { isSupabaseEnabled } from './supabaseClient'
import * as local from './store.local'
import * as supa from './store.supabase'

const be = isSupabaseEnabled ? supa : local

// Constants (identical in both backends)
export const ORDER_STAGES = local.ORDER_STAGES
export const STAGE_INDEX = local.STAGE_INDEX
export const OWNER_EMAIL = local.OWNER_EMAIL

// Pub/sub
export const subscribe = be.subscribe

// Auth
export const getSession = be.getSession
export const getCurrentUser = be.getCurrentUser
export const isOwner = be.isOwner
export const isAuthReady = be.isAuthReady
export const login = be.login
export const signup = be.signup
export const logout = be.logout
export const updateProfile = be.updateProfile

// Addresses
export const addAddress = be.addAddress
export const removeAddress = be.removeAddress

// Orders
export const createOrder = be.createOrder
export const getAllOrders = be.getAllOrders
export const getUserOrders = be.getUserOrders
export const getOrder = be.getOrder
export const advanceOrder = be.advanceOrder
export const setOrderStatus = be.setOrderStatus
export const acknowledgeOrder = be.acknowledgeOrder
export const setOrderPrice = be.setOrderPrice
export const rateOrder = be.rateOrder

// Analytics
export const getStats = be.getStats
export const getCustomers = be.getCustomers

// Dev
export const _resetDB = be._resetDB
