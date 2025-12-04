import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type River = {
    id: string;
    name: string;
    coords: [number, number];
    lengthKm: number;
    basinAreaKm2: number;
    avgDischargeM3s?: number;
    waterType?: string;
    description: string;
};


type LatLngExpression = [number, number];
type LatLngBoundsExpression = [[number, number], [number, number]];


const RIVERS: River[] = [
    {
        id: "yrtys",
        name: "Ертыс (Иртыш)",
        coords: [51.75, 75.32],
        lengthKm: 4248,
        basinAreaKm2: 1643000,
        avgDischargeM3s: 2150,
        waterType: "пресная, холодная",
        description:
            "Крупнейшая река Казахстана, один из важнейших водных путей Евразии. Берёт начало в Китае, протекает через Восточный Казахстан и Россию.",
    },
    {
        id: "esil",
        name: "Есіл (Ишим)",
        coords: [51.16, 71.45], // район Астаны
        lengthKm: 2450,
        basinAreaKm2: 177000,
        avgDischargeM3s: 56,
        waterType: "пресная",
        description:
            "Река в пределах Казахстана и России. В её пойме расположена столица Казахстана — Астана.",
    },
    {
        id: "syrdarya",
        name: "Сырдарья",
        coords: [44.85, 65.50], // район Кызылорды
        lengthKm: 2212,
        basinAreaKm2: 782669,
        avgDischargeM3s: 703,
        waterType: "пресная, местами слабосолёная",
        description:
            "Одна из крупнейших рек Средней Азии, впадает в Аральское море. Важна для орошения и водоснабжения южных регионов.",
    },
    {
        id: "ural",
        name: "Жайық (Урал)",
        coords: [51.23, 51.37], // район Уральска
        lengthKm: 2428,
        basinAreaKm2: 237000,
        avgDischargeM3s: 400,
        waterType: "пресная",
        description:
            "Река, протекающая по территории Казахстана и России, впадает в Каспийское море. Важный рыболовный и транспортный ресурс.",
    },
    {
        id: "iliy",
        name: "Іле (Или)",
        coords: [45.00, 79.40], // район впадения в Балхаш
        lengthKm: 1439,
        basinAreaKm2: 140000,
        avgDischargeM3s: 480,
        waterType: "пресная",
        description:
            "Крупная река на юго-востоке Казахстана, впадает в озеро Балхаш. Формируется в горах Тянь-Шаня.",
    },
];

const kazakhstanBounds: LatLngBoundsExpression = [
    [40.0, 46.0], // юго-запад
    [56.5, 87.0], // северо-восток
];

const kazakhstanCenter: LatLngExpression = [48.0, 67.0];

// Кастомная иконка, чтобы маркеры выглядели аккуратно в тёмной теме
const riverIcon = new L.DivIcon({
    className:
        "bg-cyan-400/90 border border-cyan-200 shadow-md rounded-full w-4 h-4 flex items-center justify-center",
    html: '<span class="block w-2 h-2 rounded-full bg-cyan-900"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const AnyMapContainer = MapContainer as unknown as React.ComponentType<any>;
const AnyTileLayer = TileLayer as unknown as React.ComponentType<any>;
const AnyMarker = Marker as unknown as React.ComponentType<any>;

function Dashboard() {
    const [selectedRiver, setSelectedRiver] = useState<River | null>(null);

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-50 flex">
            {/* Левая часть — карта */}
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-slate-900 to-emerald-500/10 pointer-events-none" />

                <div className="relative h-full w-full p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                ГидроМапа Казахстана
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Нажми на реку на карте, чтобы увидеть характеристики воды.
                            </p>
                        </div>
                    </div>

                    <div className="h-[calc(100vh-10rem)] rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
                        <AnyMapContainer
                            center={kazakhstanCenter}
                            zoom={5}
                            minZoom={4}
                            maxZoom={9}
                            maxBounds={kazakhstanBounds}
                            className="h-full w-full"
                            zoomControl={false}
                            scrollWheelZoom
                        >
                            <AnyTileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a> &amp; OpenStreetMap'
                                url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />

                            {RIVERS.map((river) => (
                                <AnyMarker
                                    key={river.id}
                                    position={river.coords}
                                    icon={riverIcon}
                                    eventHandlers={{
                                        click: () => setSelectedRiver(river),
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <div className="font-semibold">{river.name}</div>
                                            <div className="text-xs text-slate-600">
                                                Нажми по маркеру, чтобы открыть подробную панель
                                                справа.
                                            </div>
                                        </div>
                                    </Popup>
                                </AnyMarker>
                            ))}
                        </AnyMapContainer>
                    </div>
                </div>
            </div>

            {/* Правая панель — характеристики воды */}
            <div className="w-[360px] border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl hidden lg:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                        ПАНЕЛЬ РЕКИ
                    </div>
                    <div className="text-lg font-semibold">
                        {selectedRiver ? selectedRiver.name : "Выберите реку на карте"}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Данные основаны на открытых источниках (Wikidata), значения округлены для
                        визуализации.
                    </p>
                </div>

                {selectedRiver ? (
                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div>
                            <div className="text-xs font-medium text-slate-400 uppercase mb-1">
                                ОПИСАНИЕ
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">
                                {selectedRiver.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3">
                                <div className="text-xs text-slate-400 uppercase mb-1">
                                    ДЛИНА РЕКИ
                                </div>
                                <div className="text-xl font-semibold">
                                    {selectedRiver.lengthKm.toLocaleString("ru-RU")}{" "}
                                    <span className="text-xs text-slate-400">км</span>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3">
                                <div className="text-xs text-slate-400 uppercase mb-1">
                                    ПЛОЩАДЬ БАССЕЙНА
                                </div>
                                <div className="text-xl font-semibold">
                                    {selectedRiver.basinAreaKm2.toLocaleString("ru-RU")}{" "}
                                    <span className="text-xs text-slate-400">км²</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-linear-to-br from-cyan-500/20 via-slate-900 to-emerald-500/10 border border-cyan-500/40 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-300 uppercase">
                                    СРЕДНИЙ РАСХОД
                                </div>
                                <div className="text-xs text-slate-400">
                                    м³/с (приблизительное значение)
                                </div>
                            </div>
                            <div className="text-2xl font-semibold">
                                {selectedRiver.avgDischargeM3s
                                    ? selectedRiver.avgDischargeM3s.toLocaleString("ru-RU")
                                    : "—"}
                            </div>
                            {selectedRiver.waterType && (
                                <div className="text-xs text-slate-300">
                                    Тип воды:{" "}
                                    <span className="font-medium">{selectedRiver.waterType}</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
                            <div className="text-xs text-slate-400 uppercase">
                                ЭКОЛОГИЧЕСКАЯ ЗАМЕТКА
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Эти показатели помогают оценивать состояние водных ресурсов,
                                планировать орошение, гидроэнергетику и защиту экосистем. Для точных
                                научных выводов необходимо использовать актуальные полевые данные.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center px-6 text-center text-slate-500 text-sm">
                        Кликните по маркеру на карте, чтобы увидеть детальную карточку реки:
                        длина, площадь бассейна, примерный расход и краткое описание.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;