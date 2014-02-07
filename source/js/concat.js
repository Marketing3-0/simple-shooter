function collisionDetection() {

	var i;
	var playerCanGoDown = 0;

	// check the obstacles:
	for (i=0; i<game.obstacles.length; i++) {
		if (intersection(game.player, game.obstacles[i])) {

			//game.player.context.clearRect(
			//	game.player.x,
			//	game.player.y,
			//	game.player.width,
			//	game.player.height
			//);
			touchingObstacle(game.player, game.obstacles[i]);

		} else {

			if (game.player.x > game.obstacles[i].x + game.obstacles[i].width ||
				game.player.x + game.player.width < game.obstacles[i].x) {
				
				playerCanGoDown++;
			}
		}
	}

	// the player changes is no more touching the top of an obstacle,

	if (playerCanGoDown === game.obstacles.length) {
		if (game.player.floorHeight !== game.player.canvasHeight) {
			game.player.speed.y = 5;
			game.player.floorHeight = game.player.canvasHeight;
		}
	}


}

function intersection(rectA, rectB) {
	return !(
		rectA.x + rectA.width < rectB.x		||
		rectB.x + rectB.width < rectA.x		||
		rectA.y + rectA.height < rectB.y	||
		rectB.y + rectB.height < rectA.y
	);
}

// what happend when something touched an obstacle
function touchingObstacle(entity, obstacle) {

	// if a player or an enemy, it can't go farther
	if (entity.type === DRAWABLE_TYPES.player ||
		entity.type === DRAWABLE_TYPES.enemy) {

		
		if (entity.previousPosition.y + entity.height < obstacle.y) {

			//entity above the obstacle

			if (entity.type === DRAWABLE_TYPES.player) {
				entity.floorHeight = obstacle.y-1;
				entity.speed.y = 0;
				entity.isTouchingTheFloor = true;
			}

		} else if (entity.previousPosition.y + entity.height >= obstacle.y) {
	
			//entity on one side (left/right) of the obstacle

			if (entity.x + entity.width + entity.speed.x >= obstacle.x &&
				entity.x + entity.width + entity.speed.x < obstacle.x + obstacle.width) {

				// entity to the left of the obstacle
				entity.x = obstacle.x - entity.width - entity.speed.x;

			} else if (entity.x < obstacle.x + obstacle.width + entity.speed.x) {

				// entity to the right of the obstacle
				entity.x = obstacle.x + obstacle.width + entity.speed.x;
			}
		
		}
	}
}var DRAWABLE_TYPES = {
	drawable:"drawable",
	obstacle:"obstacle",
	player: "player",
	enemy: "enemy",
	bullet: "bullet",
	enemyBullet: "enemyBullet"
};


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
		this.previousPosition = {x: this.x, y:this.y};
	};
	
	this.type = DRAWABLE_TYPES.drawable;
	this.speed = 0; //speed and direction of the movement
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	// Define abstract function to be implemented in child objects
	this.draw = function() { };
	this.move = function() { };
}

/*-----------------------------------------------------
	Player element (the user)

	Can move, jump and shoot
-----------------------------------------------------*/
function Player() {

	this.type = DRAWABLE_TYPES.player;
	
	this.speed = {x: 3, y: 5};
	
	this.bulletPool = new BulletPool(30);
	var fireRate = 15; //fire at least every 15 frames
	var fireCounter = 0;


	this.isTouchingTheFloor = false;

	this.floorHeight = null;

	this.isJumping = false;
	var jumpFrames = 15; // up for 10 frames, down for 10 frames
	var jumpCounter = 0;

	this.init = function(x,y,w,h) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.alive = true;
		this.bulletPool.init(DRAWABLE_TYPES.bullet);
		this.facingLeft = false; // shoot direction
	};

	this.draw = function() {
		this.context.drawImage(imgRepo.main, this.x, this.y);
	};

	this.move = function() {
		fireCounter++;
		this.previousPosition = {x: this.x, y:this.y};

		// clear the rect around the player
		var clearPadding = 50;
		this.context.clearRect(this.x-clearPadding, this.y-clearPadding, this.width+(2*clearPadding), this.height+(2*clearPadding));

		// check 
		if (!this.floorHeight) {
			this.floorHeight = this.canvasHeight;
		}
		if (this.y + this.height > this.floorHeight) {
			this.y = this.floorHeight - this.height;
			this.isTouchingTheFloor = true;
			this.speed.y = 0;
		}

		this.y += this.speed.y;

		// determine the action to perform based on the key pressed:
		// moving or jumping
		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.up || this.isJumping) {

			// it moved -> clear the rectangle

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


			if (KEY_STATUS.up && this.isTouchingTheFloor) {

				this.speed.y = -5;
				this.y += this.speed.y;
				this.isJumping = true;
				this.isTouchingTheFloor = false;
			}
		}

		if (this.isJumping) {
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
		var bulletStartingX = this.facingLeft ? this.x-imgRepo.mainBullet.width : this.x+this.width;
		this.bulletPool.shoot(bulletStartingX, this.y+6, bulletSpeed);

	};

	// jump up for jumpFrames frames and then fall fown until
	// it reaches a limit (the ground)
	this.jump = function() {

		jumpCounter++;

		if (jumpCounter === jumpFrames) {
			this.speed.y = -this.speed.y;
			this.isJumping = false;
			jumpCounter = 0;
		}
	};
}
Player.prototype = new Drawable();


/*-----------------------------------------------------
	Enemy (abstract class)

	The behaviour (movement patter, ability to fire)
	is defined in the subclasses
-----------------------------------------------------*/
function Enemy() {

	this.type = DRAWABLE_TYPES.enemy;

	// initialize enemy
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.alive = true;

		this.facingLeft = false; // shoot direction

	};

	// draw enemy on screen
	this.draw = function() {

		// clear the previous frame pixels
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		
		this.x += this.speed.x;
		this.y += this.speed.y;

		//MOVEMENT LOGIC
		this.calculateBehaviour();
		
		//if (!this.isColliding) {
			this.context.drawImage(
				this.image(),
				this.x,
				this.y
			);
			
			return false;
		//} else {
		//game.playerScore += 10;
		//game.explosion.get();
		//return true;
		//}
	};

	// the bullet is normally fired at the top px of the enemy
	this.bulletHeight = function() {
		return this.y;
	};

	// shoots a bullet
	this.fire = function() {
		var bulletSpeed = this.facingLeft ? -4 : 4;
		var bulletStartingX = this.facingLeft ? this.x-imgRepo.enemyBullet.width : this.x+this.width;
		game.enemyBulletPool.shoot(bulletStartingX, this.bulletHeight(), bulletSpeed);
	};

	// to be overridden
	this.calculateBehaviour = function() { };
	this.image = function() { };
}
Enemy.prototype = new Drawable();

/*-----------------------------------------------------
	Enemy, first type

	Moves left/right
-----------------------------------------------------*/
function Enemy_A() {

	this.limit = null;
	this.speed = {x:1, y:0};

	// this enemy fires the bulet at a different height
	this.bulletHeight = function() {
		return this.y+this.height/2;
	};
	
	this.image = function() {
		return imgRepo.enemy_1;
	};

	this.calculateBehaviour = function () {

		// initialize the limit the first time
		// befor it is impossible (x and y are not initialized)
		if (!this.limit) {
			this.limit = {
				left: this.x - 45,
				right: this.x + 45,
			};
		}

		// change direction when it reaches its left/right limit
		if (this.x <= this.limit.left) {
			this.fire();
			this.facingLeft = false;
			this.speed.x = -this.speed.x;
		}
		else if (this.x >= this.limit.right + this.width) {
			this.fire();
			this.facingLeft = true;
			this.speed.x = -this.speed.x;
		}
	};
}
Enemy_A.prototype = new Enemy();

/*-----------------------------------------------------
	Enemy, second type

	Moves up/down
-----------------------------------------------------*/
function Enemy_B() {
	this.speed = {x:0, y:1};
	this.limit = null;

	this.image = function() {
		return imgRepo.enemy_2;
	};

	this.calculateBehaviour = function () {

		// initialize the limit the first time
		// befor it is impossible (x and y are not initialized)
		if (!this.limit) {
			this.limit = {
				up: this.y - this.height,
				down: this.y + this.height
			};
		}
		// change direction when it reaches its up/down limit
		if (this.y <= this.limit.up) {
			//when it touches the upper limit, switch left/right and fire
			this.facingLeft = !this.facingLeft;
			this.speed.y = -this.speed.y;
			this.fire();
		}
		else if (this.y >= this.limit.down) {
			this.speed.y = -this.speed.y;
		}
	};
}
Enemy_B.prototype = new Enemy();


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
	this.type = object;

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
			if (this.type === DRAWABLE_TYPES.bullet) {
				this.context.drawImage(imgRepo.mainBullet, this.x, this.y);
			}
			else if (this.type === DRAWABLE_TYPES.enemyBullet) {
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
Bullet.prototype = new Drawable();

/*-----------------------------------------------------
	Obstacle element (abstract)
-----------------------------------------------------*/
function Obstacle(object) {

	this.type = DRAWABLE_TYPES.obstacle;
	
	// drawn only once, at creation time
	this.draw = function() {
		this.context.drawImage(this.image(), this.x, this.y);
	};

	//to be overridden
	this.image = function() { };
}
Obstacle.prototype = new Drawable();

/*-----------------------------------------------------
	Obstacle type A
-----------------------------------------------------*/
function Obstacle_A(object) {
	this.image = function() {
		return imgRepo.obstacle_1;
	};
}
Obstacle_A.prototype = new Obstacle();

/*-----------------------------------------------------
	Obstacle type B
-----------------------------------------------------*/
function Obstacle_B(object) {
	this.image = function() {
		return imgRepo.obstacle_2;
	};
}
Obstacle_B.prototype = new Obstacle();/*-----------------------------------------------------
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

			Player.prototype.context = this.mainContext;
			Player.prototype.canvasWidth = this.mainCanvas.width;
			Player.prototype.canvasHeight = this.mainCanvas.height;

			Enemy_A.prototype.context = this.enemiesContext;
			Enemy_A.prototype.canvasWidth = this.enemiesCanvas.width;
			Enemy_A.prototype.canvasHeight = this.enemiesCanvas.height;

			Enemy_B.prototype.context = this.enemiesContext;
			Enemy_B.prototype.canvasWidth = this.enemiesCanvas.width;
			Enemy_B.prototype.canvasHeight = this.enemiesCanvas.height;

			Bullet.prototype.context = this.enemiesContext;
			Bullet.prototype.canvasWidth = this.enemiesCanvas.width;
			Bullet.prototype.canvasHeight = this.enemiesCanvas.height;

			Obstacle_A.prototype.context = this.obstaclesContext;
			Obstacle_A.prototype.canvasWidth = this.obstaclesCanvas.width;
			Obstacle_A.prototype.canvasHeight = this.obstaclesCanvas.height;

			Obstacle_B.prototype.context = this.obstaclesContext;
			Obstacle_B.prototype.canvasWidth = this.obstaclesCanvas.width;
			Obstacle_B.prototype.canvasHeight = this.obstaclesCanvas.height;

			// create player
			this.player = new Player();
			this.player.init(
				10,
				this.mainCanvas.height-imgRepo.main.height-200,
				imgRepo.main.width,
				imgRepo.main.height
			);

			// create enemy_1
			this.enemies = [];

			this.enemies[0] = new Enemy_A();
			this.enemies[0].init(
				150,
				this.enemiesCanvas.height-imgRepo.enemy_1.height,
				imgRepo.enemy_1.width,
				imgRepo.enemy_1.height
			);
			this.enemies[1] = new Enemy_A();
			this.enemies[1].init(
				370,
				this.enemiesCanvas.height-imgRepo.enemy_1.height,
				imgRepo.enemy_1.width,
				imgRepo.enemy_1.height
			);
			this.enemies[2] = new Enemy_B();
			this.enemies[2].init(
				600,
				this.enemiesCanvas.height-10,
				imgRepo.enemy_2.width,
				imgRepo.enemy_2.height
			);

			// create pool of bullets for the enemies
			// (the bullets remain on screen even if
			// enemies get killed)
			this.enemyBulletPool = new BulletPool(40);
			this.enemyBulletPool.init(DRAWABLE_TYPES.enemyBullet);

			// create obstacles
			this.obstacles = [];

			this.obstacles[0] = new Obstacle_A();
			this.obstacles[0].init(
				80,
				this.obstaclesCanvas.height - imgRepo.obstacle_1.height,
				imgRepo.obstacle_1.width,
				imgRepo.obstacle_1.height
			);

			this.obstacles[1] = new Obstacle_A();
			this.obstacles[1].init(
				300,
				this.obstaclesCanvas.height - imgRepo.obstacle_1.height,
				imgRepo.obstacle_1.width,
				imgRepo.obstacle_1.height
			);

			this.obstacles[2] = new Obstacle_B();
			this.obstacles[2].init(
				this.obstaclesCanvas.width - imgRepo.obstacle_2.width,
				this.obstaclesCanvas.height - imgRepo.obstacle_2.height,
				imgRepo.obstacle_2.width,
				imgRepo.obstacle_2.height
			);

			return true;

		} else {
			return false;
		}

	};

	this.start = function() {
		console.log("START");
		this.player.draw();
		for (var i=0; i<game.obstacles.length; i++) {
			game.obstacles[i].draw();
		}
		//start animation loop
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
	game.player.move();
	// eventually draw the bullets fired by the main char.
	game.player.bulletPool.animate();

	// move enemies
	for (var i=0; i<game.enemies.length; i++) {
		game.enemies[i].draw();
	}

	// eventually draw the bullets fired by the enemies
	game.enemyBulletPool.animate();

	collisionDetection();
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
	this.obstacle_1 = createImage();
	this.obstacle_2 = createImage();

	this.mainBullet.onload = function() { onImageLoad(); };
	this.enemyBullet.onload = function() { onImageLoad(); };
	this.main.onload = function() { onImageLoad(); };
	this.enemy_1.onload = function() { onImageLoad(); };
	this.enemy_2.onload = function() { onImageLoad(); };
	this.obstacle_1.onload = function() { onImageLoad(); };
	this.obstacle_2.onload = function() { onImageLoad(); };

	this.mainBullet.src = "./img/bullet_main.png";
	this.enemyBullet.src = "./img/bullet_enemy.png";
	this.main.src = "./img/main.png";
	this.enemy_1.src = "./img/enemy_1.png";
	this.enemy_2.src = "./img/enemy_2.png";
	this.obstacle_1.src = "./img/obstacle_1.png";
	this.obstacle_2.src = "./img/obstacle_2.png";

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