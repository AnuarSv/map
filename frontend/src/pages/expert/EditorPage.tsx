import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DrawingTools from '../../components/map/DrawingTools';
import WaterObjectForm from '../../components/expert/WaterObjectForm';
import { useMapStore } from '../../store/mapStore';
import type { ObjectType, WaterObject } from '../../types/waterObject';
import type { Geometry } from 'geojson';

const OBJECT_TYPES: { value: ObjectType; label: string; icon: string }[] = [
    { value: 'river', label: 'Өзен / Река', icon: '🌊' },
    { value: 'lake', label: 'Көл / Озеро', icon: '💧' },
    { value: 'reservoir', label: 'Су қоймасы / Вдхр.', icon: '🏞️' },
    { value: 'canal', label: 'Канал', icon: '🚿' },
    { value: 'glacier', label: 'Мұздық / Ледник', icon: '🏔️' },
    { value: 'spring', label: 'Бұлақ / Родник', icon: '⛲' },
];

const kazakhstanCenter: [number, number] = [48.0, 67.0];

// Type fix for react-leaflet v5
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;

export default function EditorPage() {
    const {
        myDrafts,
        draftsLoading,
        fetchMyDrafts,
        editMode,
        currentObjectType,
        pendingGeometry,
        startCreateMode,
        setPendingGeometry,
        resetEditor,
        deleteDraft,
        submitForReview
    } = useMapStore();

    const [showForm, setShowForm] = useState(false);
    const [editingDraft, setEditingDraft] = useState<WaterObject | null>(null);

    useEffect(() => {
        fetchMyDrafts();
    }, []);

    const handleStartCreate = (type: ObjectType) => {
        startCreateMode(type);
        setEditingDraft(null);
        setShowForm(false);
        setPendingGeometry(null);
    };

    const handleGeometryCreated = (geometry: Geometry | null) => {
        setPendingGeometry(geometry);
        if (geometry) {
            setShowForm(true);
        }
    };

    const handleEditDraft = (draft: WaterObject) => {
        setEditingDraft(draft);
        startCreateMode(draft.object_type);
        setPendingGeometry(draft.geometry);
        setShowForm(true);
    };

    const handleDeleteDraft = async (id: number) => {
        if (confirm('Удалить этот черновик?')) {
            await deleteDraft(id);
        }
    };

    const handleSubmitDraft = async (id: number) => {
        if (confirm('Отправить на проверку администратору?')) {
            await submitForReview(id);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingDraft(null);
        resetEditor();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <span className="px-2 py-1 rounded-full bg-slate-600 text-slate-200 text-xs">Черновик</span>;
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-amber-600 text-amber-100 text-xs">На проверке</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full bg-red-600 text-red-100 text-xs">Отклонено</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-50 flex">
            {/* Sidebar - Object Types & Drafts */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/95 flex flex-col">
                {/* Create New Section */}
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold mb-3">Создать объект</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {OBJECT_TYPES.map(type => (
                            <button
                                key={type.value}
                                onClick={() => handleStartCreate(type.value)}
                                className={`p-3 rounded-xl border text-left transition-all ${editMode === 'create' && currentObjectType === type.value
                                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                    }`}
                            >
                                <span className="text-xl">{type.icon}</span>
                                <div className="text-xs mt-1 text-slate-300">{type.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* My Drafts Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-3">Мои черновики</h2>
                    {draftsLoading ? (
                        <div className="text-slate-500 text-center py-4">Загрузка...</div>
                    ) : myDrafts.length === 0 ? (
                        <div className="text-slate-500 text-center py-4">
                            Нет черновиков. Выберите тип объекта выше и нарисуйте на карте.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {myDrafts.map(draft => (
                                <div
                                    key={draft.id}
                                    className="p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">{draft.name_kz}</span>
                                        {getStatusBadge(draft.status)}
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        {draft.object_type} • v{draft.version}
                                    </div>
                                    {draft.rejection_reason && (
                                        <div className="text-xs text-red-400 mb-2 p-2 bg-red-500/10 rounded">
                                            {draft.rejection_reason}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        {draft.status !== 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditDraft(draft)}
                                                    className="flex-1 py-1 px-2 bg-slate-700 hover:bg-slate-600 rounded text-xs transition"
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleSubmitDraft(draft.id)}
                                                    className="flex-1 py-1 px-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs transition"
                                                >
                                                    Отправить
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteDraft(draft.id)}
                                            className="py-1 px-2 bg-red-600/30 hover:bg-red-600/50 rounded text-xs text-red-300 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map & Form Area */}
            <div className="flex-1 relative">
                {/* Instructions overlay */}
                {editMode === 'create' && !showForm && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-700">
                        <p className="text-slate-200">
                            {currentObjectType === 'river' || currentObjectType === 'canal'
                                ? '🖊️ Нарисуйте линию реки/канала на карте'
                                : currentObjectType === 'spring'
                                    ? '📍 Поставьте маркер родника на карте'
                                    : '🖊️ Нарисуйте границы объекта на карте'}
                        </p>
                    </div>
                )}

                {/* Map */}
                <div className="h-full w-full">
                    <AnyMapContainer
                        center={kazakhstanCenter}
                        zoom={5}
                        minZoom={4}
                        maxZoom={18}
                        className="h-full w-full"
                        zoomControl={true}
                        scrollWheelZoom={true}
                    >
                        <AnyTileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a> &amp; OpenStreetMap'
                            url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* Drawing tools - only active in create mode */}
                        <DrawingTools
                            objectType={currentObjectType}
                            onGeometryCreated={handleGeometryCreated}
                            existingGeometry={editingDraft?.geometry}
                            enabled={editMode === 'create'}
                        />

                        {/* Show existing drafts on map */}
                        {myDrafts.map(draft => (
                            draft.id !== editingDraft?.id && (
                                <GeoJSON
                                    key={draft.id}
                                    data={draft.geometry as GeoJSON.GeoJsonObject}
                                    pathOptions={{
                                        color: draft.status === 'rejected' ? '#ef4444' : '#94a3b8',
                                        weight: 2,
                                        opacity: 0.5
                                    }}
                                />
                            )
                        ))}
                    </AnyMapContainer>
                </div>

                {/* Form overlay */}
                {showForm && (
                    <div className="absolute top-4 right-4 z-[1000] w-96">
                        <WaterObjectForm
                            objectType={currentObjectType}
                            geometry={pendingGeometry}
                            onCancel={handleCancel}
                            editingId={editingDraft?.id}
                            initialData={editingDraft || undefined}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
