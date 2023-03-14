/* -------------------------------------------------- Global Variables -------------------------------------------------- */
// Player Stats
let defense = 1;
let rangedDamage=1;
let meleeDamage=200;

// Music
let shopMusic;

/* -------------------------------------------------- Start Screen -------------------------------------------------- */
class shopScreen extends Phaser.Scene{
  constructor(config){
    super(config);
  }

  /* ---------- Preloading Assets for Shop Screen ---------- */
  preload(){
    
    this.add.text(1280 / 2 - 45, 720 / 2 - 25, 'Loading Game...');

    // Background Image & Music
    this.load.image("shopBackground", "assets/shopScreen/shop.png");
    this.load.audio("shopMusic","assets/shopScreen/shopMusic.mp3");

    // Navigation Buttons
    this.load.image("achievement", "assets/shopScreen/achievementText.png");
    this.load.image("play", "assets/shopScreen/playText.png");
    this.load.image("shop", "assets/shopScreen/shopText.png");

    // Potion Sprites
    this.load.image("defense", "assets/shopScreen/defense.png");
    this.load.image("ranged", "assets/shopScreen/ranged.png");
    this.load.image("melee", "assets/shopScreen/melee.png");
  }

  /* ---------- Creating Assets for Shop Screen ---------- */
  create(){

    shopMusic = this.sound.add("shopMusic", {
        volume: 0.2,
        loop: true
      });

    shopMusic.play();

    // Setting background to fit with screen
    let shopBackground = this.add.image(0, 0, 'shopBackground');
    shopBackground.setOrigin(0,0);

    // ACHIEVEMENT button
    let achievement = this.add.sprite(50,30, 'achievement').setInteractive();
    achievement.setOrigin(0,0);
    achievement.setScale(0.5);

    achievement.on('pointerdown', function (pointer) {
      shopMusic.pause();
      this.scene.start('achievement');
      this.scene.stop('shop');
    }, this);

    // PLAY button
    let play = this.add.sprite(600,30, 'play').setInteractive();
    play.setOrigin(0,0);
    play.setScale(0.5);

    play.on('pointerdown', function (pointer) {
      shopMusic.pause();
      this.scene.start('game');
      meleeMobArr = [];
      rangedMobArr = [];
      bomberMobArr = [];
      killCount = 0;
      totalDmg = 0;
      minutes = 0;
      seconds = 0;
      ultCooldown = 0;
      if(playerHealth == 0){
        playerHealth += totalHealth;
      }
      this.scene.stop('shop');
    }, this);

    // SHOP fake button
    let shop = this.add.sprite(1075,30, 'shop'); // local variable
    shop.setOrigin(0,0);
    shop.setScale(0.5);

    // Potions for sale
    // Potion of increased Defense
    let defense = this.add.sprite(180,230, 'defense').setInteractive();
    defense.setOrigin(0,0);
    defense.setScale(0.7);

    defense.on('pointerdown', function (pointer) {
      if(score >= 200){
        score -= 200;
        defense += 0.1;
        alert("You've bought a blue potion to increase defense.\nYou now have "+score+" points");
      }

      else{
        alert("Unfortunately, you don't have enough points");
      }
    });

    // Potion of increased Ranged Damage
    let ranged = this.add.sprite(90,310, 'ranged').setInteractive();
    ranged.setOrigin(0,0);
    ranged.setScale(0.2);

    ranged.on('pointerdown', function (pointer) {
      if(score >= 200){
        score -= 200;
        rangedDamage += 0.1;
        alert("You've bought a yellow potion to increase ranged damage.\nYou now have "+score+" points");
      }

      else{
        alert("Unfortunately, you don't have enough points");
      }
    });

    // Potion of increased melee damage
    let melee = this.add.sprite(50,450, 'melee').setInteractive();
    melee.setOrigin(0,0);
    melee.setScale(0.7);

    melee.on('pointerdown', function (pointer) {
      if(score >= 200){
        score -= 200;
        meleeDamage += 10;
        alert("You've bought a red potion to increase melee damage.\nYou now have "+score+" points");
      }
      
      else{
        alert("Unfortunately, you don't have enough points");
      }
    });
  }

  /* ---------- Constantly Repeating for Shop Screen ---------- */
  update(){

  }
}
