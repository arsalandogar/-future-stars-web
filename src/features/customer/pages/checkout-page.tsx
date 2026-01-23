import { ActionIcon, Button, Loader, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';

import type { Address, CartItem } from '@/types';

import { Head } from '@/components/seo/head';

import { useCheckout } from '../api/checkout';
import { useConfirmPayment } from '../api/confirm-payment';
import { useAddresses } from '../api/get-addresses';
import { useCartItems } from '../api/get-cart-items';
import { AddressModal } from '../components/address-modal';
import { CheckoutLineItem } from '../components/checkout-line-item';
import { CheckoutOrderSummary } from '../components/checkout-order-summary';
import { CheckoutShippingSection } from '../components/checkout-shipping-section';
import { PaymentModal } from '../components/payment-modal';

import styles from './checkout-page.module.css';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading: isCartLoading } = useCartItems();
  const { data: addressData, isLoading: isAddressLoading } = useAddresses();
  const checkout = useCheckout();
  const confirmPayment = useConfirmPayment();

  const [
    addressModalOpened,
    { open: openAddressModal, close: closeAddressModal },
  ] = useDisclosure(false);
  const [
    paymentModalOpened,
    { open: openPaymentModal, close: closePaymentModal },
  ] = useDisclosure(false);

  // State
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  // Store cart items snapshot before checkout to preserve display during payment
  const [checkoutCartItems, setCheckoutCartItems] = useState<CartItem[]>([]);

  const cartItems = cartData?.data ?? [];
  const addresses = addressData?.data ?? [];
  // Use stored cart items during payment, otherwise use live cart data
  const displayCartItems =
    clientSecret && checkoutCartItems.length > 0
      ? checkoutCartItems
      : cartItems;
  const totalPacks = displayCartItems.length;
  const subtotal = displayCartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Set default address on load
  if (!selectedAddress) {
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress ?? addresses[0]);
    }
  }

  const handleBack = () => {
    void navigate({ to: '/cart' });
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    // Reset payment state when address changes
    setClientSecret(null);
    setOrderId(null);
  };

  const handleInitiateCheckout = () => {
    if (!selectedAddress) {
      notifications.show({
        title: 'Address Required',
        message: 'Please select a shipping address to continue.',
        color: 'red',
      });
      openAddressModal();
      return;
    }

    if (!acceptTerms) {
      notifications.show({
        title: 'Terms Required',
        message: 'Please accept the terms and conditions to continue.',
        color: 'red',
      });
      return;
    }

    setIsInitiatingCheckout(true);
    // Store cart items before checkout so display persists during payment
    setCheckoutCartItems(cartItems);

    checkout.mutate(
      {
        cartItemIds: cartItems.map((item) => item.id),
        shippingAddressId: selectedAddress.id,
        acceptTerms,
      },
      {
        onSuccess: (response) => {
          setClientSecret(response.data.paymentIntentSecret);
          setCustomerSessionClientSecret(
            response.data.customerSessionClientSecret
          );
          setOrderId(response.data.order.id);
          setIsInitiatingCheckout(false);
          openPaymentModal();
        },
        onError: () => {
          setIsInitiatingCheckout(false);
          // Clear the stored cart items since checkout failed
          setCheckoutCartItems([]);
          // Error notification is already shown by the API client interceptor
        },
      }
    );
  };

  const handlePaymentSuccess = () => {
    if (!orderId) return;
    closePaymentModal();

    confirmPayment.mutate(orderId, {
      onSuccess: () => {
        void navigate({
          to: '/order-success/$orderId',
          params: { orderId: String(orderId) },
        });
      },
      onError: () => {
        // Payment succeeded but confirmation failed - still navigate to success
        // The webhook will handle the status update
        void navigate({
          to: '/order-success/$orderId',
          params: { orderId: String(orderId) },
        });
      },
    });
  };

  const isLoading = isCartLoading || isAddressLoading;
  const canProceed =
    selectedAddress && acceptTerms && displayCartItems.length > 0;

  if (isLoading) {
    return (
      <>
        <Head title="Checkout" description="Complete your order" />
        <div className={styles.loading}>
          <Loader size="lg" />
        </div>
      </>
    );
  }

  // Only show empty state if no items AND not in payment flow
  if (displayCartItems.length === 0 && !clientSecret) {
    return (
      <>
        <Head title="Checkout" description="Complete your order" />
        <div className={styles.emptyState}>
          <Text size="xl" c="white" fw={600}>
            Your cart is empty
          </Text>
          <Text size="md" c="dimmed" mt="xs">
            Add some packs to continue
          </Text>
          <Button
            variant="filled"
            size="md"
            radius="xl"
            onClick={handleBack}
            mt="lg"
          >
            Go to Cart
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Checkout" description="Complete your order" />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ActionIcon
              variant="transparent"
              size="lg"
              onClick={handleBack}
              className={styles.backButton}
            >
              <ArrowLeft size={24} />
            </ActionIcon>
            <Title order={2} className={styles.headerTitle}>
              Order Summary{' '}
              <span>
                ({totalPacks} {totalPacks === 1 ? 'Pack' : 'Packs'})
              </span>
            </Title>
          </div>
          {!clientSecret && (
            <Button
              variant="filled"
              size="md"
              radius="xl"
              leftSection={<CreditCard size={18} />}
              onClick={handleInitiateCheckout}
              loading={isInitiatingCheckout}
              disabled={!canProceed}
              className={styles.confirmButton}
            >
              Confirm & Pay
            </Button>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Line Items */}
            <div className={styles.lineItems}>
              {displayCartItems.map((item) => (
                <CheckoutLineItem key={item.id} item={item} />
              ))}
            </div>

            {/* Shipping Section */}
            <CheckoutShippingSection
              address={selectedAddress}
              onEdit={openAddressModal}
            />
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <CheckoutOrderSummary
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              acceptTerms={acceptTerms}
              onAcceptTermsChange={setAcceptTerms}
              showTerms={!clientSecret}
            />
          </div>
        </div>

        {/* Mobile Footer - only show before payment form */}
        {!clientSecret && (
          <div className={styles.mobileFooter}>
            <Button
              variant="filled"
              size="md"
              radius="xl"
              fullWidth
              leftSection={<CreditCard size={18} />}
              onClick={handleInitiateCheckout}
              loading={isInitiatingCheckout}
              disabled={!canProceed}
            >
              Confirm & Pay
            </Button>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {addressModalOpened && (
        <AddressModal
          opened={addressModalOpened}
          onClose={closeAddressModal}
          selectedAddress={selectedAddress}
          onSelectAddress={handleSelectAddress}
        />
      )}

      {/* Payment Modal */}
      {clientSecret && (
        <PaymentModal
          opened={paymentModalOpened}
          onClose={closePaymentModal}
          clientSecret={clientSecret}
          customerSessionClientSecret={customerSessionClientSecret}
          amount={total}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
