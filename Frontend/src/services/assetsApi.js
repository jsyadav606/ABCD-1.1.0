import API from './api'

export const listTemplates = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/assets/templates?${query}` : `/assets/templates`
  const res = await API.get(url)
  return res.data?.data || []
}

export const createTemplate = async (payload) => {
  const res = await API.post(`/assets/templates`, payload)
  return res.data?.data || res.data
}

export const publishTemplate = async (id) => {
  const res = await API.post(`/assets/templates/${id}/publish`)
  return res.data?.data || res.data
}

export const updateTemplate = async (id, payload) => {
  const res = await API.put(`/assets/templates/${id}`, payload)
  return res.data?.data || res.data
}

export const getTemplateById = async (id) => {
  const res = await API.get(`/assets/templates/${id}`)
  return res.data?.data || res.data
}

export const listItems = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/assets/items?${query}` : `/assets/items`
  const res = await API.get(url)
  return res.data?.data || []
}

export const createItem = async (payload) => {
  const res = await API.post(`/assets/items`, payload)
  return res.data?.data || res.data
}

export const listCatalogFields = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/assets/catalog/fields?${query}` : `/assets/catalog/fields`
  const res = await API.get(url)
  return res.data?.data || []
}

export const createCatalogField = async (payload) => {
  const res = await API.post(`/assets/catalog/fields`, payload)
  return res.data?.data || res.data
}
