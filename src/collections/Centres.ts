import type { CollectionConfig } from 'payload'

export const Centres: CollectionConfig = {
  slug: 'centres',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
          ]
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'featuredImage',
              label: 'Featured Image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: {
                mimeType: {contains: 'image'},
              },
            },
            {
              name: 'logo',
              label: 'Logo',
              type: 'upload',
              relationTo: 'media',
              filterOptions: {
                mimeType: {contains: 'image'},
              },
            },
            {
              name: 'images',
              label: 'Images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              filterOptions: {
                mimeType: {contains: 'image'},
              },
            },
          ]
        }
      ]
    },
  ],
}
