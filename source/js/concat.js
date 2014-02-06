/*-----------------------------------------------------
	Base Drawable class

	All elements drawn on canvas inherit from it
-----------------------------------------------------*/

function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	};
	
	this.speed = 0; //speed and direction of the movement
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	// Define abstract function to be implemented in child objects
	this.draw = function() { };
	this.move = function() { };
}

/*-----------------------------------------------------
	Main Character element (the user)

	Can move, jump and shoot
-----------------------------------------------------*/
function MainCharacter() {
	
	this.speed = {x: 3, y: 8};
	
	this.bulletPool = new BulletPool(30);
	var fireRate = 15; //fire at least avery 15 frames
	var fireCounter = 0;

	var isJumping = false;
	var jumpFrames = 15; // up for 10 frames, down for 10 frames
	var jumpCounter = 0;

	this.init = function(x,y,w,h) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.alive = true;
		this.bulletPool.init("bullet");
		this.facingLeft = false; // shoot direction
	};

	this.draw = function() {
		this.context.drawImage(imgRepo.main, this.x, this.y);
	};

	this.move = function() {
		fireCounter++;

		// determine the action to perform based on the key pressed:
		// moving or jumping
		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.up || isJumping) {

			// it moved -> clear the rectangle
			this.context.clearRect(this.x, this.y, this.width, this.height);

			if (KEY_STATUS.left) {
				this.facingLeft = true;
				this.x -= this.speed.x;
				if (this.x <= 0) { // Kep player within the screen
					this.x = 0;
				}
			} else if (KEY_STATUS.right) {
				this.facingLeft = false;
				this.x += this.speed.x;
				if (this.x >= this.canvasWidth - this.width) {
					this.x = this.canvasWidth - this.width;
				}
			}

			if (KEY_STATUS.up && !isJumping) {
				isJumping = true;
			}
		}

		if (isJumping) {
			this.jump();
		}

		// the position may have changed, time to redraw
		this.draw();

		if (KEY_STATUS.space && fireCounter >= fireRate) {
			this.fire();
			fireCounter = 0;
		}
	};

	this.fire = function() {
		var bulletSpeed = this.facingLeft ? -5 : 5;
		this.bulletPool.shoot(this.x+6, this.y+6, bulletSpeed);

	};

	this.jump = function() {
		jumpCounter++;

		if (jumpCounter === jumpFrames) {
			this.speed.y = -this.speed.y;
		}
		if (jumpCounter === 2*jumpFrames) {
			this.speed.y = -this.speed.y;
			isJumping = false;
			jumpCounter = 0;
		}

		this.y -= this.speed.y;
		if (this.y > this.canvasHeight-10) {
			this.y = this.canvasHeight-10;
		}
	};
}
MainCharacter.prototype = new Drawable();


/*-----------------------------------------------------
	Bullet element

	Can be shot both from the main characters and
	from the enemies (depending on the object)
-----------------------------------------------------*/
function Bullet(object) {
	
	// Is true if the bullet is currently in use
	this.alive = false;
	
	// can be "bullet" or "enemyBullet"
	// (see Pool class)
	var typeOfBullet = object;

	// re-initialize a bullet and make it alive
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	// clear the rectangle around the bullet in the previous frame
	// draws the bullet in its new position
	// if the bullet goes off screen, return true --> the bullet
	// won't be drawn
	this.draw = function() {

		this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
		this.x += this.speed;
		
		//if (this.isColliding) {
		//return true;
		//} else
		if (this.x < 0 || this.x > this.canvasWidth-this.width) {
			return true;
		
		} else {
			if (typeOfBullet === "bullet") {
				this.context.drawImage(imgRepo.mainBullet, this.x, this.y);
			}
			else if (typeOfBullet === "enemyBullet") {
				this.context.drawImage(imgRepo.enemyBullet, this.x, this.y);
			}
			
			return false;
		}
	};
	
	// resets all the values and make the bullet not alive
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		// this.isColliding = false;
	};
}
Bullet.prototype = new Drawable();/*-----------------------------------------------------
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

			Bullet.prototype.context = this.enemiesContext;
			Bullet.prototype.canvasWidth = this.enemiesCanvas.width;
			Bullet.prototype.canvasHeight = this.enemiesCanvas.height;

			this.mainCharacter = new MainCharacter();
			this.mainCharacter.init(
				10,
				this.mainCanvas.height-imgRepo.main.height,
				imgRepo.main.width,
				imgRepo.main.height
			);

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
	// eventuallt draw the bullet fired by the main char.
	game.mainCharacter.bulletPool.animate();
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
})();/*-----------------------------------------------------
	Images Library

	The game can start only when all the images
	are loaded
-----------------------------------------------------*/
function ImgRepo() {

	var numLoaded = 0;
	var numImages = 0;

	function createImage () {
		numImages++;
		return new Image();
	}

	function onImageLoad () {

		numLoaded++;
		// initialize the environment only when all the images are loaded
		if (numLoaded === numImages){
			console.log("all images loaded");
			window.init();
		}
	}

	this.mainBullet = createImage();
	this.enemyBullet = createImage();
	this.main = createImage();
	this.enemy_1 = createImage();
	this.enemy_2 = createImage();

	this.mainBullet.onload = function() { onImageLoad(); };
	this.enemyBullet.onload = function() { onImageLoad(); };
	this.main.onload = function() { onImageLoad(); };
	this.enemy_1.onload = function() { onImageLoad(); };
	this.enemy_2.onload = function() { onImageLoad(); };

	this.mainBullet.src = "./img/bullet_main.png";
	this.enemyBullet.src = "./img/bullet_enemy.png";
	this.main.src = "./img/main.png";
	this.enemy_1.src = "./img/enemy_1.png";
	this.enemy_2.src = "./img/enemy_2.png";

}// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right'
};

// Creates the array to hold the KEY_CODES and sets all their values
// to true. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (var code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
	// Firefox and opera use charCode instead of keyCode to
	// return which key was pressed.
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
		e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
};
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
};function BulletPool(maxSize) {

	// Max bullets allowed in the pool
	var size = maxSize;
	// The alive elements are always in the first position of the array
	var pool = [];
	
	// returns only the alive objects
	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	};
	
	// populate the pool with the selected type of bullet
	this.init = function(object) {

		if (object!=="bullet" && object!== "enemyBullet") {
			return;
		}

		var bullet, i;

		if (object === "bullet") {
			for (i = 0; i < size; i++) {
				// Initalize the object
				bullet = new Bullet("bullet");
				bullet.init(0, 0, imgRepo.mainBullet.width, imgRepo.mainBullet.height);
				// bullet.collidableWith = "enemy";
				// bullet.type = "bullet";
				pool[i] = bullet;
			}
		} else if (object === "enemyBullet") {
			for (i = 0; i < size; i++) {
				bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imgRepo.enemyBullet.width, imgRepo.enemyBullet.height);
				// bullet.collidableWith = "ship";
				// bullet.type = "enemyBullet";
				pool[i] = bullet;
			}
		}
	};
	
	// makes an unused element alive,
	// and moves it in the beginning of the array
	this.shoot = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	
	// draw alive bullets, and clean them if they go off screen
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// stop drawing at the first non-alive bullet
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			
			} else {
				break;
			}
		}
	};
}