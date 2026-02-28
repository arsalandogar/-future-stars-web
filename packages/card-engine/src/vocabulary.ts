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
  imageOne: { type: 'image', label: 'Image 1' },
  imageTwo: { type: 'image', label: 'Image 2' },
  imageThree: { type: 'image', label: 'Image 3' },
  imageFour: { type: 'image', label: 'Image 4' },
  imageFive: { type: 'image', label: 'Image 5' },

  // Colors
  colorOne: { type: 'color', label: 'Color 1' },
  colorTwo: { type: 'color', label: 'Color 2' },
  colorThree: { type: 'color', label: 'Color 3' },
  colorFour: { type: 'color', label: 'Color 4' },
  colorFive: { type: 'color', label: 'Color 5' },
} as const;

export type EditableFieldId = keyof typeof EDITABLE_FIELDS;
export type EditableFieldType =
  (typeof EDITABLE_FIELDS)[EditableFieldId]['type'];
