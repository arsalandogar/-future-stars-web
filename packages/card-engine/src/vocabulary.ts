export const EDITABLE_FIELDS = {
  // Names
  firstName: { type: 'text', label: 'First Name' },
  lastName: { type: 'text', label: 'Last Name' },
  fullName: { type: 'text', label: 'Full Name' },

  // Details
  team: { type: 'text', label: 'Team' },
  position: { type: 'text', label: 'Position' },
  number: { type: 'text', label: 'Number' },

  // Generic text slots
  textOne: { type: 'text', label: 'Text 1' },
  textTwo: { type: 'text', label: 'Text 2' },
  textThree: { type: 'text', label: 'Text 3' },
  textFour: { type: 'text', label: 'Text 4' },
  textFive: { type: 'text', label: 'Text 5' },
  textSix: { type: 'text', label: 'Text 6' },
  textSeven: { type: 'text', label: 'Text 7' },
  textEight: { type: 'text', label: 'Text 8' },
  textNine: { type: 'text', label: 'Text 9' },
  textTen: { type: 'text', label: 'Text 10' },
  textEleven: { type: 'text', label: 'Text 11' },
  textTwelve: { type: 'text', label: 'Text 12' },
  textThirteen: { type: 'text', label: 'Text 13' },

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
