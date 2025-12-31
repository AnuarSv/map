import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WaterObject, WaterObjectCollection, ObjectType, CreateWaterObjectRequest } from '../types/waterObject';

interface MapState {
    // Published layer (public)
    publishedObjects: WaterObjectCollection | null;
    publishedLoading: boolean;

    // Expert's drafts
    myDrafts: WaterObject[];
    draftsLoading: boolean;

    // Currently editing object
    activeObject: WaterObject | null;
    editMode: 'view' | 'create' | 'edit';
    currentObjectType: ObjectType;
    pendingGeometry: GeoJSON.Geometry | null;

    // Map view
    selectedObjectId: string | null;

    // Actions
    fetchPublishedObjects: () => Promise<void>;
    fetchMyDrafts: () => Promise<void>;
    setActiveObject: (obj: WaterObject | null, mode?: 'view' | 'edit') => void;
    startCreateMode: (objectType: ObjectType) => void;
    setPendingGeometry: (geometry: GeoJSON.Geometry | null) => void;
    setSelectedObjectId: (id: string | null) => void;
    saveDraft: (formData: CreateWaterObjectRequest) => Promise<WaterObject>;
    updateDraft: (id: number, formData: Partial<CreateWaterObjectRequest>) => Promise<WaterObject>;
    submitForReview: (id: number) => Promise<void>;
    deleteDraft: (id: number) => Promise<void>;
    resetEditor: () => void;
    addLocalDraft: (draft: WaterObject) => void;
}

export const useMapStore = create<MapState>()(
    devtools(
        (set, get) => ({
            publishedObjects: null,
            publishedLoading: false,
            myDrafts: [],
            draftsLoading: false,
            activeObject: null,
            editMode: 'view',
            currentObjectType: 'river',
            pendingGeometry: null,
            selectedObjectId: null,

            addLocalDraft: (draft) => {
                set((state) => ({
                    myDrafts: [...state.myDrafts, draft]
                }));
            },

            fetchPublishedObjects: async () => {
                set({ publishedLoading: true });
                try {
                    const res = await fetch('/api/water-objects');
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    set({ publishedObjects: data, publishedLoading: false });
                } catch (error) {
                    console.error('Fetch published objects error:', error);
                    set({ publishedLoading: false });
                }
            },

            fetchMyDrafts: async () => {
                set({ draftsLoading: true });
                try {
                    const res = await fetch('/api/water-objects/my/drafts', {
                        credentials: 'include'
                    });
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    set({ myDrafts: data.drafts || [], draftsLoading: false });
                } catch (error) {
                    console.error('Fetch drafts error:', error);
                    set({ draftsLoading: false });
                }
            },

            setActiveObject: (obj, mode = 'view') => {
                set({
                    activeObject: obj,
                    editMode: mode,
                    pendingGeometry: obj?.geometry || null
                });
            },

            startCreateMode: (objectType) => {
                set({
                    activeObject: null,
                    editMode: 'create',
                    currentObjectType: objectType,
                    pendingGeometry: null
                });
            },

            setPendingGeometry: (geometry) => {
                set({ pendingGeometry: geometry });
            },

            setSelectedObjectId: (id) => {
                set({ selectedObjectId: id });
            },

            saveDraft: async (formData) => {
                const res = await fetch('/api/water-objects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to save');
                }

                const data = await res.json();
                // Refresh drafts
                get().fetchMyDrafts();
                return data.data;
            },

            updateDraft: async (id, formData) => {
                const res = await fetch(`/api/water-objects/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to update');
                }

                const data = await res.json();
                get().fetchMyDrafts();
                return data.data;
            },

            submitForReview: async (id) => {
                const res = await fetch(`/api/water-objects/${id}/submit`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to submit');
                }

                get().fetchMyDrafts();
            },

            deleteDraft: async (id) => {
                const res = await fetch(`/api/water-objects/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Failed to delete');
                }

                get().fetchMyDrafts();
            },

            resetEditor: () => {
                set({
                    activeObject: null,
                    editMode: 'view',
                    pendingGeometry: null
                });
            }
        }),
        { name: 'map-store' }
    )
);
