import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
    slug: 'posts',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'categories',
            label: 'Categories',
            type: 'array',
            fields: [
                {
                    name: 'capabilities',
                    label: 'Capabilities',
                    type: 'group',
                    fields: [
                        {
                            name: 'activities',
                            label: 'Activities',
                            type: 'select',
                            hasMany: true,
                            options: [
                                { label: 'Web Development', value: 'web-development' },
                                { label: 'Machine Learning', value: 'machine-learning' },
                                // Other activity options...
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    upload: true,
}
