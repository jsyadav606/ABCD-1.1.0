import API from './api'

export const fetchAllUsers = async (limit = 100, page = 1) => {
  try {
    const response = await API.get(`/users?limit=${limit}&page=${page}`)
    const items = response.data?.data?.items || response.data?.items || []
    
    // Transform backend data to frontend format
    return items.map((user) => ({
      ...user,
      _id: user._id || user.id,
      status: user.isActive ? 'Active' : 'Inactive',
      remarks: user.remarks || '--'
    }))
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch users')
  }
}

export const createNewUser = async (userData) => {
  try {
    const response = await API.post(`/users`, userData)
    return response.data?.data || response.data
  } catch (error) {
    console.error('Failed to create user:', error)
    throw new Error(error.response?.data?.message || 'Failed to create user')
  }
}

export const fetchRolesForDropdown = async () => {
  try {
    const response = await API.get(`/users/dropdown/roles`)
    return response.data?.data || []
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch roles')
  }
}

export const fetchBranchesForDropdown = async (organizationId = null) => {
  try {
    let url = '/users/dropdown/branches'
    if (organizationId) {
      url += `?organizationId=${organizationId}`
    }
    const response = await API.get(url)
    return response.data?.data || []
  } catch (error) {
    console.error('Failed to fetch branches:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch branches')
  }
}

export const disableUser = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/toggle-is-active`, {
      enable: false
    })
    return response.data
  } catch (error) {
    console.error('Failed to disable user:', error)
    throw new Error(error.response?.data?.message || 'Failed to disable user')
  }
}

export const enableUser = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/toggle-is-active`, {
      enable: true
    })
    return response.data
  } catch (error) {
    console.error('Failed to enable user:', error)
    throw new Error(error.response?.data?.message || 'Failed to enable user')
  }
}

export const toggleCanLogin = async (userId, enable) => {
  try {
    const response = await API.post(`/users/${userId}/toggle-can-login`, {
      enable: enable
    })
    return response.data?.data || response.data
  } catch (error) {
    console.error('Failed to toggle login:', error)
    throw new Error(error.response?.data?.message || 'Failed to toggle login')
  }
}

export const fetchUserById = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`)
    return response.data?.data || response.data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error(error.response?.data?.message || 'Failed to fetch user')
  }
}

export const updateUser = async (userId, userData) => {
  try {
    console.log('🔄 UPDATE USER API - Sending request');
    console.log('📌 User ID:', userId);
    console.log('📋 User Data:', userData);

    const response = await API.put(`/users/${userId}`, userData)
    
    console.log('✅ UPDATE USER API - Response received');
    console.log('📊 Response:', response.data);

    return response.data
  } catch (error) {
    console.error('❌ UPDATE USER API - Error:', error)
    console.error('Error details:', error.response?.data)
    throw new Error(error.response?.data?.message || 'Failed to update user')
  }
}

export const changeUserPassword = async (userId, newPassword) => {
  try {
    const response = await API.post(`/users/${userId}/change-password`, {
      newPassword: newPassword
    })
    return response.data?.data || response.data
  } catch (error) {
    console.error('Failed to change password:', error)
    throw new Error(error.response?.data?.message || 'Failed to change password')
  }
}
