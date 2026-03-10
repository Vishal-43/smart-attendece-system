import { useState } from 'react';
import {
  GlassCard,
  StatCard,
  GlassButton,
  GlassButtonGroup,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassCheckbox,
  GlassRadio,
  GlassModal,
  ConfirmModal,
  ThemeToggle,
} from '../components/ui';

export default function GlassUIShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    bio: '',
    notifications: false,
    theme: 'light',
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with theme toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--glass-text-primary)', fontSize: '2rem', fontWeight: '700' }}>
          Glassmorphism UI Showcase
        </h1>
        <ThemeToggle showLabel />
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          value="2,543"
          label="Total Students"
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          value="94.2%"
          label="Attendance Rate"
          change="+2.1%"
          changeType="positive"
        />
        <StatCard
          value="156"
          label="Active Sessions"
          change="-3.2%"
          changeType="negative"
        />
        <StatCard
          value="42"
          label="Divisions"
        />
      </div>

      {/* Card Variants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <GlassCard title="Default Card" subtitle="Standard glass card with header">
          <p style={{ color: 'var(--glass-text-secondary)' }}>
            This is a default glass card with a title and subtitle. It includes a subtle backdrop blur and border.
          </p>
        </GlassCard>

        <GlassCard variant="elevated" title="Elevated Card">
          <p style={{ color: 'var(--glass-text-secondary)' }}>
            This card has enhanced shadow for more prominence. Use for important content or featured sections.
          </p>
        </GlassCard>

        <GlassCard 
          variant="interactive" 
          title="Interactive Card"
          onClick={() => alert('Card clicked!')}
        >
          <p style={{ color: 'var(--glass-text-secondary)' }}>
            Click this card! Interactive cards have hover effects and are clickable.
          </p>
        </GlassCard>
      </div>

      {/* Buttons */}
      <GlassCard title="Buttons" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--glass-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Variants
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <GlassButton variant="primary">Primary</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="outline">Outline</GlassButton>
              <GlassButton variant="ghost">Ghost</GlassButton>
              <GlassButton variant="danger">Danger</GlassButton>
              <GlassButton variant="success">Success</GlassButton>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--glass-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sizes
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <GlassButton size="xs">Extra Small</GlassButton>
              <GlassButton size="sm">Small</GlassButton>
              <GlassButton size="md">Medium</GlassButton>
              <GlassButton size="lg">Large</GlassButton>
              <GlassButton size="xl">Extra Large</GlassButton>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--glass-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              States
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <GlassButton loading>Loading</GlassButton>
              <GlassButton disabled>Disabled</GlassButton>
              <GlassButton fullWidth>Full Width</GlassButton>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--glass-text-primary)', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Button Group
            </h4>
            <GlassButtonGroup attached>
              <GlassButton variant="outline">Left</GlassButton>
              <GlassButton variant="outline">Center</GlassButton>
              <GlassButton variant="outline">Right</GlassButton>
            </GlassButtonGroup>
          </div>
        </div>
      </GlassCard>

      {/* Form Inputs */}
      <GlassCard title="Form Inputs" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassInput
            label="Name"
            placeholder="Enter your name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <GlassInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            helpText="We'll never share your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <GlassSelect
            label="Role"
            placeholder="Select your role"
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'teacher', label: 'Teacher' },
              { value: 'student', label: 'Student' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <GlassTextarea
            label="Bio"
            placeholder="Tell us about yourself"
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          <GlassCheckbox
            label="Enable email notifications"
            checked={formData.notifications}
            onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
          />

          <div>
            <p style={{ color: 'var(--glass-text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Preferred Theme
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <GlassRadio
                name="theme"
                label="Light"
                value="light"
                checked={formData.theme === 'light'}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />
              <GlassRadio
                name="theme"
                label="Dark"
                value="dark"
                checked={formData.theme === 'dark'}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Modals */}
      <GlassCard title="Modals" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <GlassButton onClick={() => setModalOpen(true)}>
            Open Modal
          </GlassButton>
          <GlassButton variant="danger" onClick={() => setConfirmModalOpen(true)}>
            Open Confirm Modal
          </GlassButton>
        </div>

        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          footer={
            <>
              <GlassButton variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton onClick={() => setModalOpen(false)}>
                Save Changes
              </GlassButton>
            </>
          }
        >
          <p style={{ color: 'var(--glass-text-secondary)', lineHeight: '1.6' }}>
            This is a modal dialog with glassmorphism styling. It includes a backdrop blur,
            smooth animations, and can be closed by clicking outside, pressing Escape, or
            using the close button.
          </p>
        </GlassModal>

        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => alert('Confirmed!')}
          title="Confirm Delete"
          message="Are you sure you want to delete this item? This action cannot be undone."
          variant="danger"
          confirmText="Delete"
        />
      </GlassCard>
    </div>
  );
}
