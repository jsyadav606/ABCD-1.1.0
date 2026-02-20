# React Components Library

A comprehensive collection of reusable React components for building modern web applications.

## Components Overview

### Form Components
- **Input** - Text input field with validation
- **Select** - Dropdown select with options
- **Textarea** - Multi-line text area
- **Form** - Form wrapper with grid layout support

### Button Component
- **Button** - Versatile button with multiple variants and sizes

### Data Display Components
- **Table** - Responsive table with striped, hover, and bordered options
- **Card** - Container component with header, body, and footer
- **Badge** - Status badge with multiple variants

### Feedback Components
- **Alert** - Alert messages with different types (success, danger, warning, info)
- **Modal** - Dialog modal with customizable size
- **Loading** - Loading indicators (spinner, dots, progress bar)

### Navigation Components
- **Pagination** - Page navigation
- **Breadcrumb** - Breadcrumb navigation trail

## Usage Examples

### Button
```jsx
import { Button } from './components';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="danger" outline>
  Danger Action
</Button>
```

### Input
```jsx
import { Input } from './components';

<Input
  label="Email"
  name="email"
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

### Form
```jsx
import { Form, Input, Select, Textarea, Button } from './components';

<Form onSubmit={handleSubmit}>
  <Input name="name" label="Full Name" required />
  <Input name="email" label="Email" type="email" required />
  <Textarea name="message" label="Message" rows={5} />
  <Button type="submit">Submit</Button>
</Form>
```

### Table
```jsx
import { Table } from './components';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => <Button>Edit</Button>
  }
];

<Table columns={columns} data={tableData} />
```

### Modal
```jsx
import { Modal, Button } from './components';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  Are you sure you want to proceed?
</Modal>
```

### Alert
```jsx
import { Alert } from './components';

<Alert type="success" title="Success">
  Operation completed successfully
</Alert>
```

### Loading
```jsx
import { Loading } from './components';

<Loading type="spinner" size="md" text="Loading..." />
```

## Component Props

### Button
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-*'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `fullWidth`: boolean
- `disabled`: boolean
- `onClick`: function

### Input/Select/Textarea
- `label`: string
- `required`: boolean
- `disabled`: boolean
- `error`: string
- `value`: string
- `onChange`: function
- `onBlur`: function

### Table
- `columns`: Array of { key, label, width, render? }
- `data`: Array of objects
- `striped`: boolean
- `hover`: boolean
- `bordered`: boolean

### Card
- `title`: string
- `subtitle`: string
- `footer`: ReactNode

### Modal
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'

### Alert
- `type`: 'success' | 'danger' | 'warning' | 'info'
- `title`: string
- `closable`: boolean

### Loading
- `type`: 'spinner' | 'dots' | 'bar'
- `size`: 'sm' | 'md' | 'lg'
- `text`: string
- `fullScreen`: boolean

### Pagination
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: function
- `size`: 'sm' | 'md' | 'lg'

### Breadcrumb
- `items`: Array of { label, href? }
- `separator`: string
