import json
import os

# Список основных водных объектов (частичные совпадения)
MAJOR_WATER_BODIES = [
    "Иртыш", "Ертис",
    "Ишим", "Есиль",
    "Тобол", 
    "Урал", "Жайык", "Жайық",
    "Сырдарья", "Сырдария",
    "Или", "Іле",
    "Чу", "Шу",
    "Нура",
    "Талас",
    "Шелек", "Чилик",
    "Чарын", "Шарын",
    "Каспий", 
    "Арал", 
    "Балхаш", "Балқаш",
    "Зайсан",
    "Алаколь", "Алакөл",
    "Тенгиз", "Теңіз",
    "Капчагай", "Капшагай", "Қапшағай",
    "Бухтарма", "Бұқтырма",
    "Шардара",
    "Сасыкколь", "Сасықкөл",
    "Маркаколь", "Марқакөл"
]

INPUT_FILE = 'frontend/public/data/kazakhstan-water.geojson'
OUTPUT_FILE = 'frontend/public/data/kazakhstan-water-filtered.geojson'

def is_major(feature):
    props = feature.get('properties', {})
    name_ru = props.get('name_ru', '')
    name_kz = props.get('name_kz', '')
    
    if not name_ru and not name_kz:
        return False
        
    for w in MAJOR_WATER_BODIES:
        if name_ru and w.lower() in name_ru.lower():
            return True
        if name_kz and w.lower() in name_kz.lower():
            return True
            
    return False

try:
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    original_count = len(data['features'])
    print(f"Original count: {original_count}")
    
    filtered_features = [f for f in data['features'] if is_major(f)]
    
    data['features'] = filtered_features
    print(f"Filtered count: {len(filtered_features)}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
        
    print(f"Saved to {OUTPUT_FILE}")
    
except Exception as e:
    print(f"Error: {e}")
