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
		 * Set up variable for tracking fps. Minimum fps
		 * is set to default game frame rate and changed
		 * in render function when compared to current fps.
		 */
		this.fpsMin = 60;
		this.fpsAvg = 0;
		this.fpsCount = 0;
		this.fpsSum = 0;
		this.fpsSqrSum = 0;
		this.fpsVar;
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
		this.spawnTimer = game.time.create(false);
		this.spawnTimer.loop(300, this.addObstacle, this);
		/**
		 * Define score label (score, text, increment timer).
		 */
		this.score = 0;
		this.labelScore = game.add.text(20, 20, "SCORE: 0", {font: "16px Arial", fill: "#ffffff"});
		this.scoreTimer = game.time.create(false);
		this.scoreTimer.loop(1000, this.addScore, this);
		/**
		 * Define instructions label.
		 */
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
		/**
		 * If the player isn't ready, wait for input before
		 * displaying / enabling game elements.
		 */
		if (!this.isReady) {
			this.player.body.enable = false;
			
			if (this.spaceKey.isDown) {
				this.isReady = true;
				this.player.body.enable = true;
				this.spawnTimer.start();
				this.scoreTimer.start();
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
	
	/**
	 * Function handling player's jump.
	 */
	jump: function() {
		this.player.body.velocity.y = -450;
	},
	
	/**
	 * Function handling game retry.
	 */	 
	retry: function() {
		this.spawnTimer.stop();
		this.scoreTimer.stop();
		
		/**
		 * Conditional on line 93
		 * (if (this.player.inWorld == false))
		 * makes moving the player sprite out of world bounds
		 * a requirement in order to retry the game.
		 *
		 * Variables enableBody, velocity.y and gravity.y do
		 * not need to be changed, they're there to mimic
		 * original behaviour.
		 * 
		 * A refactor will be necessary in order to achieve
		 * higher similarity to original.
		 */		
		this.player.x = -50;
		this.player.enableBody = false;
		this.player.body.velocity.y = 0;
		this.player.body.gravity.y = 0;
	
		this.spaceKey.enabled = false;
		
		if (this.obstacles.countLiving() == 0) {
			this.labelInstructions.text = "PRESS SPACE TO RESTART";
			this.labelInstructions.visible = true;
			
			this.spaceKey.enabled = true;
			
			if (this.spaceKey.isDown) {
				game.state.start('main');
			}
		}
	},
	
	/**
	 * Function adding obstacles.
	 */
	addObstacle: function() {
		var obstacle = this.obstacles.getFirstDead();
		
		obstacle.body.setSize(30, 30, 5, 5);
		
		obstacle.reset(this.game.world.width, (this.game.world.height - 40) * game.rnd.frac());
		
		obstacle.body.velocity.x = -400 * ( 1 + game.rnd.frac());
		
		obstacle.checkWorldBounds = true;
		obstacle.outOfBoundsKill = true;
	},
	
	/**
	 * Function tracking and displaying score.
	 */
	addScore: function() {
		this.score += 1;
		this.labelScore.text = "SCORE: " + this.score;
	},
	
	/**
	 * Function handling rendering. Usually not overriden,
	 * but necessary to display debug text (e.g. fps).
	 */
	render: function()
	{
		/**
		 * Every time the game is rendered, the current
		 * fps value is recorded - so increase the counter.
		 */
		this.fpsCount += 1;
		this.fpsSum += game.time.fps;
		this.fpsSqrSum += (game.time.fps * game.time.fps);
		/**
		 * Set the minimum fps, but do not evaluate 0 fps.
		 */
		if ((game.time.fps > 0) && (this.fpsMin > game.time.fps)) {
			this.fpsMin = game.time.fps;			
		}
		/**
		 * Calculate incremental average fps.
		 */
		this.fpsAvg = Math.round((this.fpsAvg + (game.time.fps - this.fpsAvg)/this.fpsCount ) * 100) / 100;
		
		this.fpsVar = Math.round((1 / this.fpsCount) * (this.fpsSqrSum - ((this.fpsSum * this.fpsSum) / this.fpsCount)) * 100) / 100;
		
		/**
		 * Display FPS counter (current, min, max, average).
		 */
		game.debug.text('FPS: ' + game.time.fps + ' \tMIN: ' + this.fpsMin + ' \tMAX: ' + game.time.fpsMax + ' \tAVG: ' + this.fpsAvg + ' \tVAR: ' + this.fpsVar, 2, 14, "#00ff00");
	}
};

/**
 * Add mainState as main game state and starting point.
 */
game.state.add('main', mainState);
game.state.start('main');