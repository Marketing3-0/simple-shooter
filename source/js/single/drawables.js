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
	Character element

	All elements drawn on canvas inherit from it
-----------------------------------------------------*/
function MainCharacter() {
	
	this.speed = {x: 3, y: 8};
	
	// this.bulletPool = new Pool(30);
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
		// this.bulletPool.init("bullet");
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
				this.x -= this.speed.x;
				if (this.x <= 0) { // Kep player within the screen
					this.x = 0;
				}
			} else if (KEY_STATUS.right) {
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
		//this.bulletPool.getTwo(this.x+6, this.y, 3, this.x+33, this.y, 3);
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