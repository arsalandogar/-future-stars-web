import { Button, Select, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';

import { useUpdateProfile } from '../../api/update-profile';
import styles from './account-section.module.css';

const INPUT_STYLES = {
  input: {
    backgroundColor: 'var(--customer-input-bg)',
    borderColor: 'var(--customer-input-bg)',
    color: 'white',
    fontSize: 'var(--mantine-font-size-md)',
    height: '48px',
    '&:focus': {
      borderColor: 'var(--mantine-color-primary-4)',
    },
  },
  label: {
    color: 'var(--mantine-color-dimmed)',
    fontSize: 'var(--mantine-font-size-md)',
    fontWeight: 600,
    marginBottom: 6,
  },
};

export function AccountDetailsSection() {
  const { user, setAuth, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone?.replace('+1', '') ?? '',
    email: user?.email ?? '',
  });

  const updateProfile = useUpdateProfile();

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone?.replace('+1', '') ?? '',
      email: user?.email ?? '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    const phoneWithCountryCode = formData.phone ? `+1${formData.phone.replace(/\D/g, '')}` : undefined;
    updateProfile.mutate(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: phoneWithCountryCode,
        email: formData.email,
      },
      {
        onSuccess: (updatedUser) => {
          if (token) {
            setAuth(token, updatedUser);
          }
          setIsEditing(false);
        },
      }
    );
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhoneDisplay = (phone: string | undefined): string => {
    if (!phone) return 'Not set';
    const cleaned = phone.replace(/\D/g, '').replace(/^1/, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (isEditing) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              Account Details
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              Manage your personal information and account settings
            </Text>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.fieldGroup}>
            <TextInput
              label="Name"
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                const firstName = parts[0] || '';
                const lastName = parts.slice(1).join(' ');
                setFormData((prev) => ({ ...prev, firstName, lastName }));
              }}
              styles={INPUT_STYLES}
            />
            <div>
              <Text component="span" size="md" c="dimmed" fw={600} mb={6} display="block">
                Phone *
              </Text>
              <div style={{ display: 'flex', gap: 'var(--mantine-spacing-xs)' }}>
                <Select
                  value="+1"
                  data={[{ value: '+1', label: '+1 (US)' }]}
                  disabled
                  w={110}
                  styles={{
                    input: {
                      backgroundColor: 'var(--customer-input-bg)',
                      borderColor: 'var(--customer-input-bg)',
                      color: 'white',
                      fontSize: 'var(--mantine-font-size-md)',
                      height: '48px',
                    },
                  }}
                />
                <TextInput
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={{ flex: 1 }}
                  styles={INPUT_STYLES}
                />
              </div>
            </div>
            <TextInput
              label="Email *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              styles={INPUT_STYLES}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="filled"
            radius="xl"
            size="lg"
            onClick={handleCancel}
            disabled={updateProfile.isPending}
            styles={{
              root: {
                backgroundColor: 'var(--customer-button-secondary-bg)',
                '&:hover': {
                  backgroundColor: 'var(--customer-button-secondary-bg)',
                  opacity: 0.9,
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            radius="xl"
            size="lg"
            onClick={handleSave}
            loading={updateProfile.isPending}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Title order={2} c="white" fw={800} className={styles.title}>
            Account Details
          </Title>
          <Text component="span" c="dimmed" size="md" display="block">
            Manage your personal information and account settings
          </Text>
        </div>
        <Button
          variant="transparent"
          className={styles.editButton}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <span className={styles.fieldValue}>{user?.fullName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone *</span>
            <span className={styles.fieldValue}>{formatPhoneDisplay(user?.phone)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email *</span>
            <span className={styles.fieldValue}>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
