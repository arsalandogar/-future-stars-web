export const EDITABLE_FIELDS = {
  // Names
  firstName: { type: 'text', label: 'First Name' },
  lastName: { type: 'text', label: 'Last Name' },
  fullName: { type: 'text', label: 'Full Name' },

  // Details
  team: { type: 'text', label: 'Team' },
  position: { type: 'text', label: 'Position' },
  number: { type: 'text', label: 'Number' },

  // Images
  imageOne: { type: 'image', label: 'Photo 1' },
  imageTwo: { type: 'image', label: 'Photo 2' },
  imageThree: { type: 'image', label: 'Photo 3' },

  // Colors
  colorOne: { type: 'color', label: 'Primary Color' },
  colorTwo: { type: 'color', label: 'Secondary Color' },
  colorThree: { type: 'color', label: 'Accent Color' },

  // Text on Colors
  textOnColorOne: {
    type: 'color',
    label: 'Primary Text Color',
    pairedWith: 'colorOne',
  },
  textOnColorTwo: {
    type: 'color',
    label: 'Secondary Text Color',
    pairedWith: 'colorTwo',
  },
  textOnColorThree: {
    type: 'color',
    label: 'Accent Text Color',
    pairedWith: 'colorThree',
  },
} as const;

export type EditableFieldId = keyof typeof EDITABLE_FIELDS;
export type EditableFieldType =
  (typeof EDITABLE_FIELDS)[EditableFieldId]['type'];
