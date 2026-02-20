import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Table,
  Card,
  Alert,
  Modal,
  Loading,
  Badge,
  Pagination,
  Breadcrumb
} from '../components';
import './ComponentShowcase.css';

const ComponentShowcase = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
    subscribe: false,
    gender: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const tableColumns = [
    { key: 'id', label: 'ID', width: '5%' },
    { key: 'name', label: 'Name', width: '25%' },
    { key: 'email', label: 'Email', width: '35%' },
    {
      key: 'status',
      label: 'Status',
      width: '20%',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: () => (
        <Button size="sm" variant="outline-primary">
          Edit
        </Button>
      )
    }
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/' },
    { label: 'Showcase' },
  ];

  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <h1>React Components Showcase</h1>
        <p>All reusable components for your application</p>
      </div>

      {/* Breadcrumb */}
      <Card title="Breadcrumb Navigation">
        <Breadcrumb items={breadcrumbItems} />
      </Card>

      {/* Alerts */}
      <Card title="Alerts">
        <div className="showcase-grid">
          <Alert type="success" title="Success">
            Your action completed successfully!
          </Alert>
          <Alert type="danger" title="Error">
            Something went wrong. Please try again.
          </Alert>
          <Alert type="warning" title="Warning">
            Please review your information before proceeding.
          </Alert>
          <Alert type="info" title="Information">
            Here's some useful information for you.
          </Alert>
        </div>
      </Card>

      {/* Buttons */}
      <Card title="Buttons">
        <div className="showcase-buttons">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
          <Button variant="outline-primary">Outline Primary</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="showcase-buttons">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </Card>

      {/* Badges */}
      <Card title="Badges">
        <div className="showcase-badges">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge rounded variant="primary">Rounded</Badge>
          <Badge size="lg" rounded variant="success">
            Large Rounded
          </Badge>
        </div>
      </Card>

      {/* Form Components */}
      <Card title="Form Components">
        <Form onSubmit={handleSubmit}>
          <Input
            name="name"
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Select
            name="role"
            label="Select Role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'user', label: 'User' },
              { value: 'guest', label: 'Guest' }
            ]}
          />

          <Textarea
            name="message"
            label="Message"
            placeholder="Enter your message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
          />

          <div className="form-group">
            <label>Gender</label>
            <Radio
              name="gender"
              label="Male"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleInputChange}
            />
            <Radio
              name="gender"
              label="Female"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleInputChange}
            />
          </div>

          <Checkbox
            name="subscribe"
            label="Subscribe to newsletter"
            checked={formData.subscribe}
            onChange={handleInputChange}
          />

          <Button type="submit" variant="primary">
            Submit Form
          </Button>
        </Form>
      </Card>

      {/* Table */}
      <Card title="Data Table">
        <Table columns={tableColumns} data={tableData} />
        <Pagination
          currentPage={currentPage}
          totalPages={5}
          onPageChange={setCurrentPage}
          showSummary={true}
          totalItems={50}
          pageSize={20}
        />
      </Card>

      {/* Modal */}
      <Card title="Modal">
        <Button onClick={() => setModalOpen(true)} variant="primary">
          Open Modal
        </Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary">Confirm</Button>
            </div>
          }
        >
          <p>This is an example modal dialog. You can put any content here.</p>
        </Modal>
      </Card>

      {/* Loading */}
      <Card title="Loading States">
        <Button
          onClick={() => {
            setShowLoading(true);
            setTimeout(() => setShowLoading(false), 3000);
          }}
          variant="primary"
        >
          Show Loading
        </Button>
        {showLoading && <Loading type="spinner" text="Loading..." />}
      </Card>
    </div>
  );
};

export default ComponentShowcase;
