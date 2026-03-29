import { AddressElement } from '@stripe/react-stripe-js';
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js';

import type { CreateAddressParams } from '@/types';

export interface AddressFormInnerProps {
  addressCount: number;
  defaultPhone?: string;
  onAddressChange: (
    data: CreateAddressParams | null,
    complete: boolean
  ) => void;
}

/**
 * Inner component for the Stripe address form.
 * Must be used within a Stripe Elements context.
 */
export function AddressFormInner({
  addressCount,
  defaultPhone,
  onAddressChange,
}: AddressFormInnerProps) {
  const handleChange = (event: StripeAddressElementChangeEvent) => {
    if (event.complete) {
      const { firstName, lastName, phone, address } = event.value;

      onAddressChange(
        {
          firstName: firstName || '',
          lastName: lastName || '',
          addressLine1: address.line1 || '',
          addressLine2: address.line2 || undefined,
          city: address.city || '',
          state: address.state || '',
          postalCode: address.postal_code || '',
          country: address.country || 'US',
          phone: phone?.replace(/\+/g, '') || '',
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
          ...(defaultPhone ? { phone: `+${defaultPhone}` } : {}),
        },
        fields: {
          phone: 'always',
        },
        validation: {
          phone: {
            required: addressCount === 0 ? 'always' : 'never',
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
