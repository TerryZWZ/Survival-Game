/* -------------------------------------------------- Setting up Phaser -------------------------------------------------- */
// Configuration of game's settings
let config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	}
};

// Starts a new game
let game = new Phaser.Game(config);

/* -------------------------------------------------- Global Variables -------------------------------------------------- */
// All these variables are global because their value is used in multiple functions, and when their value changes, they should change in other functions as well

// Controls
let W; // Move Up
let A; // Move Right
let D; // Move Left
let spacebar; // Ranged Attack
let S; // Melee Kick
let Q; // Ultimate Attack

// Characters
let player;
let meleeMob;
let rangedMob;
let bomberMob;

// Environment
let ground;

// Values
let playerHealth = 10000;
let ultCooldown = 0;
let totalDmg = 0;
let score = 0;
let killCount = 0;
let seconds = 0;
let minutes = 0;
let difficultyMultiplier = 1;
let spawnMultiplier = 1;
let scoreArray = []; // To be used for a sorted list of scores in achievementScreen
let totalDmgCheck = 0;
let minuteCheck = 0;

// Text
let healthText;
let meleeMobCounter;
let rangedMobCounter;
let bomberMobCounter;
let scoreText;
let countText;
let secondsText;
let totalDmgText;
let ultText;

// Player Mechanics
let healthbar;
let totalHealth = playerHealth;
let projectileArrR = [];
let projectileArrL = [];
let playerTrackR = [];
let playerTrackL = [];
let arrUltR = [];
let arrUltL = [];
let ultTrackR = [];
let ultTrackL = [];
let playerDirection = 'RIGHT';
let slashStatus = 'N/A';
let healthbarScale;

// Melee Mob Mechanics
let meleeMobArr = [];

// Ranged Mob Mechanics
let rangedMobArr = [];
let mobProjectileR = [];
let mobProjectileL = [];
let rangedMobTrackR = [];
let rangedMobTrackL = [];

// Bomber Mob Mechanics
let bomberMobArr = [];

// Music
let gameMusic;

/* -------------------------------------------------- Gameplay Screen -------------------------------------------------- */
class gameScreen extends Phaser.Scene {

	constructor(config) {

		super(config);
	}

	/* ---------- Preloading Assets for Gameplay Screen ---------- */
	preload() {

		this.add.text(1280 / 2 - 45, 720 / 2 - 25, 'Loading Game...');

	 	// Loading environment
		this.load.image('bg', 'assets/background.png');
		this.load.image('bg2', 'assets/background2.jpg');
		this.load.image('bg3', 'assets/background.png');
		this.load.image('bg4', 'assets/background4.jpg');
		this.load.image('bg5', 'assets/background5.png');
		this.load.image('bg6', 'assets/background6.jpg');
		this.load.image('bg7', 'assets/background7.png');
		this.load.image('bg8', 'assets/background8.png');
		this.load.image('ground', 'assets/ground.png');
		this.load.image('ground2', 'assets/ground2.png');
		this.load.image('ground4', 'assets/ground4.png');
		this.load.image('ground5', 'assets/ground5.png');
		this.load.image('platform', 'assets/platform.png');

	 	// Loading projectiles
		this.load.image('projectile', 'assets/projectile.png');
		this.load.image('playerProjectile', 'assets/playerProjectile.png');
		this.load.image('ult', 'assets/ultimate.png');
		this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 125, frameHeight: 125 });

	 	// Loading charactersa
		this.load.spritesheet('player', 'assets/player.png', { frameWidth: 50, frameHeight: 37 });
		this.load.spritesheet('mob', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
		this.load.spritesheet('skeleton', 'assets/skeleton.png', { frameWidth: 128, frameHeight: 64 });

	 	// Music
		this.load.audio("gameMusic", "assets/backgroundMusic.ogg");
	}

	/* ---------- Creating Game Elements for Gameplay Screen ---------- */
	create() {

		this.randomEnvironment(); // Core function is to create background and ground of the world

		this.createPlayer(); // Creates player

		this.createInfo(); // Creates text that delivers game information

		this.meleeMobGenerator(1, 'mob', 3000, 1000, 1000, 50); // Generates melee mobs (how many are spawned at the same time, what is spawned, spawn frequency, base health, base damage)

		this.rangedMobGenerator(1, 'mob', 3000, 750); // Generates ranged mobs (how many are spawned at the same time, what is spawned, spawn frequency, base health)

		this.bomberMobGenerator(1, 'mob', 8000, 150, 350); // Generates bomber mobs (how many are spawned at the same time, what is spawned, spawn frequency, base health)

		gameMusic = this.sound.add("gameMusic", {
			volume: 0.2,
			loop: true
		});

		gameMusic.play();
	}

	/* ---------- Constantly Repeating Actions for Gameplay Screen ---------- */
	update() {

		this.playerControls(); // Player movement controls and other hotkeys
		this.playerMelee(meleeMobArr); // Player's physical melee attack towards melee mobs
		this.playerMelee(rangedMobArr); // Player's physical melee attack towards ranged mobs
		this.playerShoot(player, 1000); // Player shoots projectile
		this.playerDistance(projectileArrR, projectileArrL, meleeMobArr, playerTrackR, playerTrackL, 300, 2, rangedDamage); // Player's ranged attack towards melee mobs
		this.playerDistance(projectileArrR, projectileArrL, rangedMobArr, playerTrackR, playerTrackL, 300, 2, rangedDamage); // Player's ranged attack towards ranged mobs
		this.playerDistance(projectileArrR, projectileArrL, bomberMobArr, playerTrackR, playerTrackL, 300, 2, rangedDamage); // Player's ranged attack towards bomber mobs

		this.playerDistance(arrUltR, arrUltL, meleeMobArr, ultTrackR, ultTrackL, 1200, 3, rangedDamage * 10); // Player's ranged attack towards melee mobs
		this.playerDistance(arrUltR, arrUltL, rangedMobArr, ultTrackR, ultTrackL, 1200, 3, rangedDamage * 10); // Player's ranged attack towards ranged mobs
		this.playerDistance(arrUltR, arrUltL, bomberMobArr, ultTrackR, ultTrackL, 1200, 3, rangedDamage * 10); // Player's ranged attack towards bomber mobs

		this.playerHealth(); // Progression of player's health if damage is taken

		this.meleeMobBot(); // The "AI" of melee Bots
		meleeMobCounter.setText('Melee Mobs Spawned: ' + this.meleeMobBot()); // Indicates how many melee mobs have spawned so far

		this.rangedMobBot(); // The "AI" of ranged Bots
		rangedMobCounter.setText('Ranged Mobs Spawned: ' + this.rangedMobBot()); // Indicates how many ranged mobs have spawned so far

		this.bomberMobBot(); // The "AI" of bomber Bots
		bomberMobCounter.setText('Bomber Mobs Spawned: ' + this.bomberMobBot()); // Indicates how many bomber mobs have spawned so far
	}

	/* ---------- Random Background Function ---------- */
	randomEnvironment() {

		let bgArray = ['bg', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8']; // Potential backgrounds
		let selectedBg = bgArray[Math.floor(Math.random() * bgArray.length)]; // Picking random background
		let background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, selectedBg);
		let scaleX = this.cameras.main.width / background.width; // Fitting background image to fit game canvas
		let scaleY = this.cameras.main.height / background.height; // Source: https:// phaser.discourse.group/t/how-to-stretch-background-image-on-full-screen/1839
		let scale = Math.max(scaleX, scaleY);
		background.setScale(scale).setScrollFactor(0);

		let groundArray = ['ground', 'ground2', 'ground4', 'ground5']; // Potential ground textures
		let groundX = [640, 550, 610, 650]; // Since each ground texture has a different width/height, each ground needs a different x, y coordinate and scale to fit game ground
		let groundY = [850, 600, 750, 700]; // The value of the index of the array correlate with each other
		let groundScale = [2.5, 3, 1, 0.4] // For example, groundArray[0] will have the groundX[0] as x coordinate, groundX[0] as y coordinate, groundScale[0] as scale
		let selectedGround = groundArray[Math.floor(Math.random() * groundArray.length)]; // Picking random ground
		ground = this.physics.add.staticGroup(); // Ground is a static body, meaning it won't react to physics
		ground.create(groundX[groundArray.indexOf(selectedGround)], groundY[groundArray.indexOf(selectedGround)], selectedGround).setScale(groundScale[groundArray.indexOf(selectedGround)]).refreshBody();
	}

	/* ---------- Creation of Player Function ---------- */
	createPlayer() {

	 	// Creating hotkeys for controls
		W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		Q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
		

	 	// Creating player
		player = this.physics.add.sprite(650, 450, 'skeleton');
	 	//player = this.physics.add.sprite(650, 450, 'player');
		player.setScale(2);
		player.setBounce(0.3);
		player.setCollideWorldBounds(true);
		player.setSize(25, 35, true); // Modifying player's hitbox

		this.physics.add.collider(player, ground); // Setting collisions between player and environment

	 	// Creating player animation to emulate movement
		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNumbers('skeleton', { start: 4, end: 8 }),
			frameRate: 30,
		});

		this.anims.create({
			key: 'slash',
			frames: this.anims.generateFrameNumbers('skeleton', { start: 10, end: 15 }),
			frameRate: 15,
		});

		this.anims.create({
			key: 'explode',
			frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
			frameRate: 30
		});

	/*
	 	// Creating player animation to emulate movement
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('player', { start: 1, end: 6 }),
			frameRate: 30,
			repeat: -1
		});

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 13 }),
			frameRate: 30
		});

		this.anims.create({
			key: 'slashR',
			frames: [{ key: 'player', frame: 14 }],
			frameRate: 20
		});

		this.anims.create({
			key: 'slashL',
			frames: [{ key: 'player', frame: 15 }],
			frameRate: 20
		});

		this.anims.create({
			key: 'explode',
			frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
			frameRate: 30,
		});
	*/
	}

	/* ---------- Information Store Function ---------- */
	createInfo() {
		loadFont("retroFont", "assets/retroGaming.ttf");

	 	// Creating healthbar with corresponding text
		healthText = this.add.text(16, 16, 'Health: 100000', {
			fontFamily: "retroFont",
			fontSize: '32px',
			fill: 'white',
			fontWeight: 'bold'
		});

		this.add.rectangle(260, 70, 500, 30, 0x39636C);
		healthbar = this.add.rectangle(260, 70, 490, 15, 0x00C96E);
		healthbarScale = healthbar.width;

	 	// Creating indicator for # of melee mobs spawned
		meleeMobCounter = this.add.text(1020, 16, 'Melee Mobs Spawned: ', {
			fontFamily: 'retroFont',
			fontSize: '15px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for # of ranged mobs spawned
		rangedMobCounter = this.add.text(1020, 36, 'Eanged Mobs Spawned: ', {
			fontFamily: 'retroFont',
			fontSize: '15px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for # of bomber mobs spawned
		bomberMobCounter = this.add.text(1020, 56, 'Bomber Mobs Spawned: ', {
			fontFamily: 'retroFont',
			fontSize: '15px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for score
		scoreText = this.add.text(16, 90, 'SCORE: ' + score, {
			fontFamily: "retroFont",
			fontSize: '32px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for killcount
		countText = this.add.text(this.cameras.main.width / 2, 16, 'Kills: ' + killCount, {
			fontFamily: 'retroFont',
			fontSize: '20px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for minutes passed in-game
		secondsText = this.add.text(16, 130, 'Time Passed: ' + minutes + ':' + seconds, {
			fontFamily: "retroFont",
			fontSize: '32px',
			fill: 'white',
			fontWeight: 'bold'
		});

		let mainTimer = this.time.addEvent({
			delay: 1000,
			callback: this.gameTime, // every 1 second, this function occurs
			callbackScope: this,
			loop: true
		});

	 	// Creating indicator for total damage delt to mobs
		totalDmgText = this.add.text(this.cameras.main.width / 2, 36, 'Total Damage: ' + totalDmg, {
			fontFamily: 'retroFont',
			fontSize: '20px',
			fill: 'white',
			fontWeight: 'bold'
		});

	 	// Creating indicator for total damage delt to mobs
		ultText = this.add.text(16, 170, 'Ultimate Charge: ' + ultCooldown, {
			fontFamily: 'retroFont',
			fontSize: '32px',
			fill: 'white',
			fontWeight: 'bold'
		});
	}

	/* ---------- Game Time Function ---------- */
	gameTime() {

		seconds++; // Since this is the callback to mainTimer, every 1 seconds, 1 is added to seconds
		secondsText.setText('Time Passed: ' + minutes + ':' + seconds); // Updating seconds indicator
		if (seconds == 60) { // Once 60 seconds pass, a minute is gained
			minutes++;
			seconds = 0; // Updating seconds to 0 since a minute has passed
			secondsText.setText('Time Passed: ' + minutes + ':' + seconds); // Updating seconds indicator
		}

		if (seconds == 30) { // Every 30 seconds, difficulty multiplier will increase, which will later increase mob damage ouput
			difficultyMultiplier *= 1.25;
		}

		if (seconds == 59) { // Every 59 seconds, spawn multiplier will increase, which will increase mob spawn speed
			spawnMultiplier += 0.1;
		}
	}

	/* ---------- Player Movement Function ---------- */
	playerControls() {

		if (W.isDown && player.body.touching.down) { // Jump if W is pressed
			player.setVelocityY(-330);
		}

		if (D.isDown) { // Move Right if D is pressed
			player.setVelocityX(200);
			player.setFlipX(false);
			player.anims.play('walk', true);
			playerDirection = 'RIGHT'; // Stores data that key facing right side is pressed
		}

		else if (A.isDown) { // Move left if A is pressed
			player.setVelocityX(-200);
			player.setFlipX(true);
			player.anims.play('walk', true);
			playerDirection = 'LEFT'; // Stores data that key facing left side is pressed
		}

		else if (S.isDown) { // Melee attack if S is pressed
			player.anims.play('slash', true);
		}
		
		else { // If no key is pressed, no movement will occur
			player.setVelocityX(0);
			player.setFrame(9);
		}

		console.log(slashStatus);
	}

	/* ---------- Player Health Function ---------- */
	playerHealth() {

		healthText.setText('Health: ' + Math.round(playerHealth)); // Updating health indicator

	 // If % of total health is reached, healthbar color changes
		if (playerHealth <= totalHealth * 0.75) {
			healthbar.setFillStyle(0x00C96E); // 75% and up, healthbar is green
		}

		if (playerHealth <= totalHealth * 0.5) {
			healthbar.setFillStyle(0x61C900); // 50% and up, healthbar is yellow-green
		}

		if (playerHealth <= totalHealth * 0.33) {
			healthbar.setFillStyle(0xC9A400); // 33% and up, healthbar is yellow
		}

		if (playerHealth <= totalHealth * 0.15) {
			healthbar.setFillStyle(0xC90000); // 15% and up, healthbar is red
		}

		if (playerHealth <= 0) { // If player hits 0 health
			playerHealth = 0;
			healthText.setText('Health: 0'); // Setting health to 0 just in case value goes under 0
			healthbar.width = 5;
			healthbar.setFillStyle(0xC90000);
			player.destroy(); // Player dissapears

			if (totalDmgCheck < totalDmg) {
				totalDmgCheck = totalDmg;
			}
			if (minuteCheck < minutes) {
				minuteCheck = minutes;
			}

			scoreArray.push(score);
		 	//console.log(scoreArray);

			gameMusic.pause();
			this.scene.start('endOfGame');
			this.scene.stop('game');
		}
	}

	/* ---------- Player Melee Function ---------- */
	playerMelee(char, charHealth) {

		for (let x = 0; x < char.length; x++) {

			this.physics.add.overlap(char[x].id, player, function () { // If S is pressed, player may deal damage to mob if they are in contact
				if (S.isDown) {
					slashStatus = 'READY';
					damage();
				}
			});

			if (slashStatus == 'READY') {
				slashStatus = 'N/A';
			}

			function damage() {
				for (let o = 0; o < char.length; o++) {
					char[o].health -= meleeDamage; // Damage delt to mob
				}

				totalDmg += meleeDamage; // Damage delt is added to total damage
			}

			if (char[x].health <= 0) { // If mob health reaches 0, it disapears
				char[x].id.disableBody(true, true);
				Phaser.Utils.Array.RemoveAt(char, x);

				if (char == meleeMobArr) { // Depending on what mob is killed, you may gain points for the score
					score += 100; // Gain points
					scoreText.setText('Score: ' + score); // Score indicator is updated
					killCount += 1; // A kill is recorded
					countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
				}

				if (char == rangedMobArr) {
					score += 150;
					scoreText.setText('Score: ' + score);
					killCount += 1; // A kill is recorded
					countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
				}

				if (char == bomberMobArr) {
					score += 50;
					scoreText.setText('Score: ' + score);
					killCount += 1; // A kill is recorded
					countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
				}
			}
		}
	}

	/* ---------- Player Projectile Function ---------- */
	playerShoot(char, charge) {

		if (ultCooldown < charge) {
			ultCooldown++;
			ultText.setText('Ultimate Charge: ' + Math.round(ultCooldown / 100) + '%');
		}

		if (playerDirection == 'RIGHT') { // If player is facing right side

			if (Phaser.Input.Keyboard.JustDown(spacebar)) { // Press Spacebar to create projectile towards right side
				let projectile = this.physics.add.image(char.x, char.y, 'playerProjectile').setScale(0.5).setSize(50, 150, true);
				projectile.body.setAllowGravity(false);
				projectileArrR.push(projectile);
				playerTrackR.push(char.x); // Tracks player's inital right side coordinates to measure blast distance
			}

			if (ultCooldown == charge) {

				ultText.setText('Ultimate Charge: READY');

				if (Phaser.Input.Keyboard.JustDown(Q)) {
					let projectile = this.physics.add.image(char.x, char.y, 'ult').setScale(1).setSize(350, 200, true);
					projectile.flipX = true;
					projectile.body.setAllowGravity(false);
					arrUltR.push(projectile);
					ultTrackR.push(char.x); // Tracks player's inital right side coordinates to measure blast distance
					ultCooldown = 0;
				}
			}
		}

		if (playerDirection == 'LEFT') {

			if (Phaser.Input.Keyboard.JustDown(spacebar)) { // Press Spacebar to create projectile towards left side
				let projectile = this.physics.add.image(char.x, char.y, 'playerProjectile').setScale(0.5).setSize(50, 150, true);
				projectile.flipX = true;
				projectile.body.setAllowGravity(false);
				projectileArrL.push(projectile);
				playerTrackL.push(char.x); // Tracks player's inital left side coordinates to measure blast distance
			}

			if (ultCooldown == charge) {

				ultText.setText('Ultimate Charge: READY');

				if (Phaser.Input.Keyboard.JustDown(Q)) {
					let projectile = this.physics.add.image(char.x, char.y, 'ult').setScale(1).setSize(350, 200, true);
					projectile.body.setAllowGravity(false);
					arrUltL.push(projectile);
					ultTrackL.push(char.x); // Tracks player's inital right side coordinates to measure blast distance
					ultCooldown = 0;
				}
			}
		}
	}

	/* ---------- Player Projectile Distance Function ---------- */
	playerDistance(arr, arrL, char, trackR, trackL, distance, speed, dmg) {

		for (let i = 0; i < arr.length; i++) {
			let beam = arr[i];
			beam.x += speed; // Projectile movement speed

			for (let x = 0; x < char.length; x++) {
				this.physics.add.overlap(char[x].id, beam, function () { damage(); }); // If projectile and mob come in contact, damage will be delt

				function damage() {

					for (let o = 0; o < char.length; o++) {
						char[o].health -= rangedDamage; // Damage delt to mob
					}
					totalDmg += rangedDamage; // Damage delt is added to total damage
				}


				if (char[x].health <= 0) { // If mob health reaches 0, it disapears
					let explosion = this.add.sprite(char[x].id.x, char[x].id.y, 'explosion').setScale(1); // explosion is created
					explosion.anims.play('explode', true);
					let timer = this.time.delayedCall(1, function () { explosion.destroy(); }); // explosion fades away
					char[x].id.disableBody(true, true);
					Phaser.Utils.Array.RemoveAt(char, x);

					if (char == meleeMobArr) { // Depending on what mob is killed, you may gain points for the score
						score += 100; // Gain points
						scoreText.setText('Score: ' + score); // Score indicator is updated
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}

					if (char == rangedMobArr) {
						score += 150;
						scoreText.setText('Score: ' + score);
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}

					if (char == bomberMobArr) {
						score += 50;
						scoreText.setText('Score: ' + score);
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}
				}
			}

			if (trackR[i] + distance < beam.x) { // If damage is 300px away from right side, it disapears
				beam.destroy();
				trackR.shift(trackR[i]);
				arr.shift(beam);
			}

			if (trackR[i] - distance > beam.x) { // If damage is 300px away from left side, it disapears
				beam.destroy();
				trackR.shift(trackR[i]);
				arr.shift(beam);
			}
		}

		for (let i = 0; i < arrL.length; i++) {
			let beam2 = arrL[i];
			beam2.x -= speed; // Projectile movement speed

			for (let x = 0; x < char.length; x++) {
				this.physics.add.overlap(char[x].id, beam2, function () { damage(); }); // If projectile and mob come in contact, damage will be delt

				function damage() {

					for (let o = 0; o < char.length; o++) {
						char[o].health -= dmg; // Damage delt to mob
					}
					totalDmg += dmg; // Damage delt is added to total damage
				}

				if (char[x].health <= 0) { // If mob health reaches 0, it disapears

					let explosion = this.add.sprite(char[x].id.x, char[x].id.y, 'explosion').setScale(1); // explosion is created
					explosion.anims.play('explode', true);
					let timer = this.time.delayedCall(1, function () { explosion.destroy(); }); // explosion fades away
					char[x].id.disableBody(true, true);
					Phaser.Utils.Array.RemoveAt(char, x);

					if (char == meleeMobArr) { // Depending on what mob is killed, you may gain points for the score
						score += 100; // Gain points
						scoreText.setText('Score: ' + score); // Score indicator is updated
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}

					if (char == rangedMobArr) {
						score += 150;
						scoreText.setText('Score: ' + score);
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}

					if (char == bomberMobArr) {
						score += 50;
						scoreText.setText('Score: ' + score);
						killCount += 1; // A kill is recorded
						countText.setText('Kills: ' + killCount); // Killcount Indicator is updated
					}
				}
			}

			if (trackL[i] + distance < beam2.x) { // If damage is 300px away from right side, it disapears
				beam2.destroy();
				trackL.shift(trackL[i]);
				arrL.shift(beam2);
			}

			if (trackL[i] - distance > beam2.x) { // If damage is 300px away from left side, it disapears
				beam2.destroy();
				trackL.shift(trackL[i]);
				arrL.shift(beam2);
			}
		}
	}

	/* ---------- meleeMob Respawn Function ---------- */
	meleeMobGenerator(population, char, spawnSpeed, health, attackSpeed, dmg) {

	 	// Creating meleeMob animation to emulate movement
		this.anims.create({
			key: 'meleeMobR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'meleeMobL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'meleeMobHitR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'meleeMobHitL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		for (let i = 0; i < population; i++) {

			let spawnTimer = this.time.addEvent({ // Every parameter specified seconds, mob spawn occurs
				delay: spawnSpeed * spawnMultiplier,
				callback: spawn,
				callbackScope: this,
				loop: true
			});

			let attackTimer = this.time.addEvent({ // Every parameter specified seconds, an attack occurs
				delay: attackSpeed,
				callback: damage,
				args: [dmg],
				callbackScope: this,
				loop: true
			});

		

			attackTimer.paused = true; // Pause attack timer until mob comes into contact with player

			function spawn() {

				let location = [0, 1280]; // Right side, or left side of world
				let spawnLocation = location[Math.floor(Math.random() * location.length)]; // Randomly picking left or right side spawn location
				let mobSpawn = this.physics.add.sprite(spawnLocation, 500, char);
				mobSpawn.setBounce(0.3);
				mobSpawn.setCollideWorldBounds(true);
				this.physics.add.collider(mobSpawn, ground);
				let meleeMob = { id: mobSpawn, health: health * difficultyMultiplier, }// Melee mob is created
				meleeMobArr.push(meleeMob);

				for (let p = 0; p < meleeMobArr.length; p++) {
					this.physics.add.overlap(player, meleeMobArr[p].id, function () { attackTimer.paused = false; }); // If mob comes in contact with player, attackTimer may start
				}
			}

			function damage(dmg) {

				for (let p = 0; p < meleeMobArr.length; p++) {
					playerHealth -= (dmg / defense) * difficultyMultiplier; // Damage delt to player, as time passes, it gets stronger through difficulty multiplier
					healthbar.width -= (healthbarScale / totalHealth) * ((dmg / defense) * difficultyMultiplier); // As player health decreases, the healthbar decreases as well
					this.playerHealth(); // Function to update healthbar color and health indicator

					if (player.x - meleeMobArr[p].id.x < 20 && player.x - meleeMobArr[p].id.x > 0) { // If player is right of where mob is attacking, right attack animation
						meleeMobArr[p].id.anims.play('meleeMobHitR', true);
					}

					if (meleeMobArr[p].id.x - player.x > 0) { // If player is right of where mob is attacking, left attack animation
						meleeMobArr[p].id.anims.play('meleeMobHitL', true);
					}

					if (meleeMobArr[p].id.x < player.x - 20) { // If player walks away from right side, attackTimer is paused since mob is no longer in contact
						attackTimer.paused = true;
					}

					if (meleeMobArr[p].id.x > player.x + 20) { // If player walks away from left side, attackTimer is paused since mob is no longer in contact
						attackTimer.paused = true;
					}
				}
			}
		}
	}

	/* ---------- meleeMob Tendencies Function ---------- */
	meleeMobBot() {

		for (let i = 0; i < meleeMobArr.length; i++) {

			if (meleeMobArr[i].id.x < player.x - 20) { // If player is right of mob, mob moves to player until 20px away
				meleeMobArr[i].id.anims.play('meleeMobR', true);
				meleeMobArr[i].id.setVelocityX((Math.random() * (150 - 50) + 50));
			}

			if (meleeMobArr[i].id.x > player.x - 20 && meleeMobArr[i].id.x < player.x + 20) { // When mob reaches player, they stay stationary
				meleeMobArr[i].id.setVelocityX(0);
			}

			if (meleeMobArr[i].id.x > player.x + 20) { // If player is left of mob, mob moves to player until 20px away
				meleeMobArr[i].id.anims.play('meleeMobL', true);
				meleeMobArr[i].id.setVelocityX(-(Math.random() * (150 - 50) + 50));
			}
		}

		return meleeMobArr.length; // return amount of melee mobs spawned
	}

	/* ---------- rangedMob Respawn Function ---------- */
	rangedMobGenerator(population, char, spawnSpeed, health) {

	 // Creating rangedMob animation to emulate movement
		this.anims.create({
			key: 'rangedMobR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobShootR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobShootL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});


		for (let i = 0; i < population; i++) { // Every parameter specified seconds, mob spawn occurs

			let spawnTimer = this.time.addEvent({
				delay: spawnSpeed * spawnMultiplier,
				callback: spawn,
				callbackScope: this,
				loop: true
			});

			function spawn() {

				let location = [0, 1280]; // Right side, or left side of world
				let spawnLocation = location[Math.floor(Math.random() * location.length)]; // Randomly picking left or right side spawn location
				let mobSpawn = this.physics.add.sprite(spawnLocation, 500, char);
				mobSpawn.setBounce(0.3);
				mobSpawn.setCollideWorldBounds(true);
				this.physics.add.collider(mobSpawn, ground);
				let rangedMob = { id: mobSpawn, health: health * difficultyMultiplier, cooldown: 0, position: 'N/A' } // Ranged mob is created
				rangedMobArr.push(rangedMob);
			}
		}
	}

	/* ---------- rangedMob Shooting Projectiles Function ---------- */
	rangedMobShoot(blast, speed, distance, dmg) {

		for (let i = 0; i < rangedMobArr.length; i++) {
			rangedMobArr[i].cooldown += 1; // Timer starts

			if (rangedMobArr[i].cooldown == 250) { // When timer teaches 250, mob will shoot projectile

				if (rangedMobArr[i].position == 'RIGHT') { // If mob is facing right, it will shoot right side projectile
					rangedMobArr[i].id.anims.play('rangedMobShootR', true);
					let projectile = this.physics.add.image(rangedMobArr[i].id.x, rangedMobArr[i].id.y, blast).setScale(0.75).setSize(60, 60, true);
					projectile.body.setAllowGravity(false);
					mobProjectileR.push(projectile);
					rangedMobTrackR.push(rangedMobArr[i].id.x); // Tracks mob's inital right side coordinates to measure blast distance
				}

				if (rangedMobArr[i].position == 'LEFT') { // if mob is facing right, it will shoot left side projectile
					rangedMobArr[i].id.anims.play('rangedMobShootL', true);
					let projectile = this.physics.add.image(rangedMobArr[i].id.x, rangedMobArr[i].id.y, blast).setScale(0.75).setSize(60, 60, true);
					projectile.body.setAllowGravity(false);
					mobProjectileL.push(projectile);
					rangedMobTrackL.push(rangedMobArr[i].id.x); // Tracks mob's inital left side coordinates to measure blast distance
				}

				rangedMobArr[i].cooldown = 0;
			}
		}

		for (let i = 0; i < mobProjectileR.length; i++) {
			let beam = mobProjectileR[i];
			beam.x += speed; // Mob's projectile speed
			this.physics.add.overlap(player, beam, function () { damage(dmg); }); // If mob's right side projectile and player come in contact, damage will be delt to player

			if (beam.x > + rangedMobTrackR[i] + distance) { // Distance of Mob's projectile before it disapears
				beam.destroy();
				Phaser.Utils.Array.RemoveAt(mobProjectileR, i);
				Phaser.Utils.Array.RemoveAt(rangedMobTrackR, i);
			}
		}

		for (let i = 0; i < mobProjectileL.length; i++) {
			let beam = mobProjectileL[i];
			beam.x -= speed; // Mob's projectile speed
			this.physics.add.overlap(player, beam, function () { damage(dmg); }); // If mob's left side projectile and player come in contact, damage will be delt to player

			if (beam.x < + rangedMobTrackL[i] - distance) { // Distance of Mob's projectile before it disapears
				beam.destroy();
				Phaser.Utils.Array.RemoveAt(mobProjectileL, i);
				Phaser.Utils.Array.RemoveAt(rangedMobTrackL, i);
			}
		}

	 	// Ranged mob's damage function
		function damage(dmg) {

			playerHealth -= (dmg / defense) * difficultyMultiplier; // Damage delt to player, as time passes, it gets stronger through difficulty multiplier
			healthbar.width -= (healthbarScale / totalHealth) * ((dmg / defense) * difficultyMultiplier); // As player health decreases, the healthbar decreases as well
		}

		this.playerHealth(); // Function to update healthbar color and health indicator
	}

	/* ---------- rangedMob Tendencies Function ---------- */
	rangedMobBot() {

	 	// Creating rangedMob animation to emulate movement
		this.anims.create({
			key: 'rangedMobR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobShootR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'rangedMobShootL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});


		for (let i = 0; i < rangedMobArr.length; i++) {

			if (rangedMobArr[i].id.x < player.x - 150) { // If player is right of mob, mob moves to player until 150px away
				rangedMobArr[i].id.anims.play('rangedMobR', true);
				rangedMobArr[i].id.setVelocityX((Math.random() * (150 - 50) + 50));
				rangedMobArr[i].position = 'RIGHT';
			}

			if (rangedMobArr[i].id.x > player.x - 150 && rangedMobArr[i].id.x < player.x + 150) { // When mob reaches 150px away from player, they stay stationary
				rangedMobArr[i].id.setVelocityX(0);
			}

			if (rangedMobArr[i].id.x > player.x + 150) { // If player is right of mob, mob moves to player until 150px away
				rangedMobArr[i].id.anims.play('rangedMobL', true);
				rangedMobArr[i].id.setVelocityX(-(Math.random() * (150 - 50) + 50));
				rangedMobArr[i].position = 'LEFT';
			}
		}
		this.rangedMobShoot('projectile', 2, 300, 0.1); // Mob's projectile function

		return rangedMobArr.length; // Return amount of ranged mobs spawned
	}

	/* ---------- bomberMob Respawn Function ---------- */
	bomberMobGenerator(population, char, spawnSpeed, health, dmg) {

	 	// Creating bomberMob animation to emulate movement
		this.anims.create({
			key: 'bomberMobR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'bomberMobL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'bomberMobHitR',
			frames: this.anims.generateFrameNumbers('mob', { start: 5, end: 7 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'bomberMobHitL',
			frames: this.anims.generateFrameNumbers('mob', { start: 0, end: 2 }),
			frameRate: 20,
		});

		this.anims.create({
			key: 'explode',
			frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
			frameRate: 24,
		});

		for (let i = 0; i < population; i++) {

			let spawnTimer = this.time.addEvent({ // Every parameter specified seconds, mob spawn occurs
				delay: spawnSpeed * spawnMultiplier,
				callback: spawn,
				callbackScope: this,
				loop: true
			});

			let explodeTimer = this.time.addEvent({ // When this timer is true, explode function occurs
				delay: 1,
				callback: explode,
				callbackScope: this,
				loop: true
			});

			explodeTimer.paused = true; // Pause explosion until mob comes into contact with player

			function spawn() {

				let location = [0, 1280];	 // Right side, or left side of world
				let spawnLocation = location[Math.floor(Math.random() * location.length)]; // Randomly picking left or right side spawn location
				let mobSpawn = this.physics.add.sprite(spawnLocation, 500, char);
				mobSpawn.setBounce(0.3);
				mobSpawn.setCollideWorldBounds(true);
				this.physics.add.collider(mobSpawn, ground);
				let bomberMob = { id: mobSpawn, health: health * difficultyMultiplier } // Bomber mob is created
				bomberMobArr.push(bomberMob);

				for (let p = 0; p < bomberMobArr.length; p++) {

					this.physics.add.collider(player, bomberMobArr[p].id, function () { // If mob comes in contact with player
						playerHealth -= (dmg / defense) * difficultyMultiplier; // Damage delt to player, as time passes, it gets stronger through difficulty multiplier
						healthbar.width -= (healthbarScale / totalHealth) * ((dmg / defense) * difficultyMultiplier); // As player health decreases, the healthbar decreases as well
						healthText.setText('Health: ' + Math.round(playerHealth)); // Update to health indicator
						explodeTimer.paused = false; // Explosion starts
						for (let o = 0; o < bomberMobArr.length; o++) {
							bomberMobArr[o].id.disableBody(true, true);
							Phaser.Utils.Array.RemoveAt(bomberMobArr, o);
						}
					});

					this.playerHealth(); // Function to update healthbar color

				}
			}

			function explode() {

				let explosion = this.add.sprite(player.x, player.y, 'explosion').setScale(1); // explosion is created
				explosion.anims.play('explode', true);
				let timer = this.time.delayedCall(500, function () { explosion.destroy(); }); // explosion fades away


				score += 25; // Even though player did not kill mob on time before explosion, player still gains 25 points
				scoreText.setText('Score: ' + score); // Update to score indicator

				explodeTimer.paused = true; // Explosion is stopped since it 'faded away'
			}
		}
	}

	/* ---------- bomberMob Tendencies Function ---------- */
	bomberMobBot() {

		for (let i = 0; i < bomberMobArr.length; i++) {

			if (bomberMobArr[i].id.x < player.x - 5) { // If player is right of mob, mob moves to player until 5px away
				bomberMobArr[i].id.anims.play('bomberMobR', true);
				bomberMobArr[i].id.setVelocityX((Math.random() * (350 - 270) + 270));
			}

			if (bomberMobArr[i].id.x > player.x - 5 && bomberMobArr[i].id.x < player.x + 5) { // When mob reaches player, they stay stationary
				bomberMobArr[i].id.setVelocityX(0);
			}

			if (bomberMobArr[i].id.x > player.x + 5) { // If player is right of mob, mob moves to player until 5px away
				bomberMobArr[i].id.anims.play('bomberMobL', true);
				bomberMobArr[i].id.setVelocityX(-(Math.random() * (350 - 270) + 270));
			}
		}

		return bomberMobArr.length; // Return amount of bomber mobs spawned
	}
}

/* ---------- Custom Font Function ---------- */
function loadFont(name, url) {
	let newFont = new FontFace(name, `url(${url})`); // local variable
	newFont.load().then(function (loaded) {
		document.fonts.add(loaded);
	}).catch(function (error) {
		return error;
	});
}

