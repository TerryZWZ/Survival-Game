/* -------------------------------------------------- endOfGame Screen -------------------------------------------------- */
class endOfGameScreen extends Phaser.Scene{
  constructor(config){
    super(config);
  }

  /* ---------- Preloading Assets for endOfGame Screen ---------- */
  preload(){
    this.load.image("sceneBackground", "assets/endOfGameScreen/endOfGameBackground.png"); // Backgrond image
    this.load.image("continue","assets/endOfGameScreen/continue.png"); // Continue button
  }

  /* ---------- Creating Assets for endOfGame Screen ---------- */
  create(){
    // Creates the background image
    let sceneBackground = this.add.image(0, 0, 'sceneBackground'); // local variable
    sceneBackground.setOrigin(0,0);

    // This function is responsible for loading a custom font
    function loadFont(name, url) {
      let newFont = new FontFace(name, `url(${url})`); // localsvariable

      newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
      })
      .catch(function (error) {
        return error;
      });

    }
    loadFont("retroFont", "assets/retroGaming.ttf");

    // Creates the text: score
    this.scoreText = this.add.text(640, 450, score,{
      fontFamily: 'retroFont',
      fontSize: '35px',
      fill: 'white',
    });

    // CONTINUE button - shopScene
    let continueBtn = this.add.sprite(486,510, 'continue').setInteractive(); // local variable
    continueBtn.setOrigin(0,0);
    continueBtn.setScale(0.4);

    continueBtn.on('pointerdown', function (pointer) { // If clicked, switch to shopScene
      this.scene.start('shop');
      this.scene.stop('endOfGame');
    }, this);
  }

  /* ---------- Constantly endOfGame for Start Screen ---------- */
  update(){

  }
}