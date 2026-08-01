const fs = require('fs');
const path = require('path');

const journalDir = path.join(__dirname, 'journal');
const outputFile = path.join(__dirname, 'journal.js');

let posts = [];

if (!fs.existsSync(journalDir)) {
    fs.mkdirSync(journalDir);
}

// Рекурсивна функція, яка шукає .md файли скрізь (і в папках, і в підпапках)
function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
            // Якщо це папка — заходимо всередину
            scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            // Якщо це .md файл — обробляємо його
            const content = fs.readFileSync(fullPath, 'utf-8');
            const stat = fs.statSync(fullPath);

            // 1. Шукаємо заголовок H1
            const titleMatch = content.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1].trim() : entry.name.replace('.md', '');

            // 2. Визначаємо дату (з назви файлу/папки або за датою створення)
            const dateMatch = entry.name.match(/^(\d{4}-\d{2}-\d{2})/) || currentDir.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : stat.birthtime.toISOString().split('T')[0];

            // 3. Формуємо правильний шлях для сайту (відносно кореню)
            const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');

            posts.push({
                date: date,
                title: title,
                file: relativePath
            });
        }
    }
}

// Запускаємо сканування головної папки journal
scanDirectory(journalDir);

// Сортуємо від найновіших до найстаріших
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Записуємо результат
const jsContent = `const journalPosts = ${JSON.stringify(posts, null, 4)};`;
fs.writeFileSync(outputFile, jsContent, 'utf-8');

console.log('✧ Архів журналу успішно оновлено!');