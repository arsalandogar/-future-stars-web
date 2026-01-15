import { ActionIcon, ColorSwatch, Group, Table, Text } from '@mantine/core';
import { Image, Palette, Trash2, Type } from 'lucide-react';

import type {
  TemplateAttribute,
  TemplateAttributeFormValues,
  TemplateAttributeType,
} from '../types';

import { useTemplateFormContext } from './template-form-context';

const ATTRIBUTE_TYPES: Record<
  TemplateAttributeType,
  { icon: typeof Type; label: string }
> = {
  string: { icon: Type, label: 'String' },
  color: { icon: Palette, label: 'Color' },
  image: { icon: Image, label: 'Image' },
};

const ATTRIBUTE_TYPE_OPTIONS = Object.entries(ATTRIBUTE_TYPES).map(
  ([value, { label }]) => ({
    value: value as TemplateAttributeType,
    label,
  })
);

function TypeIcon({ type }: { type: TemplateAttributeType }) {
  const Icon = ATTRIBUTE_TYPES[type].icon;
  return <Icon size={16} />;
}

function TypeDisplay({ type }: { type: TemplateAttributeType }) {
  const { label } = ATTRIBUTE_TYPES[type];
  return (
    <Group gap={6} wrap="nowrap">
      <TypeIcon type={type} />
      <Text size="sm">{label}</Text>
    </Group>
  );
}

function renderTypeOption({ option }: { option: { value: string } }) {
  return <TypeDisplay type={option.value as TemplateAttributeType} />;
}

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

function DefaultValueCell({ attr }: { attr: TemplateAttribute }) {
  if (!attr.defaultValue) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  if (attr.type === 'color') {
    return (
      <Group gap="xs">
        <ColorSwatch color={attr.defaultValue} size={16} />
        <Text size="sm">{attr.defaultValue}</Text>
      </Group>
    );
  }

  return <Text size="sm">{attr.defaultValue}</Text>;
}

function TextColorCell({ attr }: { attr: TemplateAttribute }) {
  if (attr.type !== 'string' || !attr.defaultColor) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  return (
    <Group gap="xs">
      <ColorSwatch color={attr.defaultColor} size={16} />
      <Text size="sm">{attr.defaultColor}</Text>
    </Group>
  );
}

function ViewRows({ attributes }: { attributes: TemplateAttribute[] }) {
  return (
    <>
      {attributes.map((attr) => (
        <Table.Tr key={attr.id}>
          <Table.Td>
            <TypeDisplay type={attr.type} />
          </Table.Td>
          <Table.Td>
            <Text size="sm">{attr.name}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm">{attr.label}</Text>
          </Table.Td>
          <Table.Td>
            <DefaultValueCell attr={attr} />
          </Table.Td>
          <Table.Td>
            <TextColorCell attr={attr} />
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
      {attributes.map((attr, index) => (
        <Table.Tr key={attr._formId}>
          <Table.Td>
            <form.AppField name={`attributes[${index}].type`}>
              {(field) => (
                <field.SelectField
                  variant="filled"
                  data={ATTRIBUTE_TYPE_OPTIONS}
                  size="sm"
                  renderOption={renderTypeOption}
                  leftSection={
                    field.state.value && <TypeIcon type={field.state.value} />
                  }
                />
              )}
            </form.AppField>
          </Table.Td>

          <Table.Td>
            <form.AppField name={`attributes[${index}].name`}>
              {(field) => (
                <field.TextField
                  variant="filled"
                  size="sm"
                  placeholder="Name"
                />
              )}
            </form.AppField>
          </Table.Td>

          <Table.Td>
            <form.AppField name={`attributes[${index}].label`}>
              {(field) => (
                <field.TextField
                  variant="filled"
                  size="sm"
                  placeholder="Label"
                />
              )}
            </form.AppField>
          </Table.Td>

          <Table.Td>
            <form.Subscribe
              selector={(state) => ({
                type: state.values.attributes[index]?.type,
                defaultValue: state.values.attributes[index]?.defaultValue,
              })}
            >
              {({ type, defaultValue }) =>
                type === 'color' ? (
                  <Group gap="xs" wrap="nowrap">
                    {defaultValue && (
                      <ColorSwatch color={defaultValue} size={20} />
                    )}
                    <form.AppField name={`attributes[${index}].defaultValue`}>
                      {(field) => (
                        <field.ColorInputField
                          variant="filled"
                          size="sm"
                          format="hex"
                          swatches={COLOR_SWATCHES}
                        />
                      )}
                    </form.AppField>
                  </Group>
                ) : (
                  <form.AppField name={`attributes[${index}].defaultValue`}>
                    {(field) => (
                      <field.TextField
                        variant="filled"
                        size="sm"
                        placeholder="Default"
                      />
                    )}
                  </form.AppField>
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
                  <form.AppField name={`attributes[${index}].defaultColor`}>
                    {(field) => (
                      <field.ColorInputField
                        variant="filled"
                        size="sm"
                        format="hex"
                        swatches={COLOR_SWATCHES}
                      />
                    )}
                  </form.AppField>
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
