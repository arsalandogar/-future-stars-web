import {
  ActionIcon,
  Button,
  Loader,
  Modal,
  Radio,
  Text,
  Title,
} from '@mantine/core';
import { Elements } from '@stripe/react-stripe-js';
import { ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import type { Address, CreateAddressParams } from '@/types';

import { getStripePromise, stripeAppearance } from '@/lib/stripe';

import { useCreateAddress } from '../api/create-address';
import { useDeleteAddress } from '../api/delete-address';
import { useAddresses } from '../api/get-addresses';
import { useSetDefaultAddress } from '../api/set-default-address';

import { AddressFormInner } from './address-form-inner';
import styles from './address-modal.module.css';

interface AddressModalProps {
  opened: boolean;
  onClose: () => void;
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
}

type ModalView = 'list' | 'add-new';

export function AddressModal({
  opened,
  onClose,
  selectedAddress,
  onSelectAddress,
}: AddressModalProps) {
  const { data, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const addresses = data?.data ?? [];

  // Use null to indicate "use computed default", explicit value for user choice
  const [viewOverride, setViewOverride] = useState<ModalView | null>(null);
  const [addressData, setAddressData] = useState<CreateAddressParams | null>(
    null
  );
  const [isAddressComplete, setIsAddressComplete] = useState(false);

  // Compute effective view: user choice or default based on addresses
  const view = viewOverride ?? (addresses.length === 0 ? 'add-new' : 'list');

  const handleAddressChange = (
    data: CreateAddressParams | null,
    complete: boolean
  ) => {
    setIsAddressComplete(complete);
    setAddressData(data);
  };

  const handleSaveAddress = () => {
    if (!addressData) return;

    createAddress.mutate(addressData, {
      onSuccess: (newAddress) => {
        onSelectAddress(newAddress);
        setViewOverride('list');
        setAddressData(null);
        setIsAddressComplete(false);
      },
    });
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    onClose();
  };

  const handleDeleteAddress = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAddress.mutate(address.id);
  };

  const handleSetDefault = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setDefaultAddress.mutate(address.id);
  };

  const handleBack = () => {
    if (view === 'add-new' && addresses.length > 0) {
      setViewOverride('list');
      setAddressData(null);
      setIsAddressComplete(false);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="lg"
      classNames={{
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <Title order={4} className={styles.headerTitle}>
          {view === 'list' ? 'SELECT ADDRESS' : 'ADD NEW ADDRESS'}
        </Title>
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={onClose}
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentSection}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="md" />
          </div>
        ) : view === 'list' ? (
          <>
            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`${styles.addressItem} ${
                    selectedAddress?.id === address.id
                      ? styles.addressItemSelected
                      : ''
                  }`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <Radio
                    checked={selectedAddress?.id === address.id}
                    onChange={() => handleSelectAddress(address)}
                    className={styles.radioButton}
                  />
                  <div className={styles.addressDetails}>
                    <Text className={styles.addressName}>
                      {address.firstName} {address.lastName}
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </Text>
                    <Text className={styles.addressLine}>
                      {address.addressLine1}
                    </Text>
                    {address.addressLine2 && (
                      <Text className={styles.addressLine}>
                        {address.addressLine2}
                      </Text>
                    )}
                    <Text className={styles.addressLine}>
                      {address.city}, {address.state} {address.postalCode}
                    </Text>
                    {address.phone && (
                      <Text className={styles.addressLine}>
                        {address.phone}
                      </Text>
                    )}
                  </div>
                  <div className={styles.addressActions}>
                    {!address.isDefault && (
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={(e) => handleSetDefault(address, e)}
                        title="Set as default"
                        loading={setDefaultAddress.isPending}
                      >
                        <Check size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => handleDeleteAddress(address, e)}
                      title="Delete address"
                      loading={deleteAddress.isPending}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="subtle"
              leftSection={<Plus size={18} />}
              onClick={() => setViewOverride('add-new')}
              className={styles.addNewButton}
              fullWidth
            >
              Add new address
            </Button>
          </>
        ) : (
          <div className={styles.addressForm}>
            <Elements
              stripe={getStripePromise()}
              options={{ appearance: stripeAppearance }}
            >
              <AddressFormInner
                addressCount={addresses.length}
                onAddressChange={handleAddressChange}
              />
            </Elements>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="transparent"
          color="white"
          leftSection={<ArrowLeft size={18} />}
          onClick={handleBack}
          className={styles.cancelButton}
        >
          {view === 'add-new' && addresses.length > 0 ? 'Back' : 'Cancel'}
        </Button>
        {view === 'add-new' && (
          <Button
            variant="filled"
            onClick={handleSaveAddress}
            loading={createAddress.isPending}
            disabled={!isAddressComplete}
          >
            Save Address
          </Button>
        )}
      </div>
    </Modal>
  );
}
