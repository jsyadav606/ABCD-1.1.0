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

export const fetchAssetDetailsById = async (assetId, itemType = "CPU") => {
  try {
    const response = await API.get(`/assets/${assetId}?itemType=${itemType}`)
    return response.data?.data || {}
  } catch (error) {
    console.error('Failed to fetch asset details:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch asset details')
  }
}

export const fetchLookupsByCategory = async (category) => {
  try {
    if (!category) return [];
    const safeCat = String(category).trim().toLowerCase();
    const fallbackCategoryMap = {
      ram_type: 'ram',
      storage_type: 'storage',
      gpu_type: 'gpu',
    };

    const categoriesToTry = [safeCat];
    if (fallbackCategoryMap[safeCat]) {
      categoriesToTry.push(fallbackCategoryMap[safeCat]);
    }

    let items = [];
    for (const cat of categoriesToTry) {
      try {
        const response = await API.get('/lookups/category', { params: { category: cat } });
        items = response.data?.data?.items || [];
        if (items.length > 0) {
          break;
        }
      } catch (err) {
        console.error(`Lookup fetch attempt failed for category ${cat}:`, err);
      }
    }

    return items;
  } catch (error) {
    console.error(`Failed to fetch lookups for category ${category}:`, error);
    return [];
  }
}