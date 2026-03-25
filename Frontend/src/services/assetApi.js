/**
 * assetApi
 *
 * Logics:
 * - fetchAssetsCount(branchId): GET /assets/count with branchId filter
 * - fetchAllAssets(limit): GET /assets to fetch all assets
 */

import API from './api'

export const fetchAssetsCount = async (branchId = "__ALL__") => {
  try {
    const query = branchId === "__ALL__" ? "" : `?branchId=${branchId}`
    const response = await API.get(`/assets/count${query}`)
    return response.data?.data?.total || 0
  } catch (error) {
    console.error('Failed to fetch assets count:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch assets count')
  }
}

export const fetchAllAssets = async (limit = 1000) => {
  try {
    // Fetch all assets (both active and inactive) to allow frontend filtering
    const response = await API.get(`/assets?limit=${limit}&fetchAll=true`)
    return response.data?.data?.items || []
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch assets')
  }
}

export const fetchAssetCategories = async () => {
  try {
    const response = await API.get('/assetcategories/active/list')
    return response.data?.data?.items || []
  } catch (error) {
    console.error('Failed to fetch asset categories:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch asset categories')
  }
}

export const fetchItemTypesByCategory = async (categoryId) => {
  try {
    const response = await API.get(`/itemtypes/category/${categoryId}`)
    return response.data?.data?.items || []
  } catch (error) {
    console.error('Failed to fetch item types:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch item types')
  }
}

export const createAsset = async (assetData) => {
  try {
    const response = await API.post('/assets', assetData)
    return response.data?.data || {}
  } catch (error) {
    console.error('Failed to create asset:', error)
    throw new Error(error.response?.data?.message || 'Failed to create asset')
  }
}