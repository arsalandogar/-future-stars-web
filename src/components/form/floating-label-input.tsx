import { useState } from 'react';
import { PasswordInput, TextInput } from '@mantine/core';
import type { PasswordInputProps, TextInputProps } from '@mantine/core';

import classes from './floating-label-input.module.css';

type FloatingLabelInputProps = Omit<TextInputProps, 'classNames'> & {
  value: string;
};

export function FloatingLabelInput({
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <TextInput
      classNames={classes}
      value={value}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
      {...props}
    />
  );
}

type FloatingPasswordInputProps = Omit<PasswordInputProps, 'classNames'> & {
  value: string;
};

export function FloatingPasswordInput({
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingPasswordInputProps) {
  const [focused, setFocused] = useState(false);
  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <PasswordInput
      classNames={classes}
      value={value}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
      {...props}
    />
  );
}
