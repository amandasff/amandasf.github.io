
// Local storage utilities for managing labels

export interface Label {
  id: string;
  name: string;
  content: string; // For text-to-speech
  audioData?: string; // Base64 encoded audio
  createdAt: number;
  qrCode?: string; // Base64 encoded QR code
  isPremade?: boolean; // Flag to identify premade labels
}

// Prefix for storage keys
const STORAGE_PREFIX = 'audio-labels-';

// Premade labels
export const PREMADE_LABELS: Label[] = [
  {
    id: 'premade-1',
    name: 'Medication',
    content: 'This is your daily medication. Take as prescribed.',
    createdAt: Date.now(),
    isPremade: true
  },
  {
    id: 'premade-2',
    name: 'Food Item',
    content: 'This is a food item. Check expiration date before consuming.',
    createdAt: Date.now(),
    isPremade: true
  },
  {
    id: 'premade-3',
    name: 'Electronics',
    content: 'This is an electronic device. Handle with care.',
    createdAt: Date.now(),
    isPremade: true
  },
  {
    id: 'premade-4',
    name: 'Clothing',
    content: 'This is a clothing item. Wash according to instructions.',
    createdAt: Date.now(),
    isPremade: true
  },
];

// Initialize premade labels if not already saved
export const initPremadeLabels = (): void => {
  PREMADE_LABELS.forEach(label => {
    const existing = getLabelById(label.id);
    if (!existing) {
      saveLabel(label);
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
        labels.push(label);
      }
    }
    return labels.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting labels:', error);
    return [];
  }
};

// Get premade labels
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
