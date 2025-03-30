
// Local storage utilities for managing labels

export interface Label {
  id: string;
  name: string;
  content: string; // For text-to-speech
  audioData?: string; // Base64 encoded audio
  createdAt: number;
  qrCode?: string; // Base64 encoded QR code
  isPremade?: boolean; // Flag to identify pre-made labels
  isEditable?: boolean; // Flag to allow editing, true by default
}

// Prefix for storage keys
const STORAGE_PREFIX = 'audio-labels-';

// Pre-made labels with fixed IDs
export const PREMADE_LABELS: Label[] = [
  // Original premade labels
  {
    id: 'premade-1',
    name: 'Medicine Cabinet',
    content: 'Medicine Cabinet - Contains medications and first aid supplies',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-2',
    name: 'Kitchen Pantry',
    content: 'Kitchen Pantry - Stores dry goods and non-perishable food items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-3',
    name: 'Important Documents',
    content: 'Important Documents - Contains passport, birth certificate, and other official papers',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-4',
    name: 'Emergency Kit',
    content: 'Emergency Kit - Contains flashlight, batteries, and other emergency supplies',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-5',
    name: 'Cleaning Supplies',
    content: 'Cleaning Supplies - Contains household cleaners and supplies',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  // Additional premade labels (35 more for a total of 40)
  {
    id: 'premade-6',
    name: 'Refrigerator',
    content: 'Refrigerator - Contains perishable food items and beverages',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-7',
    name: 'Freezer',
    content: 'Freezer - Contains frozen foods and ice',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-8',
    name: 'Bathroom Cabinet',
    content: 'Bathroom Cabinet - Contains toiletries and personal care items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-9',
    name: 'Laundry Supplies',
    content: 'Laundry Supplies - Contains detergent, fabric softener, and other laundry items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-10',
    name: 'Tool Box',
    content: 'Tool Box - Contains tools for household repairs and maintenance',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-11',
    name: 'Gardening Supplies',
    content: 'Gardening Supplies - Contains gardening tools, seeds, and plant care items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-12',
    name: 'Office Supplies',
    content: 'Office Supplies - Contains pens, paper, staples, and other office items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-13',
    name: 'Gift Wrapping',
    content: 'Gift Wrapping - Contains wrapping paper, ribbons, and gift bags',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-14',
    name: 'Holiday Decorations',
    content: 'Holiday Decorations - Contains decorations for various holidays',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-15',
    name: 'Winter Clothing',
    content: 'Winter Clothing - Contains coats, hats, gloves, and other cold weather items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-16',
    name: 'Summer Clothing',
    content: 'Summer Clothing - Contains shorts, t-shirts, swimwear, and other warm weather items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-17',
    name: 'Craft Supplies',
    content: 'Craft Supplies - Contains scissors, glue, paper, and other crafting materials',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-18',
    name: 'Kitchen Appliances',
    content: 'Kitchen Appliances - Contains small appliances like blender, toaster, etc.',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-19',
    name: 'Baking Supplies',
    content: 'Baking Supplies - Contains flour, sugar, baking soda, and other baking ingredients',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-20',
    name: 'Spice Rack',
    content: 'Spice Rack - Contains various spices and seasonings',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-21',
    name: 'Camping Gear',
    content: 'Camping Gear - Contains tent, sleeping bags, and other camping equipment',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-22',
    name: 'Sports Equipment',
    content: 'Sports Equipment - Contains balls, bats, and other sports gear',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-23',
    name: 'Pet Supplies',
    content: 'Pet Supplies - Contains pet food, toys, and grooming items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-24',
    name: 'Electronics',
    content: 'Electronics - Contains cables, chargers, and miscellaneous electronic items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-25',
    name: 'Board Games',
    content: 'Board Games - Contains various board games and card games',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-26',
    name: 'Books',
    content: 'Books - Contains books and reading materials',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-27',
    name: 'DVDs and Media',
    content: 'DVDs and Media - Contains movies, music, and other media',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-28',
    name: 'Sewing Kit',
    content: 'Sewing Kit - Contains needles, thread, and other sewing supplies',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-29',
    name: 'Bathroom Towels',
    content: 'Bathroom Towels - Contains bath towels, hand towels, and washcloths',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-30',
    name: 'Bed Linens',
    content: 'Bed Linens - Contains sheets, pillowcases, and other bedding',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-31',
    name: 'Shoe Rack',
    content: 'Shoe Rack - Contains shoes and shoe care items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-32',
    name: 'Jewelry Box',
    content: 'Jewelry Box - Contains jewelry and accessories',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-33',
    name: 'First Aid Kit',
    content: 'First Aid Kit - Contains bandages, antiseptic, and other first aid supplies',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-34',
    name: 'Battery Drawer',
    content: 'Battery Drawer - Contains various sizes of batteries',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-35',
    name: 'File Cabinet',
    content: 'File Cabinet - Contains important files and documents',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-36',
    name: 'Recycling Bin',
    content: 'Recycling Bin - For recyclable materials',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-37',
    name: 'Trash Can',
    content: 'Trash Can - For general waste',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-38',
    name: 'Compost Bin',
    content: 'Compost Bin - For food scraps and compostable materials',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-39',
    name: 'Car Maintenance',
    content: 'Car Maintenance - Contains car care products and tools',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  },
  {
    id: 'premade-40',
    name: 'Computer Accessories',
    content: 'Computer Accessories - Contains mouse, keyboard, cables, and other computer items',
    createdAt: Date.now(),
    isPremade: true,
    isEditable: true
  }
];

// Initialize pre-made labels if they don't exist
export const initializePremadeLabels = (): void => {
  PREMADE_LABELS.forEach(label => {
    const existingLabel = getLabelById(label.id);
    if (!existingLabel) {
      saveLabel(label);
    } else if (existingLabel && !existingLabel.isEditable) {
      // Update existing premade labels to be editable if they weren't before
      existingLabel.isEditable = true;
      saveLabel(existingLabel);
    }
  });
};

// Get all labels
export const getAllLabels = (): Label[] => {
  try {
    const labels: Label[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const label = JSON.parse(localStorage.getItem(key) || '');
        
        // Ensure all labels have isEditable property set
        if (label.isEditable === undefined) {
          label.isEditable = true;
          saveLabel(label);
        }
        
        labels.push(label);
      }
    }
    return labels.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting labels:', error);
    return [];
  }
};

// Get pre-made labels only
export const getPremadeLabels = (): Label[] => {
  return getAllLabels().filter(label => label.isPremade);
};

// Get a label by ID
export const getLabelById = (id: string): Label | null => {
  try {
    const labelJson = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    return labelJson ? JSON.parse(labelJson) : null;
  } catch (error) {
    console.error(`Error getting label ${id}:`, error);
    return null;
  }
};

// Save a label
export const saveLabel = (label: Label): void => {
  try {
    // Ensure all labels have isEditable property set
    if (label.isEditable === undefined) {
      label.isEditable = true;
    }
    
    localStorage.setItem(`${STORAGE_PREFIX}${label.id}`, JSON.stringify(label));
  } catch (error) {
    console.error('Error saving label:', error);
    throw new Error('Failed to save label');
  }
};

// Delete a label
export const deleteLabel = (id: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
  } catch (error) {
    console.error(`Error deleting label ${id}:`, error);
    throw new Error('Failed to delete label');
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
