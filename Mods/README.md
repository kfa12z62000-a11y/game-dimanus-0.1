# Папка модов

Здесь вы можете создавать моды для игры на JavaScript.

## Как создать мод:

1. Откройте `mods.html` в браузере
2. Введите название мода
3. Напишите JavaScript код
4. Нажмите "Сохранить мод"

## Примеры модов:

### Увеличение скорости игрока
```javascript
game.player.speed = 15;
```

### Добавление нового оружия
```javascript
weapons.push({
    id: 101,
    name: 'Лазерная пушка',
    damage: 500,
    fireRate: 100,
    ammo: 999,
    type: 'energy'
});
```

### Бессмертие
```javascript
game.player.health = 999999;
setInterval(() => {
    game.player.health = 999999;
}, 100);
```

## API для модов:

- `game.player` - объект игрока
- `weapons` - массив оружия
- `missions` - массив заданий
- `game.enemies` - массив врагов
- `game.score` - счёт игрока
