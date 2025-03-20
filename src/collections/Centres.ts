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
             name: 'media',
             type: 'group',
             fields: [
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
        }
      ]
    },
  ],
}
