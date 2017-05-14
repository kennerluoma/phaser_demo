class Hero extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y);
        this._animationName = function () {
            return this.body.velocity.y < 0 ? `jump` : this.body.velocity.y >= 0 && !this.body.touching.down ? `fall` : this.body.velocity.x !== 0 && this.body.touching.down ? `run` : `stop`;
        };
        Phaser.Sprite.call(this, game, x, y, `hero`);
        this.anchor.set(0.5, 0.5);
        this.animations.add('stop', [0]);
        this.animations.add('run', [1, 2], 8, true);
        this.animations.add('jump', [3]);
        this.animations.add('fall', [4]);
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
    }
    update() {
        let animationName = this._animationName();
        if (this.animations.name !== animationName) {
            this.animations.play(animationName);
        }
    }
    move(direction) {
        const SPEED = 200;
        this.body.velocity.x = direction * SPEED;
        if (this.body.velocity.x < 0) {
            this.scale.x = -1;
        }
        else if (this.body.velocity.x > 0) {
            this.scale.x = 1;
        }
    }
    jump() {
        const JUMP_SPEED = 600;
        let canJump = this.body.touching.down;
        if (canJump) {
            this.body.velocity.y = -JUMP_SPEED;
        }
        return canJump;
    }
}
class Rat extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y);
        Phaser.Sprite.call(this, game, x, y, `rat`);
        this.anchor.set(0.5, 0.5);
        this.animations.add(`crawl`, [0, 1, 2], 8, true);
        this.animations.play(`crawl`);
        this.SPEED = 100;
        this.game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.body.velocity.x = this.SPEED;
    }
    update() {
        if (this.body.touching.right || this.body.blocked.right) {
            this.body.velocity.x = -this.SPEED;
        }
        else if (this.body.touching.left || this.body.blocked.left) {
            this.body.velocity.x = this.SPEED;
        }
    }
}
class PlayState extends Phaser.State {
    constructor() {
        super(...arguments);
        this._collisionHandler = function () {
            this.game.physics.arcade.collide(this.hero, this.platforms);
            this.game.physics.arcade.collide(this.rats, this.platforms);
            this.game.physics.arcade.collide(this.rats, this.enemyWalls);
        };
        this._inputHandler = function () {
            this.hero.move(this.keys.left.isDown && !this.keys.right.isDown ? -1
                : this.keys.right.isDown && !this.keys.left.isDown ? 1 : 0);
            this.keys.space.onDown.add(function () {
                let didJump = this.hero.jump();
            }, this);
        };
        this._loadLevel = function (data) {
            this.platforms = this.game.add.group();
            data.platforms.forEach(this._spawnPlatform, this);
            this.rats = this.game.add.group();
            this._spawnCharacters({ hero: data.hero, rats: data.rats });
            const GRAVITY = 1200;
            this.game.physics.arcade.gravity.y = GRAVITY;
        };
        this._spawnPlatform = function (platform) {
            let sprite = this.platforms.create(platform.x, platform.y, platform.image);
            this.game.physics.enable(sprite);
            sprite.body.allowGravity = false;
            sprite.body.immovable = true;
        };
        this._spawnCharacters = function (data) {
            this.hero = new Hero(this.game, data.hero.x, data.hero.y);
            this.game.add.existing(this.hero);
            for (let rat of data.rats) {
                let sprite = new Rat(this.game, rat.x, rat.y);
                this.rats.add(sprite);
            }
        };
    }
    init() {
        this.game.renderer.renderSession.roundPixels = true;
        this.keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.A,
            right: Phaser.KeyCode.D,
            space: Phaser.KeyCode.SPACEBAR
        });
    }
    preload() {
        this.game.load.json(`level:1`, `data/level.json`);
        this.game.load.image(`background`, `images/background.png`);
        this.game.load.image(`ground`, `images/ground.png`);
        this.game.load.image(`platform:1x1`, `images/platform_1x1.png`);
        this.game.load.image(`platform:2x1`, `images/platform_2x1.png`);
        this.game.load.image(`platform:4x1`, `images/platform_4x1.png`);
        this.game.load.image(`platform:6x1`, `images/platform_6x1.png`);
        this.game.load.image(`platform:8x1`, `images/platform_8x1.png`);
        this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
        this.game.load.spritesheet(`rat`, `images/rat.png`, 42, 32);
    }
    create() {
        this.game.add.image(0, 0, `background`);
        this._loadLevel(this.game.cache.getJSON(`level:1`));
    }
    update() {
        this._collisionHandler();
        this._inputHandler();
    }
}
class Game extends Phaser.Game {
    constructor() {
        super(960, 600, Phaser.AUTO);
        this.state.add(`play`, PlayState, false);
        this.state.start(`play`);
    }
}
new Game();
