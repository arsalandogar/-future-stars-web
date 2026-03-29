import {
  ActionIcon,
  Button,
  Checkbox,
  Loader,
  Modal,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useState } from 'react';

import type { Address, CartItem } from '@/types';

import { Head } from '@/components/seo/head';
import { getStripePromise, stripeAppearance } from '@/lib/stripe';

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
  const [errorModalOpened, { open: openErrorModal, close: closeErrorModal }] =
    useDisclosure(false);

  // State
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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
  const showErrors = validationErrors.length > 0;

  // Set default address on load
  if (!selectedAddress) {
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
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
    const errors: string[] = [];
    if (!selectedAddress) errors.push('Please add a shipping address');
    if (!acceptTerms) errors.push('Please accept the Terms & Conditions');

    if (errors.length > 0) {
      setValidationErrors(errors);
      openErrorModal();
      return;
    }

    setIsInitiatingCheckout(true);
    // Store cart items before checkout so display persists during payment
    setCheckoutCartItems(cartItems);

    checkout.mutate(
      {
        cartItemIds: cartItems.map((item) => item.id),
        shippingAddressId: selectedAddress!.id,
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

  const confirmPayButton = (
    <Button
      variant="filled"
      size="md"
      radius="xl"
      fullWidth
      leftSection={<CreditCard size={18} />}
      onClick={handleInitiateCheckout}
      loading={isInitiatingCheckout}
    >
      Confirm & Pay
    </Button>
  );

  const isLoading = isCartLoading || isAddressLoading;
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
              error={showErrors && !selectedAddress}
            />
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <CheckoutOrderSummary
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />
            {!clientSecret && (
              <>
                <div className={styles.termsSection}>
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.currentTarget.checked)}
                    radius={0}
                    color="primary"
                    label={
                      <Text size="sm" c="white">
                        I agree to the{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          className={styles.termsLink}
                        >
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          className={styles.termsLink}
                        >
                          Privacy Policy
                        </a>
                      </Text>
                    }
                  />
                  {showErrors && !acceptTerms && (
                    <Text size="xs" c="red" mt="xs">
                      Please accept terms & conditions to continue
                    </Text>
                  )}
                </div>
                <div className={styles.confirmButton}>{confirmPayButton}</div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Footer - only show before payment form */}
        {!clientSecret && (
          <div className={styles.mobileFooter}>{confirmPayButton}</div>
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

      {/* Error Modal */}
      <Modal
        opened={errorModalOpened}
        onClose={closeErrorModal}
        title="Please fix the following"
        centered
      >
        <div className={styles.errorList}>
          {validationErrors.map((err) => (
            <Text key={err} size="sm" c="red">
              {'\u2022'} {err}
            </Text>
          ))}
        </div>
        <Button fullWidth mt="lg" onClick={closeErrorModal}>
          Got it
        </Button>
      </Modal>

      {/* Payment Modal */}
      {clientSecret && orderId && (
        <Elements
          stripe={getStripePromise()}
          options={{
            clientSecret,
            customerSessionClientSecret:
              customerSessionClientSecret ?? undefined,
            appearance: stripeAppearance,
          }}
        >
          <PaymentModal
            opened={paymentModalOpened}
            onClose={closePaymentModal}
            amount={total}
            orderId={orderId}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </>
  );
}
