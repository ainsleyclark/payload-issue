import type { CollectionConfig, ImageSize } from 'payload'

const sizes: ImageSize[] = [
  {
    name: 'webp',
    width: undefined,
    height: undefined,
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  {
    name: 'thumbnail',
    width: 200,
    height: undefined,
    position: 'centre',
  },
  {
    name: 'thumbnail_webp',
    width: 200,
    height: undefined,
    position: 'centre',
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  {
    name: 'mobile',
    width: 500,
    height: undefined,
  },
  {
    name: 'mobile_webp',
    width: 500,
    height: undefined,
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  {
    name: 'tablet',
    width: 800,
    height: undefined,
  },
  {
    name: 'tablet_webp',
    width: 800,
    height: undefined,
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  {
    name: 'desktop',
    width: 1200,
    height: undefined,
  },
  {
    name: 'desktop_webp',
    width: 1200,
    height: undefined,
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
]

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alternative Text',
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Caption',
    },
    {
      name: 'source',
      label: 'Source',
      type: 'text',
      defaultValue: 'user',
      required: true,
    },
    {
      name: 'sourceUrl',
      label: 'Source URL',
      type: 'text',
      unique: true,
    },
    {
      name: 'meta',
      type: 'json',
      defaultValue: '{}',
      required: true,
    },
  ],
  upload: {
    imageSizes: sizes,
  },
}
