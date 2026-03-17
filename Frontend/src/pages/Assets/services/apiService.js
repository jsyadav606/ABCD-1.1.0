import API from '../../../services/api';

export const apiService = {
  async createAsset(payload) {
    const response = await API.post('/assets', payload);
    return response.data?.data || response.data;
  },
  async upsertPurchase(assetId, payload) {
    const response = await API.put(`/purchases/asset/${assetId}`, payload);
    return response.data?.data || response.data;
  },
  async upsertWarranty(assetId, payload) {
    const response = await API.put(`/warranties/asset/${assetId}`, payload);
    return response.data?.data || response.data;
  },
};
