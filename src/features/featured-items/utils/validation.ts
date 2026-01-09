import * as v from 'valibot';

export const featuredItemTitleSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('Title is required'),
  v.maxLength(255, 'Title must be at most 255 characters')
);

export const featuredItemCtaTextSchema = v.pipe(
  v.string(),
  v.maxLength(100, 'Max 100 characters')
);

export const featuredItemDescriptionSchema = v.pipe(
  v.string(),
  v.maxLength(500, 'Description must be at most 500 characters')
);

export const featuredItemSchema = v.object({
  title: featuredItemTitleSchema,
  description: featuredItemDescriptionSchema,
  ctaText: featuredItemCtaTextSchema,
  displayOrder: v.number(),
  templateId: v.nullable(v.number()),
  image: v.nullable(v.file()),
  isActive: v.boolean(),
});
