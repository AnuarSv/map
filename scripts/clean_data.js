const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../frontend/public/data');

const targetRivers = ['Иртыш', 'Или', 'Талас', 'Текес', 'Уй', 'Черный Иртыш', 'Чёрный Иртыш', 'Шу', 'Эмель', 'Урал', 'Ишим', 'Тобол', 'Сырдарья'];
const targetLakes = [
    'Каспийское море', 'Балхаш', 'Аральское море', 'Алаколь', 'Аралсор', 'Жалаулы', 'Зайсан',
    'Индер', 'Камыстыбас', 'Карасор', 'Кошкарколь', 'Кусмурын', 'Кызылкак', 'Маркаколь',
    'Сарыкопа', 'Сасыкколь', 'Селетытениз', 'Султанкельды', 'Теке', 'Тенгиз', 'Улькен-Караой',
    'Шаглытениз', 'Шалкар'
];
const targetLandforms = [
    'Западно-Сибирская равнина', 'Прикаспийская низменность', 'Карын-Жарык', 'Кулундинская равнина',
    'Туранская низменность', 'Тургайская ложбина', 'Зауральское плато', 'Общий Сырт',
    'Подуральское плато', 'Казахский мелкосопочник', 'Устюрт', 'Тургайское плато', 'Приобское плато',
    'Сарыарка'
];

function cleanMatch(text, targets) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return targets.some(t => {
        const tl = t.toLowerCase();
        return lower.includes(tl) || tl.includes(lower.replace(/река |озеро |впадина |плато |возвышенность | равнина/gi, '').trim());
    });
}

function processWater() {
    console.log('Cleaning water objects...');
    const waterFile = path.join(DATA_DIR, 'kazakhstan-water.geojson');
    if (!fs.existsSync(waterFile)) return;
    const data = JSON.parse(fs.readFileSync(waterFile, 'utf8'));

    data.features = data.features.filter(f => {
        const nameRu = f.properties.name_ru || '';
        return cleanMatch(nameRu, targetRivers) || cleanMatch(nameRu, targetLakes);
    });

    const seen = new Set();
    data.features = data.features.filter(f => {
        const name = f.properties.name_ru;
        if (seen.has(name)) return false;
        seen.add(name);
        f.properties.id = Math.random();
        return true;
    });

    fs.writeFileSync(path.join(DATA_DIR, 'kazakhstan-water.geojson'), JSON.stringify(data));
    console.log(`Saved ${data.features.length} water objects.`);
}

function processLandforms() {
    console.log('Cleaning landforms...');
    const file = path.join(DATA_DIR, 'kazakhstan-landforms.geojson');
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    data.features = data.features.filter(f => {
        const nameRu = f.properties.name_ru || '';
        return cleanMatch(nameRu, targetLandforms);
    });

    data.features.forEach((f, i) => f.properties.id = i + 1);
    fs.writeFileSync(path.join(DATA_DIR, 'kazakhstan-landforms.geojson'), JSON.stringify(data));
    console.log(`Saved ${data.features.length} landform objects.`);
}

processWater();
processLandforms();
