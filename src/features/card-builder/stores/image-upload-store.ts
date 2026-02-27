import { create } from 'zustand';

import type { EditableFieldId } from '@/features/templates';

interface ImageUploadEntry {
  fieldId: EditableFieldId;
  localPreviewUrl: string;
  status: 'uploading' | 'success' | 'error';
  cdnUrl: string | null;
  error: string | null;
}

interface ImageUploadState {
  uploads: Record<string, ImageUploadEntry>;
  addUpload: (fieldId: EditableFieldId, previewUrl: string) => void;
  setUploadSuccess: (fieldId: EditableFieldId, cdnUrl: string) => void;
  setUploadError: (fieldId: EditableFieldId, error: string) => void;
  removeUpload: (fieldId: EditableFieldId) => void;
  hasUnfinishedUploads: () => boolean;
  revokeAllUrls: () => void;
  reset: () => void;
}

export const useImageUploadStore = create<ImageUploadState>()((set, get) => ({
  uploads: {},

  addUpload: (fieldId, previewUrl) => {
    const prev = get().uploads[fieldId];
    if (prev?.localPreviewUrl) {
      URL.revokeObjectURL(prev.localPreviewUrl);
    }

    set((state) => ({
      uploads: {
        ...state.uploads,
        [fieldId]: {
          fieldId,
          localPreviewUrl: previewUrl,
          status: 'uploading' as const,
          cdnUrl: null,
          error: null,
        },
      },
    }));
  },

  setUploadSuccess: (fieldId, cdnUrl) => {
    const entry = get().uploads[fieldId];
    if (!entry) return;

    if (entry.localPreviewUrl) {
      URL.revokeObjectURL(entry.localPreviewUrl);
    }

    set((state) => ({
      uploads: {
        ...state.uploads,
        [fieldId]: {
          ...entry,
          status: 'success' as const,
          cdnUrl,
          localPreviewUrl: '',
        },
      },
    }));
  },

  setUploadError: (fieldId, error) => {
    set((state) => {
      const entry = state.uploads[fieldId];
      if (!entry) return state;
      return {
        uploads: {
          ...state.uploads,
          [fieldId]: { ...entry, status: 'error' as const, error },
        },
      };
    });
  },

  removeUpload: (fieldId) => {
    const entry = get().uploads[fieldId];
    if (entry?.localPreviewUrl) {
      URL.revokeObjectURL(entry.localPreviewUrl);
    }

    set((state) => {
      const next = { ...state.uploads };
      delete next[fieldId];
      return { uploads: next };
    });
  },

  hasUnfinishedUploads: () => {
    return Object.values(get().uploads).some((e) => e.status === 'uploading');
  },

  revokeAllUrls: () => {
    for (const entry of Object.values(get().uploads)) {
      if (entry.localPreviewUrl) {
        URL.revokeObjectURL(entry.localPreviewUrl);
      }
    }
  },

  reset: () => {
    get().revokeAllUrls();
    set({ uploads: {} });
  },
}));
