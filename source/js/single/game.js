/*-----------------------------------------------------
	STARTING THE GAME.

	create the image repository: when all the images
	are loaded, the init() function will be called
	and if the browser supports the canvas, game.init()
	will return true and the game (with the animations)
	will start.
-----------------------------------------------------*/

var game = new Game();
var imgRepo = new ImgRepo();
 
function init() {
	if (game.init()) {
		game.start();
	}
}

/*-----------------------------------------------------
	Game class

	Starts the game, initialises all the objects
-----------------------------------------------------*/
function Game() {

	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('bg');
		this.enemiesCanvas = document.getElementById('enemies');
		this.mainCanvas = document.getElementById('main');
		this.obstaclesCanvas = document.getElementById('obstacles');

		// run game only if canvas is supported
		if (this.bgCanvas.getContext) {

			this.bgContext = this.bgCanvas.getContext("2d");
			this.enemiesContext = this.enemiesCanvas.getContext("2d");
			this.mainContext = this.mainCanvas.getContext("2d");
			this.obstaclesContext = this.obstaclesCanvas.getContext("2d");

			MainCharacter.prototype.context = this.mainContext;
			MainCharacter.prototype.canvasWidth = this.mainCanvas.width;
			MainCharacter.prototype.canvasHeight = this.mainCanvas.height;

			Enemy_1.prototype.context = this.enemiesContext;
			Enemy_1.prototype.canvasWidth = this.enemiesCanvas.width;
			Enemy_1.prototype.canvasHeight = this.enemiesCanvas.height;

			Enemy_2.prototype.context = this.enemiesContext;
			Enemy_2.prototype.canvasWidth = this.enemiesCanvas.width;
			Enemy_2.prototype.canvasHeight = this.enemiesCanvas.height;

			Bullet.prototype.context = this.enemiesContext;
			Bullet.prototype.canvasWidth = this.enemiesCanvas.width;
			Bullet.prototype.canvasHeight = this.enemiesCanvas.height;

			// create main character
			this.mainCharacter = new MainCharacter();
			this.mainCharacter.init(
				10,
				this.mainCanvas.height-imgRepo.main.height,
				imgRepo.main.width,
				imgRepo.main.height
			);

			// create enemy_1
			this.firstEnemy = new Enemy_1();
			this.firstEnemy.init(
				200,
				this.enemiesCanvas.height-imgRepo.enemy_1.height,
				imgRepo.enemy_1.width,
				imgRepo.enemy_1.height
			);
			this.secondEnemy = new Enemy_1();
			this.secondEnemy.init(
				400,
				this.enemiesCanvas.height-imgRepo.enemy_1.height,
				imgRepo.enemy_1.width,
				imgRepo.enemy_1.height
			);
			this.thirdEnemy = new Enemy_2();
			this.thirdEnemy.init(
				600,
				300,//this.enemiesCanvas.height-imgRepo.enemy_1.height,
				imgRepo.enemy_2.width,
				imgRepo.enemy_2.height
			);

			// create pool of bullets for the enemies
			// (the bullets remain on screen even if
			// enemies get killed)
			this.enemyBulletPool = new BulletPool(40);
			this.enemyBulletPool.init("enemyBullet");

			return true;

		} else {
			return false;
		}

	};

	this.start = function() {
		console.log("START");
		this.mainCharacter.draw();
		animate();
	};
}

/*-----------------------------------------------------
	Animation Loop
-----------------------------------------------------*/

function animate () {
	// recursively call this method for
	// the next available frame
	requestAnimFrame( animate );

	// react to keys pressed and draw the main character
	game.mainCharacter.move();
	// eventually draw the bullets fired by the main char.
	game.mainCharacter.bulletPool.animate();

	// move enemies
	game.firstEnemy.draw();
	game.secondEnemy.draw();
	game.thirdEnemy.draw();

	// eventually draw the bullets fired by the enemies
	game.enemyBulletPool.animate();
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();