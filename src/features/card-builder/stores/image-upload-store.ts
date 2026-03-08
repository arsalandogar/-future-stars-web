import { create } from 'zustand';

import type { EditableFieldId } from '@/features/templates';
import type { Side } from '@fs-card-engine';

export type UploadKey = `${Side}:${string}`;

export function toUploadKey(side: Side, fieldId: EditableFieldId): UploadKey {
  return `${side}:${fieldId}` as UploadKey;
}

interface ImageUploadEntry {
  uploadKey: UploadKey;
  localPreviewUrl: string;
  status: 'uploading' | 'success' | 'error';
  cdnUrl: string | null;
  error: string | null;
}

interface ImageUploadState {
  uploads: Record<UploadKey, ImageUploadEntry>;
  addUpload: (uploadKey: UploadKey, previewUrl: string) => void;
  setUploadSuccess: (uploadKey: UploadKey, cdnUrl: string) => void;
  setUploadError: (uploadKey: UploadKey, error: string) => void;
  removeUpload: (uploadKey: UploadKey) => void;
  hasUnfinishedUploads: () => boolean;
  revokeAllUrls: () => void;
  reset: () => void;
}

export const useImageUploadStore = create<ImageUploadState>()((set, get) => ({
  uploads: {} as Record<UploadKey, ImageUploadEntry>,

  addUpload: (uploadKey, previewUrl) => {
    const prev = get().uploads[uploadKey];
    if (prev?.localPreviewUrl) {
      URL.revokeObjectURL(prev.localPreviewUrl);
    }

    set((state) => ({
      uploads: {
        ...state.uploads,
        [uploadKey]: {
          uploadKey,
          localPreviewUrl: previewUrl,
          status: 'uploading' as const,
          cdnUrl: null,
          error: null,
        },
      },
    }));
  },

  setUploadSuccess: (uploadKey, cdnUrl) => {
    const entry = get().uploads[uploadKey];
    if (!entry) return;

    if (entry.localPreviewUrl) {
      URL.revokeObjectURL(entry.localPreviewUrl);
    }

    set((state) => ({
      uploads: {
        ...state.uploads,
        [uploadKey]: {
          ...entry,
          status: 'success' as const,
          cdnUrl,
          localPreviewUrl: '',
        },
      },
    }));
  },

  setUploadError: (uploadKey, error) => {
    set((state) => {
      const entry = state.uploads[uploadKey];
      if (!entry) return state;
      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: { ...entry, status: 'error' as const, error },
        },
      };
    });
  },

  removeUpload: (uploadKey) => {
    const entry = get().uploads[uploadKey];
    if (entry?.localPreviewUrl) {
      URL.revokeObjectURL(entry.localPreviewUrl);
    }

    set((state) => {
      const next = { ...state.uploads };
      delete next[uploadKey];
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
