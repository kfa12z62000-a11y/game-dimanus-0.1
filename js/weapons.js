// Система оружия - 100 уникальных видов
const weapons = [
    { id: 1, name: 'Пистолет M1911', damage: 15, fireRate: 500, ammo: 7, type: 'pistol' },
    { id: 2, name: 'Дробовик SPAS-12', damage: 50, fireRate: 1000, ammo: 8, type: 'shotgun' },
    { id: 3, name: 'Автомат AK-47', damage: 30, fireRate: 100, ammo: 30, type: 'rifle' },
    { id: 4, name: 'Снайперская винтовка AWP', damage: 100, fireRate: 1500, ammo: 5, type: 'sniper' },
    { id: 5, name: 'Пулемёт M249', damage: 25, fireRate: 80, ammo: 100, type: 'lmg' }
];

// Генерация остальных 95 оружий
for (let i = 6; i <= 100; i++) {
    const types = ['pistol', 'shotgun', 'rifle', 'sniper', 'lmg', 'smg', 'launcher', 'energy'];
    const type = types[Math.floor(Math.random() * types.length)];
    weapons.push({
        id: i,
        name: `Оружие-${i} ${type.toUpperCase()}`,
        damage: Math.floor(Math.random() * 100) + 10,
        fireRate: Math.floor(Math.random() * 1000) + 50,
        ammo: Math.floor(Math.random() * 50) + 5,
        type: type
    });
}

function getWeaponById(id) {
    return weapons.find(w => w.id === id);
}

function getAllWeapons() {
    return weapons;
}
