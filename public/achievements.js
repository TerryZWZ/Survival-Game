/* ---------- Global Variables ---------- */
// These global variables represent the six possible awards one can atain
let one; // Overachiever
let two; // Big Guns
let three; // Untouchable
let four; // Veteran
let five; // Repectable
let six; // Novice

// This variable is responsible for holding the players scores that will in turn be filtered sorted, reversed, and outputed
let newScoreArray=[];

// These variables represent the three available slots in which a player can display their scores
let scoreOneText;
let scoreTwoText;
let scoreThreeText;

// Music
let achMusic;

// This function is responsible for loading a custom font
function loadFont(name, url) {
  let newFont = new FontFace(name, `url(${url})`); // local variable
  newFont.load().then(function (loaded) {
    document.fonts.add(loaded);
  })
  .catch(function (error) {
    return error;
  });
}// end of load custom font function
loadFont("retroFont", "assets/retroGaming.ttf");

// This function is responsible for letting the player know if they recieved an award
function checkMedals(){
  if(totalDmgCheck>=10000){ // If player deals more or equal to 10,000 damage in their run
    six.clearTint()
  }

  if(totalDmgCheck>=100000){ // If player deals more or equal to 100,000 damage in their run
    four.clearTint()
  }

  if(totalDmgCheck>=500000){ // If player deals more or equal to 500,000 damage in their run
    two.clearTint()
  }

  if(minuteCheck>=1){ // If player survives for more or equal to 1 minute in their run
    five.clearTint()
  }

  if(minuteCheck>=10){ // If player survives for more or equal to 10 minutes in their run
    three.clearTint()
  }

  if(minuteCheck>=50){ // If player survives for more or equal to 50 minutes in their run
    one.clearTint()
  }
}

// This function is responsible for showing the players scores
function updateScore(){
  newScoreArray = Array.from(new Set(scoreArray)); // Filter out duplicates
  bubble_Sort(newScoreArray); // BubbleSorts - least to greatest
  newScoreArray.reverse(); // Reverse - greatest to least
  newScoreArray.length = 3; // Culls all but top 3 scores

  // Sets up the scores to be shown
  let scoreOne = newScoreArray[0];
  let scoreTwo = newScoreArray[1];
  let scoreThree = newScoreArray[2];

  // No more undefined
  if(scoreOne == undefined){ // If the variable can't be found, instead show this.
    scoreOneText.setText("1. 0");
  }

  else{ // If variable exists, show this.
    scoreOneText.setText("1. "+scoreOne);
  }

  if(scoreTwo == undefined){ // If the variable can't be found, instead show this.
    scoreTwoText.setText("2. 0");
  }

  else{ // If variable exists, show this.
    scoreTwoText.setText("2. "+scoreTwo);
  }

  if(scoreThree == undefined){ // If the variable can't be found, instead show this.
    scoreThreeText.setText("3. 0");
  }

  else{ // If variable exists, show this.
    scoreThreeText.setText("3. "+scoreThree);
  }
}

// This is a sub function of the function bubble_Sort()
function swap(arr, first_Index, second_Index){
  let temp = arr[first_Index];
  arr[first_Index] = arr[second_Index];
  arr[second_Index] = temp;
}

// This function is responsible for sorting through the scores given to it
function bubble_Sort(arr){
  let len = arr.length,i, j, stop; // local variables

  for (i=0; i < len; i++){
    for (j=0, stop=len-i; j < stop; j++){
      if (arr[j] > arr[j+1]){
        swap(arr, j, j+1);
      }
    }
  }

  return arr;
}

/* -------------------------------------------------- Achievement Screen -------------------------------------------------- */
class achievementsScreen extends Phaser.Scene{
  constructor(config){
    super(config);
  }

  /* ---------- Preloading Assets for Achievement Screen ---------- */
  preload(){

    // Navigation Buttons
    this.load.image("achievement", "assets/achievementScreen/achievementText.png");
    this.load.image("play", "assets/achievementScreen/playText.png");
    this.load.image("shop", "assets/achievementScreen/shopText.png");

    // Trophies
    this.load.image("1", "assets/achievementScreen/1.png");
    this.load.image("2", "assets/achievementScreen/2.png");
    this.load.image("3", "assets/achievementScreen/3.png");
    this.load.image("4", "assets/achievementScreen/4.png");
    this.load.image("5", "assets/achievementScreen/5.png");
    this.load.image("6", "assets/achievementScreen/6.png");

    // Music
    this.load.audio('achMusic', "assets/achievementScreen/achievementMusic.mp3")
  }// end of preload

  /* ---------- Creating Assets for Achievement Screen ---------- */
  create(){

    achMusic = this.sound.add("achMusic", {
        volume: 0.4,
      });

    achMusic.play();

    // ACHIEVEMENT fake button
    let achievement = this.add.sprite(50,30, 'achievement'); // local variable
    achievement.setOrigin(0,0);
    achievement.setScale(0.5);

    // PLAY button
    let play = this.add.sprite(600,30, 'play').setInteractive(); // local variable
    play.setOrigin(0,0);
    play.setScale(0.5);

    play.on('pointerdown', function (pointer) { // If clicked, switch to gameScene
      achMusic.pause();
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
      this.scene.stop('achievement');
    }, this);

    // SHOP button
    let shop = this.add.sprite(1075,30, 'shop').setInteractive(); // local variable
    shop.setOrigin(0,0);
    shop.setScale(0.5);

    shop.on('pointerdown', function (pointer) { // If clicked, switch to shopScene
      achMusic.pause();
      this.scene.start('shop');
      this.scene.stop('achievement');
    }, this);

    // Show trophy images
    one = this.add.image(850, 600, '1');
    one.setScale(0.9);
    one.setTint(0xff0000);

    two = this.add.image(1100, 600, '2');
    two.setScale(0.9);
    two.setTint(0xff0000);

    three = this.add.image(850, 400, '3');
    three.setScale(0.9);
    three.setTint(0xff0000);

    four = this.add.image(1100, 400, '4');
    four.setScale(0.9);
    four.setTint(0xff0000);

    five = this.add.image(850, 200, '5');
    five.setScale(0.9);
    five.setTint(0xff0000);

    six = this.add.image(1100, 200, '6');
    six.setScale(0.8);
    six.setTint(0xff0000);

    // Create three sorted scores
    this.scoreText = this.add.text(50, 200, "SCORE:",{
      fontFamily: 'retroFont',
      fontSize: '45px',
      fill: 'white',
    });

    scoreOneText = this.add.text(50, 300,"",{
      fontFamily: 'retroFont',
      fontSize: '45px',
      fill: 'white',
    });

    scoreTwoText = this.add.text(50, 400,"",{
      fontFamily: 'retroFont',
      fontSize: '45px',
      fill: 'white',
    });

    scoreThreeText = this.add.text(50, 500,"",{
      fontFamily: 'retroFont',
      fontSize: '45px',
      fill: 'white',
    });
  }

  /* ---------- Constantly Repeating for Achievement Screen ---------- */
  update(){
    checkMedals(); // updates awards
    updateScore(); // updates score
  }
}