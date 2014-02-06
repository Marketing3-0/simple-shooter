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
	
	this.speed = {x: 3, y: 5};
	
	this.bulletPool = new BulletPool(30);
	var fireRate = 15; //fire at least every 15 frames
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
		var bulletStartingX = this.facingLeft ? this.x-imgRepo.mainBullet.width : this.x+this.width;
		this.bulletPool.shoot(bulletStartingX, this.y+6, bulletSpeed);

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
	Enemy, first type

	Moves left and right and shoots
-----------------------------------------------------*/
function Enemy_1() {
	
	var fireRate = 120; //fire at least every 15 frames
	var fireCounter = 0;
	// this.collidableWith = "bullet";
	// this.type = "enemy";
	
	// initialize enemy
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = {x:2, y:0};

		this.alive = true;

		this.facingLeft = false; // shoot direction

		this.limit = {
			left: this.x - 45,
			right: this.x + 45
		};
	};

	// the enemy constantly moves
	this.draw = function() {

		fireCounter = fireCounter + Math.floor(Math.random()*5);

		// clear the previous frame pixels
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		
		this.x += this.speed.x;
		this.y += this.speed.y;

		// change direction when it reaches its left/right limit
		if (this.x <= this.limit.left) {
			this.facingLeft = false;
			this.speed.x = -this.speed.x;
		}
		else if (this.x >= this.limit.right + this.width) {
			this.facingLeft = true;
			this.speed.x = -this.speed.x;
		}
		
		//if (!this.isColliding) {
			this.context.drawImage(imgRepo.enemy_1, this.x, this.y);
		
			
			if (fireCounter >= fireRate) {
				fireCounter = 0;
				this.fire();
			}
			
			return false;
		//} else {
		//game.playerScore += 10;
		//game.explosion.get();
		//return true;
		//}
	};
	
	// shoots a bullet
	this.fire = function() {
		var bulletSpeed = this.facingLeft ? -4 : 4;
		var bulletStartingX = this.facingLeft ? this.x-imgRepo.enemyBullet.width : this.x+this.width;
		game.enemyBulletPool.shoot(bulletStartingX, this.y+this.height/2, bulletSpeed);

	};
}
Enemy_1.prototype = new Drawable();

/*-----------------------------------------------------
	Enemy, second type

	Moves left and right and shoots
-----------------------------------------------------*/
function Enemy_2() {
	
	// this.collidableWith = "bullet";
	// this.type = "enemy";
	
	// initialize enemy
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = {x:0, y:1};

		this.alive = true;

		this.facingLeft = false; // shoot direction

		this.limit = {
			up: this.y - this.height*0.5,
			down: this.y + this.height*0.5
		};
	};

	// the enemy constantly moves
	this.draw = function() {

		// clear the previous frame pixels
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		
		this.x += this.speed.x;
		this.y += this.speed.y;

		// change direction when it reaches its up/down limit
		if (this.y <= this.limit.up) {
			//when it touches the upper limit, switch left/right and fire
			this.facingLeft = !this.facingLeft;
			this.speed.y = -this.speed.y;
			this.fire();
		}
		else if (this.y >= this.limit.down + this.height) {
			this.speed.y = -this.speed.y;
		}
		
		//if (!this.isColliding) {
			this.context.drawImage(imgRepo.enemy_2, this.x, this.y);
			
			return false;
		//} else {
		//game.playerScore += 10;
		//game.explosion.get();
		//return true;
		//}
	};
	
	// shoots a bullet
	this.fire = function() {
		var bulletSpeed = this.facingLeft ? -4 : 4;
		var bulletStartingX = this.facingLeft ? this.x-imgRepo.enemyBullet.width : this.x+this.width;
		game.enemyBulletPool.shoot(bulletStartingX, this.y+this.height/2, bulletSpeed);

	};
}
Enemy_1.prototype = new Drawable();


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
Bullet.prototype = new Drawable();