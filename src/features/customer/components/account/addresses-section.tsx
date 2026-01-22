import { AddressElement, Elements } from '@stripe/react-stripe-js';
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import { Button, Group, Loader, Modal, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { Address, CreateAddressParams } from '@/types';

import { stripeAppearance, stripePromise } from '@/lib/stripe';

import { useCreateAddress } from '../../api/create-address';
import { useDeleteAddress } from '../../api/delete-address';
import { useAddresses } from '../../api/get-addresses';
import { useSetDefaultAddress } from '../../api/set-default-address';
import styles from './account-section.module.css';
import paymentModalStyles from '../payment-modal.module.css';

// Inner component for the address form - needs Elements context
interface AddressFormInnerProps {
  addressCount: number;
  onAddressChange: (data: CreateAddressParams | null, complete: boolean) => void;
}

function AddressFormInner({ addressCount, onAddressChange }: AddressFormInnerProps) {
  const handleChange = (event: StripeAddressElementChangeEvent) => {
    if (event.complete) {
      const { firstName, lastName, phone, address } = event.value;

      onAddressChange(
        {
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          addressLine1: address.line1 ?? '',
          addressLine2: address.line2 ?? undefined,
          city: address.city ?? '',
          state: address.state ?? '',
          postalCode: address.postal_code ?? '',
          country: address.country ?? 'US',
          phone: phone?.replace(/\+/g, '') ?? '',
          isDefault: addressCount === 0,
        },
        true
      );
    } else {
      onAddressChange(null, false);
    }
  };

  return (
    <AddressElement
      options={{
        mode: 'shipping',
        defaultValues: {
          address: {
            country: 'US',
          },
        },
        fields: {
          phone: 'always',
        },
        validation: {
          phone: {
            required: 'always',
          },
        },
        allowedCountries: ['US'],
        display: {
          name: 'split',
        },
      }}
      onChange={handleChange}
    />
  );
}

export function AddressesSection() {
  const { data, isLoading } = useAddresses();
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [addressData, setAddressData] = useState<CreateAddressParams | null>(null);
  const [isAddressComplete, setIsAddressComplete] = useState(false);

  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const addresses = data?.data ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault);
  const otherAddresses = addresses.filter((a) => !a.isDefault);

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    openDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!addressToDelete) return;
    deleteAddress.mutate(addressToDelete.id, {
      onSuccess: () => {
        closeDeleteModal();
        setAddressToDelete(null);
      },
    });
  };

  const handleSetDefault = (id: number) => {
    setDefaultAddress.mutate(id);
  };

  const handleAddressChange = (data: CreateAddressParams | null, complete: boolean) => {
    setIsAddressComplete(complete);
    setAddressData(data);
  };

  const handleSaveAddress = () => {
    if (!addressData) return;

    createAddress.mutate(addressData, {
      onSuccess: () => {
        closeAddModal();
        setAddressData(null);
        setIsAddressComplete(false);
      },
    });
  };

  const handleCloseAddModal = () => {
    closeAddModal();
    setAddressData(null);
    setIsAddressComplete(false);
  };

  if (isLoading) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              Shipping Addresses
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              Manage your shipping addresses
            </Text>
          </div>
        </div>
        <div className={styles.card} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Title order={2} c="white" fw={800} className={styles.title}>
            Shipping Addresses
          </Title>
          <Text component="span" c="dimmed" size="md" display="block">
            Manage your shipping addresses
          </Text>
        </div>
      </div>

      <div className={styles.cardsList}>
        {defaultAddress && (
          <AddressCard
            address={defaultAddress}
            isDefault
            onDelete={() => handleDeleteClick(defaultAddress)}
          />
        )}

        {otherAddresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onDelete={() => handleDeleteClick(address)}
            onSetDefault={() => handleSetDefault(address.id)}
          />
        ))}

        {addresses.length === 0 && (
          <div className={styles.card}>
            <Text c="dimmed" ta="center" py="xl">
              No addresses saved yet
            </Text>
          </div>
        )}
      </div>

      <div className={styles.actions} style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
        <Button
          variant="filled"
          radius="xl"
          leftSection={<MapPin size={18} />}
          onClick={openAddModal}
        >
          Add Address
        </Button>
      </div>

      {/* Add Address Modal with Stripe AddressElement */}
      <Modal
        opened={addModalOpened}
        onClose={handleCloseAddModal}
        title={
          <Title order={4} c="white">
            Add Address
          </Title>
        }
        centered
        size="md"
        classNames={{
          content: paymentModalStyles.content,
          body: paymentModalStyles.body,
          header: paymentModalStyles.header,
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--mantine-color-primary-4)',
          },
        }}
      >
        <div style={{ minHeight: 300 }}>
          <Elements stripe={stripePromise} options={{ appearance: stripeAppearance }}>
            <AddressFormInner
              addressCount={addresses.length}
              onAddressChange={handleAddressChange}
            />
          </Elements>
        </div>
        <Group justify="space-between" mt="xl">
          <Button
            variant="transparent"
            color="white"
            leftSection={<ArrowLeft size={18} />}
            onClick={handleCloseAddModal}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            radius="xl"
            onClick={handleSaveAddress}
            loading={createAddress.isPending}
            disabled={!isAddressComplete}
          >
            Save Address
          </Button>
        </Group>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Title order={4} c="white">
            Delete Address
          </Title>
        }
        centered
        size="sm"
        classNames={{
          content: paymentModalStyles.content,
          body: paymentModalStyles.body,
          header: paymentModalStyles.header,
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--mantine-color-primary-4)',
          },
        }}
      >
        <Text c="dimmed" size="md">
          Are you sure you want to delete the address for{' '}
          <Text component="span" c="white" fw={500}>
            {addressToDelete ? `${addressToDelete.firstName} ${addressToDelete.lastName ?? ''}`.trim() : 'this address'}
          </Text>
          ?
        </Text>
        <Group justify="space-between" mt="xl">
          <Button
            variant="transparent"
            color="white"
            leftSection={<ArrowLeft size={18} />}
            onClick={closeDeleteModal}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            radius="xl"
            leftSection={<Trash2 size={18} />}
            onClick={handleConfirmDelete}
            loading={deleteAddress.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  isDefault?: boolean;
  onDelete: () => void;
  onSetDefault?: () => void;
}

function AddressCard({
  address,
  isDefault,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const addressLine = `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mantine-spacing-sm)' }}>
          <Text c="white" fw={500} size="md" style={{ margin: 0 }}>
            {name}
          </Text>
          {isDefault ? (
            <Button size="compact-xs" radius="xl" variant="filled">
              Default
            </Button>
          ) : (
            onSetDefault && (
              <Button size="compact-xs" radius="xl" variant="outline" onClick={onSetDefault}>
                Default
              </Button>
            )
          )}
        </div>
        <Button
          size="compact-xs"
          variant="transparent"
          onClick={onDelete}
          fw={700}
          style={{ color: 'var(--mantine-primary-color-light-color)' }}
        >
          Remove
        </Button>
      </div>
      <Text c="dimmed" size="sm" style={{ margin: 0 }}>
        {addressLine}
      </Text>
    </div>
  );
}
