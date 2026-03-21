/**
 * assetApi
 *
 * Logics:
 * - fetchAssetsCount(branchId): GET /assets/count with branchId filter
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