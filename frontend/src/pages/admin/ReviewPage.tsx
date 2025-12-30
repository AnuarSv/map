import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { WaterObject } from '../../types/waterObject';

const kazakhstanCenter: [number, number] = [48.0, 67.0];

// Type fix for react-leaflet v5
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;

interface PendingItem extends WaterObject {
    submitted_by_name: string;
    submitted_by_email: string;
}

interface AdminStats {
    published_count: number;
    pending_count: number;
    draft_count: number;
    expert_count: number;
    admin_count: number;
    total_users: number;
}

export default function ReviewPage() {
    const [pending, setPending] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
    const [publishedVersion, setPublishedVersion] = useState<WaterObject | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pending', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPending(data.pending || []);
            }
        } catch (e) {
            console.error('Fetch pending error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (e) {
            console.error('Fetch stats error:', e);
        }
    };

    const fetchDiff = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/pending/${id}/diff`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setPublishedVersion(data.published);
            }
        } catch (e) {
            console.error('Fetch diff error:', e);
        }
    };

    useEffect(() => {
        fetchPending();
        fetchStats();
    }, []);

    const handleSelectItem = (item: PendingItem) => {
        setSelectedItem(item);
        setPublishedVersion(null);
        fetchDiff(item.id);
    };

    const handleApprove = async () => {
        if (!selectedItem) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/approve/${selectedItem.id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                setSelectedItem(null);
                fetchPending();
                fetchStats();
            }
        } catch (e) {
            console.error('Approve error:', e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedItem || !rejectReason.trim()) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/reject/${selectedItem.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                setSelectedItem(null);
                setShowRejectModal(false);
                setRejectReason('');
                fetchPending();
                fetchStats();
            }
        } catch (e) {
            console.error('Reject error:', e);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-50 flex">
            {/* Sidebar - Stats & Pending List */}
            <div className="w-96 border-r border-slate-800 bg-slate-900/95 flex flex-col">
                {/* Stats */}
                {stats && (
                    <div className="p-4 border-b border-slate-800">
                        <h2 className="text-lg font-semibold mb-3">Статистика</h2>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                                <div className="text-2xl font-bold text-emerald-400">{stats.published_count}</div>
                                <div className="text-xs text-slate-400">Опубликовано</div>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                                <div className="text-2xl font-bold text-amber-400">{stats.pending_count}</div>
                                <div className="text-xs text-slate-400">На проверке</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-500/20 border border-slate-500/30">
                                <div className="text-2xl font-bold text-slate-400">{stats.draft_count}</div>
                                <div className="text-xs text-slate-400">Черновики</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-lg font-semibold mb-3">Очередь на проверку</h2>
                    {loading ? (
                        <div className="text-slate-500 text-center py-4">Загрузка...</div>
                    ) : pending.length === 0 ? (
                        <div className="text-slate-500 text-center py-8">
                            ✅ Все проверено! Нет новых заявок.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pending.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectItem(item)}
                                    className={`w-full p-3 rounded-xl border text-left transition ${selectedItem?.id === item.id
                                        ? 'border-cyan-500 bg-cyan-500/20'
                                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                                        }`}
                                >
                                    <div className="font-medium">{item.name_kz}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {item.object_type} • от {item.submitted_by_name}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1">
                                        {new Date(item.updated_at).toLocaleDateString('ru-RU')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - Comparison View */}
            <div className="flex-1 flex flex-col">
                {selectedItem ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{selectedItem.name_kz}</h2>
                                <p className="text-sm text-slate-400">
                                    {selectedItem.name_ru || ''} • {selectedItem.object_type} •
                                    v{selectedItem.version}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-medium transition"
                                >
                                    ✓ Одобрить
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl font-medium transition"
                                >
                                    ✕ Отклонить
                                </button>
                            </div>
                        </div>

                        {/* Comparison */}
                        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
                            {/* Published Version */}
                            <div className="rounded-2xl border border-slate-700 overflow-hidden">
                                <div className="p-3 bg-slate-800 border-b border-slate-700">
                                    <h3 className="font-medium text-slate-300">
                                        {publishedVersion ? 'Текущая версия' : 'Новый объект'}
                                    </h3>
                                </div>
                                <div className="h-64">
                                    <AnyMapContainer
                                        center={kazakhstanCenter}
                                        zoom={5}
                                        className="h-full w-full"
                                        zoomControl={false}
                                    >
                                        <AnyTileLayer url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        {publishedVersion && (
                                            <GeoJSON
                                                data={publishedVersion.geometry as GeoJSON.GeoJsonObject}
                                                pathOptions={{ color: '#94a3b8', weight: 3 }}
                                            />
                                        )}
                                    </AnyMapContainer>
                                </div>
                                {publishedVersion && (
                                    <div className="p-3 text-sm text-slate-400 max-h-40 overflow-y-auto">
                                        <div><strong>Название:</strong> {publishedVersion.name_kz}</div>
                                        {publishedVersion.description_ru && (
                                            <div className="mt-2">{publishedVersion.description_ru}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pending Version */}
                            <div className="rounded-2xl border border-cyan-500/50 overflow-hidden">
                                <div className="p-3 bg-cyan-500/20 border-b border-cyan-500/30">
                                    <h3 className="font-medium text-cyan-300">Новая версия</h3>
                                </div>
                                <div className="h-64">
                                    <AnyMapContainer
                                        center={kazakhstanCenter}
                                        zoom={5}
                                        className="h-full w-full"
                                        zoomControl={false}
                                    >
                                        <AnyTileLayer url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        <GeoJSON
                                            data={selectedItem.geometry as GeoJSON.GeoJsonObject}
                                            pathOptions={{ color: '#06b6d4', weight: 3 }}
                                        />
                                    </AnyMapContainer>
                                </div>
                                <div className="p-3 text-sm text-slate-300 max-h-40 overflow-y-auto">
                                    <div><strong>Название:</strong> {selectedItem.name_kz}</div>
                                    {selectedItem.name_ru && <div><strong>Русский:</strong> {selectedItem.name_ru}</div>}
                                    {selectedItem.length_km && <div><strong>Длина:</strong> {selectedItem.length_km} км</div>}
                                    {selectedItem.area_km2 && <div><strong>Площадь:</strong> {selectedItem.area_km2} км²</div>}
                                    {selectedItem.description_ru && (
                                        <div className="mt-2 text-slate-400">{selectedItem.description_ru}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        Выберите объект из списка слева для просмотра
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Причина отклонения</h3>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Опишите, почему объект отклонен и что нужно исправить..."
                            rows={4}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl transition"
                            >
                                Отклонить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
