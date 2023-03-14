/* ---------- Global Variables ---------- */
let startBackground; 

/* -------------------------------------------------- Start Screen -------------------------------------------------- */
class startScreen extends Phaser.Scene{
  constructor(config){
    super(config);
  }

  /* ---------- Preloading Assets for Start Screen ---------- */
  preload(){

    this.add.text(1280 / 2 - 45, 720 / 2 - 25, 'Loading Game...');
    this.load.image("title", "assets/startScreen/title.png");
    this.load.image("pressToStart","assets/startScreen/start.png");
    this.load.spritesheet('startBackground', 'assets/startScreen/background.png', { frameWidth: 1200, frameHeight: 720 });
  }

  /* ---------- Creating Assets for Start Screen ---------- */
  create(){

    // Setting background to fit with screen
    startBackground = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'startBackground');
    let scaleX = this.cameras.main.width / startBackground.width;
    let scaleY = this.cameras.main.height / startBackground.height;
    let scale = Math.max(scaleX, scaleY);
    startBackground.setScale(scale).setScrollFactor(0);

    // Animating background
    this.anims.create({
      key: 'start',
      frames: this.anims.generateFrameNumbers('startBackground', { start: 0, end: 27 }),
      frameRate: 27,
      repeat: -1
    });

    // Title: iSurvive
    let title = this.add.image(640, 350, 'title');
    title.setScale(2);
    title.setDepth(1);

    // Text informing player how to start the game
    let pressToStart = this.add.image(640, 500, 'pressToStart');
    pressToStart.setScale(0.5);
    pressToStart.setDepth(1);

    let text = this.add.text(400, 200, 'EARLY ALPHA BUILD', { font: '50px Arial', fill: '#FFFFFF' });
  }

  /* ---------- Constantly Repeating for Start Screen ---------- */
  update(){
    // Animated background image
    startBackground.anims.play('start', true);

    // listen to spacebar
    let spacebarStartMenu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    if(Phaser.Input.Keyboard.JustDown(spacebarStartMenu)){ // Press spacebar to switch to shopScene
      this.scene.switch('shop');
      this.scene.stop('start');
    }
  }
}

/* ---------- Scene Management ---------- */
// Adding scenes to game
game.scene.add('achievement', achievementsScreen) // Achievements Screen
game.scene.add('game', gameScreen);	// Gameplay Screen
game.scene.add('endOfGame', endOfGameScreen) // Achievements Screen
game.scene.add('shop', shopScreen); // Shop Screen
game.scene.add('start', startScreen); // Start Screen

// Starting Start Screen
game.scene.start('start');
