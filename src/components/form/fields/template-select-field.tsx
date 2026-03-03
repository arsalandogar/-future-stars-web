import { Group, Box, Image, Text } from '@mantine/core';
import type { SelectProps } from '@mantine/core';
import { FileX } from 'lucide-react';

import { SelectField } from './select-field';

interface TemplateOption {
  id: number;
  label: string;
  templateImageMedium: string;
}

type TemplateSelectFieldProps = Omit<
  SelectProps,
  'value' | 'onChange' | 'data' | 'renderOption'
> & {
  templates: TemplateOption[];
};

/**
 * SelectField variant that displays template options with SVG previews.
 * Uses valueAs="number" for numeric template IDs.
 */
export function TemplateSelectField({
  templates,
  ...props
}: TemplateSelectFieldProps) {
  const data = templates.map((t) => ({
    value: String(t.id),
    label: t.label,
  }));

  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const template = templates.find((t) => String(t.id) === option.value);

    return (
      <Group gap="sm" wrap="nowrap" py={4}>
        <Box
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50"
          aria-hidden="true"
        >
          {template?.templateImageMedium ? (
            <Image
              src={template.templateImageMedium}
              alt={template.label}
              fit="contain"
              className="h-full w-full"
            />
          ) : (
            <FileX className="h-4 w-4 text-gray-400" />
          )}
        </Box>
        <Text size="sm" truncate>
          {option.label}
        </Text>
      </Group>
    );
  };

  return (
    <SelectField
      valueAs="number"
      data={data}
      renderOption={renderOption}
      {...props}
    />
  );
}
