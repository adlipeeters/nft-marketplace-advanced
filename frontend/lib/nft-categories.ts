
export const NFT_CATEGORIES = [
    {
        "id": "all",
        "name": "All",
        "attributes": [
            {
                "name": "Rarity",
                "type": "select",
                "options": ["Common", "Rare", "Epic", "Legendary"],
                "value": "Common"
            },
            // {
            //     "name": "Creator",
            //     "type": "text"
            // }
        ]
    },
    {
        "id": "games",
        "name": "Games",
        "attributes": [
            {
                "name": "Level",
                "type": "number",
                "min": 1,
                "max": 100,
                "value": 1
            },
            {
                "name": "Power",
                "type": "number",
                "min": 1,
                "max": 1000,
                "value": 1
            }
        ]
    },
    {
        "id": "art",
        "name": "Art",
        "attributes": [
            {
                "name": "Style",
                "type": "select",
                "options": ["Abstract", "Realism", "Impressionism"],
                "value": "Abstract"
            },
            {
                "name": "Medium",
                "type": "select",
                "options": ["Digital", "Oil", "Watercolor"],
                "value": "Digital"
            }
        ]
    },
    {
        "id": "music",
        "name": "Music",
        "attributes": [
            {
                "name": "Genre",
                "type": "select",
                "options": ["Rock", "Pop", "Classical"],
                "value": "Rock"
            },
            {
                "name": "Length",
                "type": "number",
                "min": 1,
                "max": 600, // Example max length in seconds
                "unit": "seconds",
                "value": 1
            }
        ]
    },
    {
        "id": "video",
        "name": "Video",
        "attributes": [
            {
                "name": "Duration",
                "type": "number",
                "min": 1,
                "max": 3600, // Duration in seconds
                "unit": "seconds",
                "value": 1
            },
            {
                "name": "Resolution",
                "type": "select",
                "options": ["1080p", "4K"],
                "value": "1080p"
            }
        ]
    },
    {
        "id": "memes",
        "name": "Memes",
        "attributes": [
            {
                "name": "Meme Format",
                "type": "select",
                "options": ["Image", "Video"],
                "value": "Image"
            },
            {
                "name": "Virality Score",
                "type": "number",
                "min": 1,
                "max": 10,
                "value": 1
            }
        ]
    }
]

export const getNFTCategories = () => {
    return NFT_CATEGORIES.map(category => category.id)
}

export const getNFTByCategoryId = (id = 'all') => {
    const commonCategory = NFT_CATEGORIES.find(category => category.id === 'all');
    const targetCategory = NFT_CATEGORIES.find(category => category.id === id);

    if (!commonCategory) {
        console.error('Common category attributes are missing!');
        return null; // or throw new Error('Common category attributes are missing!');
    }

    if (!targetCategory) {
        console.error('Category not found for the given ID:', id);
        return null; // or handle as fits your application context
    }

    if (id === 'all') return commonCategory;

    // If common and target categories are found, combine their attributes.
    // Ensure not to mutate original category's attributes.
    const combinedAttributes = [
        ...commonCategory.attributes,
        ...(targetCategory.attributes || [])
    ];

    // Return a new object with combined attributes to prevent mutation of the original data
    return {
        ...targetCategory,
        attributes: combinedAttributes
    };
}
