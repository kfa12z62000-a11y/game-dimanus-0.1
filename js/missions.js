// Система заданий - 100 уникальных миссий
const missions = [
    { id: 1, name: 'Первая кровь', description: 'Уничтожить 10 врагов', reward: 100, completed: false },
    { id: 2, name: 'Снайпер', description: 'Убить 5 врагов из снайперской винтовки', reward: 200, completed: false },
    { id: 3, name: 'Штурм базы', description: 'Захватить вражескую базу', reward: 500, completed: false },
    { id: 4, name: 'Спасение заложников', description: 'Спасти 3 заложников', reward: 300, completed: false },
    { id: 5, name: 'Диверсия', description: 'Взорвать склад боеприпасов', reward: 400, completed: false }
];

// Генерация остальных 95 заданий
for (let i = 6; i <= 100; i++) {
    const types = ['elimination', 'rescue', 'defense', 'stealth', 'boss'];
    const type = types[Math.floor(Math.random() * types.length)];
    missions.push({
        id: i,
        name: `Задание ${i}: ${type}`,
        description: `Выполнить задачу типа ${type}`,
        reward: Math.floor(Math.random() * 1000) + 100,
        completed: false,
        type: type
    });
}

function getMissionById(id) {
    return missions.find(m => m.id === id);
}

function getAllMissions() {
    return missions;
}

function completeMission(id) {
    const mission = getMissionById(id);
    if (mission) {
        mission.completed = true;
        return mission.reward;
    }
    return 0;
}
