// Основной игровой движок
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.currentWeapon = null;
        this.score = 0;
        this.mods = [];
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.running = false;
        this.enemySpawnTimer = 0;
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 1200;
            this.canvas.height = 700;
            this.setupPlayer();
            this.setupControls();
            this.loadMods();
            this.running = true;
        }
    }

    setupPlayer() {
        this.player = {
            x: 100,
            y: 350,
            width: 40,
            height: 40,
            speed: 5,
            health: 100,
            maxHealth: 100,
            armor: 0,
            angle: 0
        };
        this.currentWeapon = { damage: 20, fireRate: 200, lastFire: 0 };
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', () => {
            this.shoot();
        });
    }

    loadMods() {
        const savedMods = localStorage.getItem('gameMods');
        if (savedMods) {
            this.mods = JSON.parse(savedMods);
            this.applyMods();
        }
    }

    applyMods() {
        this.mods.forEach(mod => {
            if (mod.active && mod.code) {
                try {
                    eval(mod.code);
                } catch (e) {
                    console.error('Ошибка загрузки мода:', e);
                }
            }
        });
    }

    shoot() {
        const now = Date.now();
        if (now - this.currentWeapon.lastFire < this.currentWeapon.fireRate) return;
        
        this.currentWeapon.lastFire = now;
        
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        
        const dx = this.mouseX - centerX;
        const dy = this.mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.bullets.push({
            x: centerX,
            y: centerY,
            width: 8,
            height: 8,
            speedX: (dx / distance) * 10,
            speedY: (dy / distance) * 10,
            damage: this.currentWeapon.damage
        });
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: x = Math.random() * this.canvas.width; y = -30; break;
            case 1: x = this.canvas.width + 30; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 30; break;
            case 3: x = -30; y = Math.random() * this.canvas.height; break;
        }
        
        this.enemies.push({
            x: x,
            y: y,
            width: 35,
            height: 35,
            speed: 2,
            health: 50,
            maxHealth: 50
        });
    }

    checkCollisions() {
        // Проверка попаданий пуль по врагам
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    enemy.health -= bullet.damage;
                    this.bullets.splice(i, 1);
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 10;
                    }
                    break;
                }
            }
        }
        
        // Проверка столкновений врагов с игроком
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                this.player.health -= 5;
                this.enemies.splice(i, 1);
                
                if (this.player.health <= 0) {
                    alert('Игра окончена! Счёт: ' + this.score);
                    this.reset();
                }
            }
        }
    }

    reset() {
        this.player.health = this.player.maxHealth;
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
    }

    render() {
        if (!this.ctx) return;
        
        // Фон
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сетка
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // Игрок
        this.ctx.fillStyle = '#00ff00';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
        
        // Враги
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Полоска здоровья
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
        });
        this.ctx.shadowBlur = 0;
        
        // Пули
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ffff00';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;
        
        // HUD
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Здоровье: ' + this.player.health, 10, 30);
        this.ctx.fillText('Счёт: ' + this.score, 10, 60);
        this.ctx.fillText('Враги: ' + this.enemies.length, 10, 90);
        
        // Прицел
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouseX - 25, this.mouseY);
        this.ctx.lineTo(this.mouseX + 25, this.mouseY);
        this.ctx.moveTo(this.mouseX, this.mouseY - 25);
        this.ctx.lineTo(this.mouseX, this.mouseY + 25);
        this.ctx.stroke();
    }

    update() {
        if (!this.running) return;
        
        // Движение игрока
        if (this.keys['w'] || this.keys['ц']) this.player.y -= this.player.speed;
        if (this.keys['s'] || this.keys['ы']) this.player.y += this.player.speed;
        if (this.keys['a'] || this.keys['ф']) this.player.x -= this.player.speed;
        if (this.keys['d'] || this.keys['в']) this.player.x += this.player.speed;
        
        // Ограничение движения
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        
        // Обновление пуль
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].x += this.bullets[i].speedX;
            this.bullets[i].y += this.bullets[i].speedY;
            
            if (this.bullets[i].x > this.canvas.width || this.bullets[i].x < 0 || 
                this.bullets[i].y > this.canvas.height || this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Движение врагов к игроку
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        });
        
        // Спавн врагов
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > 60) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        this.checkCollisions();
    }

    gameLoop() {
        this.update();
        this.render();
        if (this.running) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

const game = new GameEngine();
