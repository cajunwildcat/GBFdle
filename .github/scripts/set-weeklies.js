import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';

const PAST_CHARACTERS_PATH = 'dailies.json'; // Adjust this
const POSSIBLE_CHARACTERS_URL = 'https://raw.githubusercontent.com/cajunwildcat/GBF-Party-Parser/main/characters.json'; // Adjust this

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

(async () => {
    // Load past characters
    const pastData = JSON.parse(readFileSync(PAST_CHARACTERS_PATH, 'utf-8'));
    const pastUsed = new Set(Object.values(pastData));

    // Fetch all possible characters
    const res = await fetch(POSSIBLE_CHARACTERS_URL);
    const allCharacters = Object.values(await res.json());

    const weekCharacters = [];
    const uniqueNames = new Set();

    let pool = allCharacters.filter(c => !pastUsed.has(c.pageName));
    shuffle(pool);

    let i = 0;

    // First use up remaining unused characters
    while (weekCharacters.length < 7 && i < pool.length) {
        if (!uniqueNames.has(pool[i].pageName)) {
            weekCharacters.push(pool[i]);
            uniqueNames.add(pool[i].pageName);
        }
        i++;
    }

    // If we ran out, reset history and pick from full pool excluding current week picks
    if (weekCharacters.length < 7) {
        const remaining = 7 - weekCharacters.length;
        const remainingPool = allCharacters
            .filter(c => !uniqueNames.has(c.pageName));
        shuffle(remainingPool);

        for (let j = 0; j < remaining && j < remainingPool.length; j++) {
            weekCharacters.push(remainingPool[j]);
            uniqueNames.add(remainingPool[j].pageName);
        }

        // Clear past data only after adding remaining
        for (const key of Object.keys(pastData)) delete pastData[key];
    }

    // Assign characters to the next 7 days starting next Monday
    const today = new Date();
    const nextMonday = new Date(today.setUTCDate(today.getUTCDate() + ((8 - today.getUTCDay()) % 7)));

    for (let i = 0; i < 7; i++) {
        const date = new Date(nextMonday);
        date.setUTCDate(nextMonday.getUTCDate() + i);
        const key = date.toISOString().split('T')[0].replace(/-/g, '');
        pastData[key] = weekCharacters[i]?.pageName || 'N/A';
    }

    // Write updated data back
    writeFileSync(PAST_CHARACTERS_PATH, JSON.stringify(pastData, null, 2));
})();
