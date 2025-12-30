import { useState } from 'react';
import type { ObjectType, CreateWaterObjectRequest } from '../../types/waterObject';
import { useMapStore } from '../../store/mapStore';
import type { Geometry } from 'geojson';

interface WaterObjectFormProps {
    objectType: ObjectType;
    geometry: Geometry | null;
    onCancel: () => void;
    editingId?: number | null;
    initialData?: Partial<CreateWaterObjectRequest>;
}

const OBJECT_TYPE_LABELS: Record<ObjectType, string> = {
    river: 'Өзен / Река / River',
    lake: 'Көл / Озеро / Lake',
    reservoir: 'Су қоймасы / Водохранилище / Reservoir',
    canal: 'Канал / Canal',
    glacier: 'Мұздық / Ледник / Glacier',
    spring: 'Бұлақ / Родник / Spring'
};

export default function WaterObjectForm({
    objectType,
    geometry,
    onCancel,
    editingId,
    initialData
}: WaterObjectFormProps) {
    const { saveDraft, updateDraft, submitForReview } = useMapStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [nameKz, setNameKz] = useState(initialData?.name_kz || '');
    const [nameRu, setNameRu] = useState(initialData?.name_ru || '');
    const [nameEn, setNameEn] = useState(initialData?.name_en || '');
    const [lengthKm, setLengthKm] = useState<string>(initialData?.length_km?.toString() || '');
    const [areaKm2, setAreaKm2] = useState<string>(initialData?.area_km2?.toString() || '');
    const [maxDepthM, setMaxDepthM] = useState<string>(initialData?.max_depth_m?.toString() || '');
    const [avgDepthM, setAvgDepthM] = useState<string>(initialData?.avg_depth_m?.toString() || '');
    const [basinAreaKm2, setBasinAreaKm2] = useState<string>(initialData?.basin_area_km2?.toString() || '');
    const [avgDischargeM3s, setAvgDischargeM3s] = useState<string>(initialData?.avg_discharge_m3s?.toString() || '');
    const [salinityLevel, setSalinityLevel] = useState(initialData?.salinity_level || '');
    const [pollutionIndex, setPollutionIndex] = useState<string>(initialData?.pollution_index?.toString() || '');
    const [ecologicalStatus, setEcologicalStatus] = useState(initialData?.ecological_status || '');
    const [descriptionKz, setDescriptionKz] = useState(initialData?.description_kz || '');
    const [descriptionRu, setDescriptionRu] = useState(initialData?.description_ru || '');

    const isLinear = objectType === 'river' || objectType === 'canal';
    const isArea = objectType === 'lake' || objectType === 'reservoir' || objectType === 'glacier';

    const handleSave = async (submitAfterSave = false) => {
        if (!nameKz.trim()) {
            setError('Казахское название обязательно');
            return;
        }

        if (!geometry) {
            setError('Пожалуйста, нарисуйте геометрию на карте');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData: CreateWaterObjectRequest = {
                name_kz: nameKz.trim(),
                name_ru: nameRu.trim() || undefined,
                name_en: nameEn.trim() || undefined,
                object_type: objectType,
                geometry,
                length_km: lengthKm ? parseFloat(lengthKm) : undefined,
                area_km2: areaKm2 ? parseFloat(areaKm2) : undefined,
                max_depth_m: maxDepthM ? parseFloat(maxDepthM) : undefined,
                avg_depth_m: avgDepthM ? parseFloat(avgDepthM) : undefined,
                basin_area_km2: basinAreaKm2 ? parseFloat(basinAreaKm2) : undefined,
                avg_discharge_m3s: avgDischargeM3s ? parseFloat(avgDischargeM3s) : undefined,
                salinity_level: salinityLevel || undefined,
                pollution_index: pollutionIndex ? parseFloat(pollutionIndex) : undefined,
                ecological_status: ecologicalStatus || undefined,
                description_kz: descriptionKz.trim() || undefined,
                description_ru: descriptionRu.trim() || undefined,
            };

            let result;
            if (editingId) {
                result = await updateDraft(editingId, formData);
            } else {
                result = await saveDraft(formData);
            }

            if (submitAfterSave && result.id) {
                await submitForReview(result.id);
                setSuccess('Отправлено на проверку!');
            } else {
                setSuccess('Черновик сохранен!');
            }

            setTimeout(() => {
                onCancel();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/95 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-100">
                    {editingId ? 'Редактировать' : 'Создать'} {OBJECT_TYPE_LABELS[objectType]}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-white p-1"
                >
                    ✕
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-lg mb-4">
                    {success}
                </div>
            )}

            {!geometry && (
                <div className="bg-amber-500/20 border border-amber-500 text-amber-300 px-4 py-2 rounded-lg mb-4">
                    ⚠️ Нарисуйте {isLinear ? 'линию' : isArea ? 'полигон' : 'точку'} на карте
                </div>
            )}

            <div className="space-y-4">
                {/* Names Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Названия</h3>
                    <input
                        type="text"
                        placeholder="Атауы (қазақша) *"
                        value={nameKz}
                        onChange={e => setNameKz(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Название (русский)"
                        value={nameRu}
                        onChange={e => setNameRu(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Name (English)"
                        value={nameEn}
                        onChange={e => setNameEn(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                </div>

                {/* Measurements Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Измерения</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {isLinear && (
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Длина (км)"
                                value={lengthKm}
                                onChange={e => setLengthKm(e.target.value)}
                                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                            />
                        )}
                        {isArea && (
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Площадь (км²)"
                                value={areaKm2}
                                onChange={e => setAreaKm2(e.target.value)}
                                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                            />
                        )}
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Макс. глубина (м)"
                            value={maxDepthM}
                            onChange={e => setMaxDepthM(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Средняя глубина (м)"
                            value={avgDepthM}
                            onChange={e => setAvgDepthM(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Площадь бассейна (км²)"
                            value={basinAreaKm2}
                            onChange={e => setBasinAreaKm2(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        {isLinear && (
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Средний расход (м³/с)"
                                value={avgDischargeM3s}
                                onChange={e => setAvgDischargeM3s(e.target.value)}
                                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                            />
                        )}
                    </div>
                </div>

                {/* Water Quality Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Качество воды</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={salinityLevel}
                            onChange={e => setSalinityLevel(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="">Минерализация</option>
                            <option value="freshwater">Пресная</option>
                            <option value="brackish">Солоноватая</option>
                            <option value="saline">Соленая</option>
                        </select>
                        <select
                            value={ecologicalStatus}
                            onChange={e => setEcologicalStatus(e.target.value)}
                            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="">Экологический статус</option>
                            <option value="good">Хорошее</option>
                            <option value="moderate">Умеренное</option>
                            <option value="poor">Плохое</option>
                            <option value="critical">Критическое</option>
                        </select>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="Индекс загрязнения (0-10)"
                            value={pollutionIndex}
                            onChange={e => setPollutionIndex(e.target.value)}
                            className="col-span-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Описание</h3>
                    <textarea
                        placeholder="Сипаттама (қазақша)"
                        value={descriptionKz}
                        onChange={e => setDescriptionKz(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                    />
                    <textarea
                        placeholder="Описание (русский)"
                        value={descriptionRu}
                        onChange={e => setDescriptionRu(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={() => handleSave(false)}
                    disabled={loading || !geometry}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition"
                >
                    {loading ? 'Сохранение...' : 'Сохранить черновик'}
                </button>
                <button
                    onClick={() => handleSave(true)}
                    disabled={loading || !geometry || !nameKz.trim()}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition"
                >
                    {loading ? 'Отправка...' : 'Отправить на проверку'}
                </button>
            </div>
        </div>
    );
}
