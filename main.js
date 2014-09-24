var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

var mainState = {
	/**
	 * Preload game assets.
	 */
	preload: function() {
		game.stage.backgroundColor = '#333333';
		/**
		 * Phaser does not support geometry for sprites, so
		 * use graphics instead.
		 */
		game.load.image('player', 'assets/player.png');
		game.load.image('obstacle', 'assets/obstacle.png');
		/**
		 * Necessary for displaying FPS.
		 */
		game.time.advancedTiming = true;
    },
	
	/**
	 * Set up the game.
	 */
    create:	function() {
		/**
		 * Set up conditional variables.
		 */
		this.isReady = false;
		/**
		 * Enable (arcade) physics, making extra calculations
		 * unnecessary.
		 */
		game.physics.startSystem(Phaser.Physics.ARCADE);
		/**
		 * Define player (sprite, gravity and hitbox).
		 */
		this.player = this.game.add.sprite(100, this.game.world.centerY - 20, 'player');
		game.physics.arcade.enable(this.player);
		this.player.body.gravity.y = 1400;
		this.player.body.setSize(30, 30, 5, 5);
		/**
		 * Define obstacle (group, sprite, spawn timer).
		 */
		this.obstacles = game.add.group();
		this.obstacles.enableBody = true;
		this.obstacles.createMultiple(15 , 'obstacle');
		this.spawnTimer = null;
		/**
		 * Define score label (score, text, increment timer).
		 */
		this.score = 0;
		this.labelScore = game.add.text(20, 20, "SCORE: 0", {font: "16px Arial", fill: "#ffffff"});
		this.scoreTimer = null;
		this.labelInstructions = game.add.text(20, 36, "PRESS SPACE TO JUMP / START", {font: "16px Arial", fill: "#ffffff"});
		/**
		 * Define controls.
		 */
		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.spaceKey.onDown.add(this.jump, this);
    },

	/**
	 * Update game state.
	 */
    update:	function() {
		if (!this.isReady) {
			this.player.body.enable = false;
			
			if (this.spaceKey.isDown) {
				this.isReady = true;
				this.player.body.enable = true;
				this.spawnTimer = game.time.events.loop(300, this.addObstacle, this);
				this.scoreTimer = game.time.events.loop(1000, this.addScore, this);
				this.labelScore.visible = true;
				this.labelInstructions.visible = false;
			}
		} else {				
				if (this.player.inWorld == false) {
					this.retry();
				}
		
			game.physics.arcade.overlap(this.player, this.obstacles, this.retry, null, this);
		}
    },
	
	jump: function() {
		this.player.body.velocity.y = -450;
	},
	
	retry: function() {
		game.state.start('main');
	},
	
	addObstacle: function() {
		var obstacle = this.obstacles.getFirstDead();
		
		obstacle.body.setSize(30, 30, 5, 5);
		
		obstacle.reset(this.game.world.width, (this.game.world.height - 40) * game.rnd.frac());
		
		obstacle.body.velocity.x = -400 * ( 1 + game.rnd.frac());
		
		obstacle.checkWorldBounds = true;
		obstacle.outOfBoundsKill = true;
	},
	
	addScore: function() {
		this.score += 1;
		this.labelScore.text = "SCORE: " + this.score;
	},
	
	render: function()
	{
		game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
	}
};

/**
 * Add mainState as main game state and starting point
 */
game.state.add('main', mainState);
game.state.start('main');