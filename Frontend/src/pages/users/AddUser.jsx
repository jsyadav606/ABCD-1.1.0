import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input.jsx';
import Select from '../../components/Select/Select.jsx';
import MultiSelectBranch from '../../components/MultiSelectBranch/MultiSelectBranch.jsx';
import Textarea from '../../components/Textarea/Textarea.jsx';
import Button from '../../components/Button/Button.jsx';
import { PageLoader } from '../../components/Loader/Loader.jsx';
import { SetPageTitle } from '../../components/SetPageTitle/SetPageTitle.jsx';
import {
  createNewUser,
  fetchRolesForDropdown,
  fetchBranchesForDropdown,
} from '../../services/userApi.js';
import './AddUser.css';

const AddUser = () => {
  const navigate = useNavigate();

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
    gender: '',
    dateOfBirth: '',
    personalEmail: '',
    alternateMobile: '',
    employeeType: '',
    dateOfJoining: '',
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

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(''), 5000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // Fetch roles and branches on component mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // Fetch roles

        const rolesData = await fetchRolesForDropdown();

        setRoles(rolesData);

        // Fetch branches
        const branchesData = await fetchBranchesForDropdown(ORGANIZATION_ID);
        setBranches(branchesData);
      } catch (error) {
        console.error('❌ Failed to load dropdown data:', error);
        setErrorMessage(
          error.message || 'Failed to load roles and branches'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.roleId) {
      newErrors.role = 'Role is required';
    }

    if (formData.branchId.length === 0) {
      newErrors.branchId = 'At least one branch must be selected';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
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
      // Handle multi-select (from MultiSelectBranch component)
      // The component passes selectedOptions as an array directly
      const selectedOptions = Array.isArray(e.target.selectedOptions) 
        ? e.target.selectedOptions 
        : Array.from(e.target.selectedOptions, (option) => option.value);
      
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

      // Prepare data for submission (gender is required by backend)
      const submitData = {
        userId: formData.userId.trim(),
        name: formData.name.trim(),
        designation: formData.designation.trim() || 'NA',
        department: formData.department.trim() || 'NA',
        email: formData.email.trim() || null,
        gender: formData.gender,
        phone_no: formData.phone_no ? parseInt(formData.phone_no) : null,
        personalEmail: formData.personalEmail?.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        dateOfJoining: formData.dateOfJoining || null,
        roleId: formData.roleId || null,
        branchId: formData.branchId,
        canLogin: formData.canLogin,
        remarks: formData.remarks?.trim() || '',
        organizationId: formData.organizationId,
      };

      // console.log('📤 Submitting user data:', submitData);
      // console.log('🔑 OrganizationId:', submitData.organizationId);

      // Create user
      await createNewUser(submitData);

      setSuccessMessage('User created successfully! Redirecting...');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorMessage(
        error.message || 'Failed to create user. Please try again.'
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
    <div className="add-user-page">
      <SetPageTitle title="Add New User" />
      <div className="form-container">
        <div className="form-header">
          <h1>Add New User</h1>
          <p>Create a new user account in the system</p>

          {errorMessage && (
            <div className="alert-error">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="alert-success">
              <strong>Success:</strong> {successMessage}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {/* BASIC INFORMATION */}
          <div className="form-section">
            <h2 className="section-heading">Basic Information</h2>

            <div className="form-row">
              <Input
                name="userId"
                label="User ID"
                type="text"
                value={formData.userId}
                onChange={handleInputChange}
                error={errors.userId}
                placeholder="Enter unique user ID"
                required
              />
              <Input
                name="name"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-row">
              <Select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={errors.gender}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                required
              />
              <Input
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="form-section">
            <h2 className="section-heading">Contact Information</h2>

            <div className="form-row">
              <Input
                name="email"
                label="Office Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="Enter office email"
                required
              />
              <Input
                name="personalEmail"
                label="Personal Email"
                type="email"
                value={formData.personalEmail}
                onChange={handleInputChange}
                placeholder="Enter personal email"
              />
            </div>

            <div className="form-row">
              <Input
                name="phone_no"
                label="Mobile Number"
                type="tel"
                value={formData.phone_no}
                onChange={handleInputChange}
                error={errors.phone_no}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
              />
              <Input
                name="alternateMobile"
                label="Alternate Mobile"
                type="tel"
                value={formData.alternateMobile}
                onChange={handleInputChange}
                placeholder="Enter alternate mobile"
              />
            </div>
          </div>

          {/* ORGANIZATION DETAILS */}
          <div className="form-section">
            <h2 className="section-heading">Organization Details</h2>

            <div className="form-row">
              <Input
                name="organization"
                label="Organization"
                type="text"
                value="ABCD Corporation"
                disabled
              />
              <MultiSelectBranch
                name="branchId"
                label="Branches"
                value={formData.branchId}
                onChange={handleInputChange}
                options={branches.map((b) => ({
                  value: b._id,
                  label: `${b.name}${b.code ? ` (${b.code})` : ''}`,
                }))}
                error={errors.branchId}
                required
                placeholder="Select branches..."
              />
            </div>

            <div className="form-row">
              <Input
                name="department"
                label="Department"
                type="text"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Sales, Operations"
              />
              <Input
                name="designation"
                label="Designation"
                type="text"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g., Manager, Executive"
              />
            </div>

            <div className="form-row">
              <Select
                name="employeeType"
                label="Employee Type"
                value={formData.employeeType}
                onChange={handleInputChange}
                options={[
                  { value: 'Permanent', label: 'Permanent' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Intern', label: 'Intern' },
                ]}
              />
              <Input
                name="dateOfJoining"
                label="Date of Joining"
                type="date"
                value={formData.dateOfJoining}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* ACCESS & ROLE */}
          <div className="form-section">
            <h2 className="section-heading">Access & Role</h2>

            <div className="form-row">
              <Select
                name="role"
                label="Role"
                value={formData.roleId}
                onChange={handleRoleChange}
                error={errors.role}
                options={roles.map((r) => ({
                  value: r._id,
                  label: `${r.displayName} (${r.name})`,
                }))}
                required
              />
              <Select
                name="canLogin"
                label="Can Login"
                value={formData.canLogin ? 'yes' : 'no'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    canLogin: e.target.value === 'yes',
                  }));
                }}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                required
              />
            </div>
          </div>

          {/* REMARKS */}
          <div className="form-section">
            <h2 className="section-heading">Additional Information</h2>
            <Textarea
              name="remarks"
              label="Remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Add any additional notes or remarks about this user..."
              rows={4}
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
