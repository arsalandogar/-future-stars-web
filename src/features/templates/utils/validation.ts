import * as v from 'valibot';

export const templateAttributeSchema = v.object({
  type: v.picklist(
    ['color', 'image', 'string'],
    'Type must be color, image, or string'
  ),
  name: v.pipe(
    v.string(),
    v.nonEmpty('Name is required'),
    v.maxLength(255, 'Name must be at most 255 characters')
  ),
  label: v.pipe(
    v.string(),
    v.nonEmpty('Label is required'),
    v.maxLength(255, 'Label must be at most 255 characters')
  ),
  defaultValue: v.string(),
  defaultColor: v.string(),
});

export const templateFormSchema = v.object({
  side: v.picklist(['front', 'back'], 'Side must be front or back'),
  name: v.pipe(
    v.string(),
    v.nonEmpty('Name is required'),
    v.maxLength(255, 'Name must be at most 255 characters')
  ),
  label: v.pipe(
    v.string(),
    v.nonEmpty('Label is required'),
    v.maxLength(255, 'Label must be at most 255 characters')
  ),
  description: v.string(),
  svgString: v.string(),
  templateTypeId: v.pipe(
    v.nullable(v.number()),
    v.check((val) => val !== null, 'Template type is required')
  ),
  backTemplateId: v.nullable(v.number()),
  useDefaultBack: v.boolean(),
  isDefaultBack: v.boolean(),
  isPublished: v.boolean(),
  tagIds: v.array(v.number()),
  attributes: v.array(templateAttributeSchema),
});
