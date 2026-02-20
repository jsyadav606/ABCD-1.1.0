import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Form from '../../components/Form/Form.jsx';
import Input from '../../components/Input/Input.jsx';
import Select from '../../components/Select/Select.jsx';
import Textarea from '../../components/Textarea/Textarea.jsx';
import Checkbox from '../../components/Checkbox/Checkbox.jsx';
import Button from '../../components/Button/Button.jsx';
import { PageLoader } from '../../components/Loader/Loader.jsx';
import { SetPageTitle } from '../../components/SetPageTitle/SetPageTitle.jsx';
import {
  fetchUserById,
  updateUser,
  fetchRolesForDropdown,
  fetchBranchesForDropdown,
} from '../../services/userApi.js';
import './AddUser.css'; // Reuse same CSS

const EditUser = () => {
  const navigate = useNavigate();
  const { id: mongoId } = useParams();
  const { user: loggedInUser } = useAuth();

  // Organization ID (Fixed for all users as per requirement)
  const ORGANIZATION_ID = '6991f27977da956717ec33f5';

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    designation: '',
    department: '',
    email: '',
    phone_no: '',
    role: '',
    roleId: '',
    branchId: [],
    canLogin: false,
    remarks: '',
    organizationId: ORGANIZATION_ID,
  });

  // Dropdown Data
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // UI State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data and dropdowns on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // Fetch user data
        console.log('📥 Fetching user data for ID:', mongoId);
        const userData = await fetchUserById(mongoId);
        console.log('✅ User data received:', userData);

        // Map user data to form
        setFormData({
          userId: userData.userId || '',
          name: userData.name || '',
          designation: userData.designation || '',
          department: userData.department || '',
          email: userData.email || '',
          phone_no: userData.phone_no || '',
          role: userData.role || '',
          roleId: userData.roleId || '',
          branchId: userData.branchId || [],
          canLogin: userData.canLogin || false,
          remarks: userData.remarks || '',
          organizationId: userData.organizationId || ORGANIZATION_ID,
        });

        // Fetch roles
        console.log('📥 Fetching roles...');
        const rolesData = await fetchRolesForDropdown();
        console.log('✅ Roles received:', rolesData);
        setRoles(rolesData);

        // Fetch branches
        console.log('📥 Fetching branches for orgId:', ORGANIZATION_ID);
        const branchesData = await fetchBranchesForDropdown(ORGANIZATION_ID);
        console.log('✅ Branches received:', branchesData);
        setBranches(branchesData);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        setErrorMessage(error.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mongoId]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.branchId.length === 0) {
      newErrors.branchId = 'At least one branch must be selected';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone_no && !/^\d{10}$/.test(formData.phone_no)) {
      newErrors.phone_no = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'branchId') {
      // Handle multi-select
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle role change
  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    const selectedRole = roles.find((r) => r._id === selectedRoleId);

    setFormData((prev) => ({
      ...prev,
      roleId: selectedRoleId,
      role: selectedRole?.name || '',
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Please fix all errors before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Prepare data for submission
      // NOTE: canLogin and isActive cannot be updated via PUT endpoint
      // They must be changed using dedicated buttons (Enable Login, Disable Login, etc.)
      const submitData = {
        userId: formData.userId.trim(),
        name: formData.name.trim(),
        designation: formData.designation.trim() || 'NA',
        department: formData.department.trim() || 'NA',
        email: formData.email.trim() || null,
        phone_no: formData.phone_no ? parseInt(formData.phone_no) : null,
        role: formData.role,
        roleId: formData.roleId || null,
        branchId: formData.branchId,
        remarks: formData.remarks.trim() || '',
        organizationId: formData.organizationId,
      };

      console.log('📤 Submitting user update for ID:', mongoId);
      console.log('📋 Update payload:', submitData);

      // Update user
      const result = await updateUser(mongoId, submitData);
      console.log('✅ Update successful:', result);

      setSuccessMessage('User updated successfully! Redirecting...');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage(
        error.message || 'Failed to update user. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/users');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="add-user-container">
      <SetPageTitle title="Edit User" />

      <div className="add-user-wrapper">
        {/* Header */}
        <div className="add-user-header">
          <h1 className="add-user-title">Edit User</h1>
          <p className="add-user-subtitle">
            Update user information, role and branch assignments
          </p>
        </div>

        {/* Form Content */}
        <div className="add-user-form-content">
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          <Form onSubmit={handleSubmit}>
            {/* User Identity Section */}
            <div className="form-section-title">Basic Information</div>

            <div className="user-form-grid">
              <div className="user-input-group">
                <Input
                  label="User ID"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleInputChange}
                  error={errors.userId}
                  placeholder="Enter unique user ID"
                  required
                />
              </div>

              <div className="user-input-group">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="user-input-group">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter email address"
                />
              </div>

              <div className="user-input-group">
                <Input
                  label="Phone Number"
                  name="phone_no"
                  type="tel"
                  value={formData.phone_no}
                  onChange={handleInputChange}
                  error={errors.phone_no}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
              </div>

              <div className="user-input-group">
                <Input
                  label="Designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g., Manager, Executive"
                />
              </div>

              <div className="user-input-group">
                <Input
                  label="Department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Sales, Operations"
                />
              </div>
            </div>

            {/* Role and Branch Section */}
            <div className="form-section-title">
              Role & Branch Assignment
            </div>

            <div className="user-form-grid">
              <div className="user-input-group">
                <Select
                  label="Role"
                  name="role"
                  value={formData.roleId}
                  onChange={handleRoleChange}
                  error={errors.role}
                  placeholder="Select a role"
                  required
                  options={roles.map((role) => ({
                    value: role._id,
                    label: `${role.displayName} (${role.name})`,
                  }))}
                />
              </div>

              <div className="user-input-group multi-select-group">
                <label htmlFor="branchId">
                  Branches <span className="select-required">*</span>
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  multiple
                  value={formData.branchId}
                  onChange={handleInputChange}
                  className={`select-field ${errors.branchId ? 'select-error' : ''}`}
                >
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} {branch.code ? `(${branch.code})` : ''}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <span className="select-error-text">{errors.branchId}</span>
                )}
                <small style={{ color: '#666', marginTop: '0.25rem' }}>
                  Hold Ctrl/Cmd to select multiple branches
                </small>
              </div>
            </div>

            {/* Access & Permissions Section */}
            <div className="form-section-title">
              Access & Permissions
            </div>

            <div className="checkbox-container">
              <Checkbox
                label="Enable Login (canLogin)"
                name="canLogin"
                checked={formData.canLogin}
                onChange={handleInputChange}
                disabled
              />
              <small style={{ color: '#999' }}>
                ℹ️ Login status cannot be changed here. Use "Enable Login" / "Disable Login" buttons from the Users list.
              </small>
            </div>

            {/* Remarks Section */}
            <div className="form-section-title">Additional Information</div>

            <div className="user-form-grid full-width">
              <div className="user-input-group">
                <Textarea
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes or remarks about this user..."
                  rows={4}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="form-loading">
                    <span>Saving...</span>
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
