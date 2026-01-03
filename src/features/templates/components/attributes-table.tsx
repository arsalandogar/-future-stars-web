import {
  ActionIcon,
  Badge,
  ColorInput,
  ColorSwatch,
  Group,
  Select,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Trash2 } from 'lucide-react';

import type {
  TemplateAttribute,
  TemplateAttributeFormValues,
  TemplateAttributeType,
} from '../types';
import { useTemplateFormContext } from './template-form-context';

const ATTRIBUTE_TYPE_OPTIONS: {
  value: TemplateAttributeType;
  label: string;
}[] = [
  { value: 'string', label: 'String' },
  { value: 'color', label: 'Color' },
  { value: 'image', label: 'Image' },
];

const COLOR_SWATCHES = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

type ViewModeProps = {
  mode: 'view';
  attributes: TemplateAttribute[];
};

type EditModeProps = {
  mode: 'edit';
  attributes: TemplateAttributeFormValues[];
  onRemove: (index: number) => void;
};

type AttributesTableProps = ViewModeProps | EditModeProps;

export function AttributesTable(props: AttributesTableProps) {
  const { mode, attributes } = props;

  if (attributes.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {mode === 'edit' ? 'No attributes added yet.' : 'No attributes.'}
      </Text>
    );
  }

  return (
    <Table.ScrollContainer minWidth="100%">
      <Table horizontalSpacing="sm" verticalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={180}>Type</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Label</Table.Th>
            <Table.Th w={200}>Default Value</Table.Th>
            <Table.Th w={200}>Text Color</Table.Th>
            {mode === 'edit' && <Table.Th w={40}></Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mode === 'view' ? (
            <ViewRows attributes={props.attributes} />
          ) : (
            <EditRows attributes={props.attributes} onRemove={props.onRemove} />
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function ViewRows({ attributes }: { attributes: TemplateAttribute[] }) {
  return (
    <>
      {attributes.map((attr) => (
        <Table.Tr key={attr.id}>
          <Table.Td>
            <Badge variant="outline" size="sm" tt="capitalize">
              {attr.type}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Text size="sm">{attr.name}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">{attr.label}</Text>
          </Table.Td>
          <Table.Td>
            {attr.type === 'color' && attr.defaultValue ? (
              <Group gap="xs">
                <ColorSwatch color={attr.defaultValue} size={16} />
                <Text size="sm">{attr.defaultValue}</Text>
              </Group>
            ) : attr.defaultValue ? (
              <Text size="sm">{attr.defaultValue}</Text>
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </Table.Td>
          <Table.Td>
            {attr.type === 'string' && attr.defaultColor ? (
              <Group gap="xs">
                <ColorSwatch color={attr.defaultColor} size={16} />
                <Text size="sm">{attr.defaultColor}</Text>
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}

function EditRows({
  attributes,
  onRemove,
}: {
  attributes: TemplateAttributeFormValues[];
  onRemove: (index: number) => void;
}) {
  const form = useTemplateFormContext();

  return (
    <>
      {attributes.map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td>
            <form.Field name={`attributes[${index}].type`}>
              {(field) => (
                <Select
                  variant="filled"
                  data={ATTRIBUTE_TYPE_OPTIONS}
                  value={field.state.value}
                  onChange={(value) =>
                    field.handleChange(value as TemplateAttributeType)
                  }
                  size="sm"
                />
              )}
            </form.Field>
          </Table.Td>

          <Table.Td>
            <form.Field name={`attributes[${index}].name`}>
              {(field) => (
                <TextInput
                  variant="filled"
                  size="sm"
                  placeholder="name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </Table.Td>

          <Table.Td>
            <form.Field name={`attributes[${index}].label`}>
              {(field) => (
                <TextInput
                  variant="filled"
                  size="sm"
                  placeholder="Label"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
          </Table.Td>

          <Table.Td>
            <form.Subscribe
              selector={(state) => state.values.attributes[index]?.type}
            >
              {(type) =>
                type === 'color' ? (
                  <form.Field name={`attributes[${index}].defaultValue`}>
                    {(field) => (
                      <ColorInput
                        variant="filled"
                        size="sm"
                        format="hex"
                        swatches={COLOR_SWATCHES}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    )}
                  </form.Field>
                ) : (
                  <form.Field name={`attributes[${index}].defaultValue`}>
                    {(field) => (
                      <TextInput
                        variant="filled"
                        size="sm"
                        placeholder="Default"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>
          </Table.Td>

          <Table.Td>
            <form.Subscribe
              selector={(state) => state.values.attributes[index]?.type}
            >
              {(type) =>
                type === 'string' ? (
                  <form.Field name={`attributes[${index}].defaultColor`}>
                    {(field) => (
                      <ColorInput
                        variant="filled"
                        size="sm"
                        format="hex"
                        swatches={COLOR_SWATCHES}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      />
                    )}
                  </form.Field>
                ) : null
              }
            </form.Subscribe>
          </Table.Td>

          <Table.Td>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onRemove(index)}
              aria-label="Remove attribute"
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}
