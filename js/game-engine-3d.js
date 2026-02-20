// 3D игровой движок на Three.js (вид от первого лица)
class GameEngine3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerPosition = null;
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.keys = {};
        this.running = false;
        this.enemySpawnTimer = 0;
        this.raycaster = null;
        this.mouse = null;
        this.yaw = 0;
        this.pitch = 0;
        this.isPointerLocked = false;
        this.weapon = null;
    }

    init(containerId) {
        // Инициализация Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);

        // Камера от первого лица
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 0); // Высота глаз игрока
        
        this.playerPosition = new THREE.Vector3(0, 1.6, 0);

        // Рендерер
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById(containerId);
        container.appendChild(this.renderer.domElement);

        // Освещение
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Фонарик на камере
        const flashlight = new THREE.SpotLight(0x00ff00, 1, 50, Math.PI / 6, 0.5);
        flashlight.position.set(0, 0, 0);
        this.camera.add(flashlight);
        flashlight.target.position.set(0, 0, -1);
        this.camera.add(flashlight.target);
        this.scene.add(this.camera);

        // Пол
        const floorGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Сетка
        const gridHelper = new THREE.GridHelper(100, 50, 0x00ff00, 0x003300);
        this.scene.add(gridHelper);

        // Создание оружия в руках
        this.createWeapon();

        // Raycaster для стрельбы
        this.raycaster = new THREE.Raycaster();

        // Управление
        this.setupControls();

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.onWindowResize());

        this.playerData = {
            speed: 0.2,
            health: 100,
            maxHealth: 100
        };

        this.running = true;
    }

    createWeapon() {
        // Создание модели оружия
        const weaponGroup = new THREE.Group();
        
        // Ствол
        const barrelGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.5);
        const barrelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.set(0.15, -0.15, -0.4);
        weaponGroup.add(barrel);
        
        // Рукоятка
        const gripGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.1);
        const grip = new THREE.Mesh(gripGeometry, barrelMaterial);
        grip.position.set(0.15, -0.25, -0.2);
        weaponGroup.add(grip);
        
        // Зелёная подсветка
        const glowGeometry = new THREE.BoxGeometry(0.03, 0.03, 0.1);
        const glowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0.15, -0.12, -0.3);
        weaponGroup.add(glow);
        
        this.camera.add(weaponGroup);
        this.weapon = weaponGroup;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Pointer Lock для управления мышью
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;
            
            const sensitivity = 0.002;
            this.yaw -= e.movementX * sensitivity;
            this.pitch -= e.movementY * sensitivity;
            
            // Ограничение вертикального угла
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        });
        
        document.addEventListener('click', () => {
            if (this.isPointerLocked && this.running) {
                this.shoot();
            }
        });
    }

    createEnemy() {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.7
        });
        const enemy = new THREE.Mesh(geometry, material);
        
        // Случайная позиция на краю карты
        const angle = Math.random() * Math.PI * 2;
        const distance = 40;
        enemy.position.set(
            Math.cos(angle) * distance,
            1,
            Math.sin(angle) * distance
        );
        enemy.castShadow = true;
        
        enemy.userData = {
            health: 50,
            maxHealth: 50,
            speed: 0.1
        };
        
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    shoot() {
        // Эффект отдачи оружия
        if (this.weapon) {
            this.weapon.position.z = -0.05;
            setTimeout(() => {
                if (this.weapon) this.weapon.position.z = 0;
            }, 100);
        }
        
        // Создание пули
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 2
        });
        const bullet = new THREE.Mesh(geometry, material);
        
        // Позиция пули - из камеры (глаз игрока)
        bullet.position.copy(this.camera.position);
        
        // Направление выстрела - точно по направлению взгляда
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        bullet.userData = {
            velocity: direction.multiplyScalar(1.5),
            damage: 25,
            lifetime: 120
        };
        
        this.scene.add(bullet);
        this.bullets.push(bullet);
    }

    updatePlayer() {
        // Обновление ориентации камеры
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        // Движение относительно направления взгляда
        const moveVector = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();

        if (this.keys['w'] || this.keys['ц']) {
            moveVector.add(forward);
        }
        if (this.keys['s'] || this.keys['ы']) {
            moveVector.sub(forward);
        }
        if (this.keys['a'] || this.keys['ф']) {
            moveVector.sub(right);
        }
        if (this.keys['d'] || this.keys['в']) {
            moveVector.add(right);
        }

        if (moveVector.length() > 0) {
            moveVector.normalize();
            this.playerPosition.x += moveVector.x * this.playerData.speed;
            this.playerPosition.z += moveVector.z * this.playerData.speed;
        }

        // Ограничение движения
        const limit = 45;
        this.playerPosition.x = Math.max(-limit, Math.min(limit, this.playerPosition.x));
        this.playerPosition.z = Math.max(-limit, Math.min(limit, this.playerPosition.z));

        // Обновление позиции камеры
        this.camera.position.copy(this.playerPosition);
    }

    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            // Движение к игроку
            const direction = new THREE.Vector3();
            direction.subVectors(this.playerPosition, enemy.position);
            direction.y = 0;
            direction.normalize();
            
            enemy.position.add(direction.multiplyScalar(enemy.userData.speed));
            
            // Враг смотрит на игрока
            enemy.lookAt(this.playerPosition);
            
            // Проверка столкновения с игроком
            const distance = enemy.position.distanceTo(this.playerPosition);
            if (distance < 2) {
                this.playerData.health -= 5;
                this.scene.remove(enemy);
                this.enemies.splice(index, 1);
                
                if (this.playerData.health <= 0) {
                    alert('Игра окончена! Счёт: ' + this.score);
                    this.reset();
                }
            }
        });
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.position.add(bullet.userData.velocity);
            bullet.userData.lifetime--;
            
            // Удаление старых пуль
            if (bullet.userData.lifetime <= 0) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Проверка попаданий
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const distance = bullet.position.distanceTo(enemy.position);
                
                if (distance < 1.5) {
                    enemy.userData.health -= bullet.userData.damage;
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);
                    
                    if (enemy.userData.health <= 0) {
                        this.scene.remove(enemy);
                        this.enemies.splice(j, 1);
                        this.score += 10;
                    }
                    break;
                }
            }
        }
    }

    reset() {
        this.enemies.forEach(enemy => this.scene.remove(enemy));
        this.bullets.forEach(bullet => this.scene.remove(bullet));
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.playerData.health = this.playerData.maxHealth;
        this.playerPosition.set(0, 1.6, 0);
        this.camera.position.copy(this.playerPosition);
        this.yaw = 0;
        this.pitch = 0;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        if (!this.running) return;

        this.updatePlayer();
        this.updateEnemies();
        this.updateBullets();

        // Спавн врагов
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > 60) {
            this.createEnemy();
            this.enemySpawnTimer = 0;
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

const game3d = new GameEngine3D();
