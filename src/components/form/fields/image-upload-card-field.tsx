import { useFieldContext } from '@/lib/form-context';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  UnstyledButton,
  Box,
  Image,
  FileInput,
} from '@mantine/core';
import type { FileInputProps } from '@mantine/core';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useRef } from 'react';

type ImageUploadCardProps = Omit<FileInputProps, 'value' | 'onChange'> & {
  existingImageUrl?: string;
  height?: number;
  maxSizeText?: string;
  maxSizeInBytes?: number;
};

export function ImageUploadCardField({
  existingImageUrl,
  label,
  height = 160,
  maxSizeText = 'PNG, JPG, JPEG up to 10MB',
  maxSizeInBytes,
  ...props
}: ImageUploadCardProps) {
  const field = useFieldContext<File | null>();
  const fileInputRef = useRef<HTMLButtonElement>(null);

  const value = field.state.value;
  const hasNewFile = !!value;
  const hasExistingImage = !!existingImageUrl;
  const previewUrl = hasNewFile ? URL.createObjectURL(value) : existingImageUrl;
  const error = (field.state.meta.errors[0] as { message: string } | undefined)
    ?.message;

  const handleFileChange = (file: File | null) => {
    if (maxSizeInBytes) {
      if (file && file.size > maxSizeInBytes) {
        alert(`File is too large! Maximum size is ${maxSizeText}`);
        field.handleChange(null);
        return;
      }
    }
    field.handleChange(file);
  };

  const handleRemove = () => {
    field.handleChange(null);
  };

  return (
    <Box>
      {label && (
        <Text size="sm" fw={500} mb="xs">
          {label}
        </Text>
      )}

      <FileInput
        ref={fileInputRef}
        value={value}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        {...props}
      />

      {hasNewFile || hasExistingImage ? (
        <Card
          withBorder
          radius="md"
          p={0}
          className="relative"
          style={error ? { borderColor: 'var(--mantine-color-red-6)' } : {}}
        >
          <Image src={previewUrl} h={height} fit="cover" radius="md" />
          <Group gap="xs" className="absolute right-2 top-2">
            <ActionIcon
              variant="filled"
              color="dark"
              size="sm"
              radius="xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              radius="xl"
              onClick={handleRemove}
            >
              <X size={14} />
            </ActionIcon>
          </Group>
        </Card>
      ) : (
        <UnstyledButton
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Card
            withBorder
            radius="md"
            p="xl"
            className="flex flex-col items-center justify-center border-dashed hover:bg-gray-50"
            style={error ? { borderColor: 'var(--mantine-color-red-6)' } : {}}
          >
            <Box className="mb-2 rounded-full bg-gray-100 p-3">
              <ImageIcon size={24} className="text-gray-400" />
            </Box>
            <Text size="sm" fw={500}>
              Click to upload image
            </Text>
            <Text size="xs" c="dimmed">
              {maxSizeText}
            </Text>
          </Card>
        </UnstyledButton>
      )}

      {error && (
        <Text size="xs" c="red" mt="xs">
          {error}
        </Text>
      )}
    </Box>
  );
}
