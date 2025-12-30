// Water object and user types for the application

export type UserRole = 'user' | 'expert' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export type ObjectType = 'river' | 'lake' | 'reservoir' | 'canal' | 'glacier' | 'spring';

export type ObjectStatus = 'draft' | 'pending' | 'published' | 'archived' | 'rejected';

export interface WaterObject {
    id: number;
    canonical_id: string;
    version: number;

    // Names
    name_kz: string;
    name_ru?: string;
    name_en?: string;

    // Type
    object_type: ObjectType;

    // Geometry (GeoJSON)
    geometry: GeoJSON.Geometry;

    // Measurements
    length_km?: number;
    area_km2?: number;
    max_depth_m?: number;
    avg_depth_m?: number;
    water_volume_km3?: number;
    basin_area_km2?: number;
    avg_discharge_m3s?: number;

    // Water quality
    salinity_level?: string;
    pollution_index?: number;
    ecological_status?: string;

    // Content
    description_kz?: string;
    description_ru?: string;
    description_en?: string;
    historical_notes?: string;
    sources?: Array<{ title: string; url?: string }>;

    // Status & workflow
    status: ObjectStatus;
    rejection_reason?: string;

    // Audit
    created_by: number;
    updated_by?: number;
    reviewed_by?: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
}

export interface WaterObjectFeature extends GeoJSON.Feature {
    properties: Omit<WaterObject, 'geometry'>;
}

export interface WaterObjectCollection extends GeoJSON.FeatureCollection {
    features: WaterObjectFeature[];
    metadata?: {
        total: number;
        fetched_at: string;
    };
}

export interface CreateWaterObjectRequest {
    name_kz: string;
    name_ru?: string;
    name_en?: string;
    object_type: ObjectType;
    geometry: GeoJSON.Geometry;
    length_km?: number;
    area_km2?: number;
    max_depth_m?: number;
    avg_depth_m?: number;
    water_volume_km3?: number;
    basin_area_km2?: number;
    avg_discharge_m3s?: number;
    salinity_level?: string;
    pollution_index?: number;
    ecological_status?: string;
    description_kz?: string;
    description_ru?: string;
    description_en?: string;
    historical_notes?: string;
    sources?: Array<{ title: string; url?: string }>;
}
