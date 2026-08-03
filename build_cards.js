const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, 'img', 'cards');
const outputFile = path.join(__dirname, 'cards_data.js');

let cardsData = {};

if (!fs.existsSync(cardsDir)) {
    console.error('✧ Папку img/cards не знайдено!');
    process.exit(1);
}

// Шукаємо всі папки всередині img/cards/
const categories = fs.readdirSync(cardsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Проходимось по кожній папці і записуємо файли
categories.forEach(category => {
    const catDir = path.join(cardsDir, category);
    const files = fs.readdirSync(catDir).filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i));
    
    if (files.length > 0) {
        cardsData[category] = files.map(file => `img/cards/${category}/${file}`);
    }
});

// Записуємо результат у JS файл у вигляді об'єкта
const jsContent = `const cardsData = ${JSON.stringify(cardsData, null, 4)};`;
fs.writeFileSync(outputFile, jsContent, 'utf-8');

console.log(`✧ Базу карток оновлено! Знайдено категорій: ${Object.keys(cardsData).length}`);