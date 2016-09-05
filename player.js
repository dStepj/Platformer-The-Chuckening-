var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_MAX = 6;

var MAX_LIVES = 3;

var sfxJump;
sfxJump = new Howl({
	urls: ["jump.mp3"],
	buffer: true,
	volume: 0.5,
});


var Player = function () 
{
	this.sprite = new Sprite("ChuckNorris.png");
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[0, 1, 2, 3, 4, 5, 6, 7]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[8, 9, 10, 11, 12]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[52, 53, 54, 55, 56, 57, 58, 59]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[60, 61, 62, 63, 64]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);

	for(var i=0; i<ANIM_MAX; i++)
	{
		this.sprite.setAnimationOffset(i, -55, -87);
	}


	//this.image = document.createElement("img");
	this.position = new Vector2();
	this.position.set( 9*TILE, 0*TILE );

	this.width = 159;
	this.height = 163;

	//this.offset = new Vector2();
	//this.offset.set(-55,-87);

	this.velocity = new Vector2();

	this.falling = true;
	this.jumping = false;

	this.direction = LEFT;
	this.lives = MAX_LIVES;

	//this.image.src = "hero.png";
};

Player.prototype.update = function (deltaTime)
{
	this.sprite.update(deltaTime);

	var left = false;
    var right = false;
    var jump = false;
    // check keypress events
	if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true)
	{
		left = true;
		this.direction = LEFT;
		if(this.sprite.currentAnimation != ANIM_WALK_LEFT && this.jumping == false)
			this.sprite.setAnimation(ANIM_WALK_LEFT);
	}
    
	else if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true)
	{
		right = true;
		this.direction = RIGHT;
		if(this.sprite.currentAnimation != ANIM_WALK_RIGHT && this.jumping == false)
			this.sprite.setAnimation(ANIM_WALK_RIGHT);
	}

	else {
		if(this.jumping == false && this.falling == false)
		{
			if(this.direction == LEFT)
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
				this.sprite.setAnimation(ANIM_IDLE_LEFT);
			}
			else
			{
				if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
				this.sprite.setAnimation(ANIM_IDLE_RIGHT);
			}
		}
	}
	if(keyboard.isKeyDown(keyboard.KEY_UP) == true)
	{
		jump = true;
		if(left == true)
		{
			this.sprite.setAnimation(ANIM_JUMP_LEFT);
		}
		if(right == true)
		{
			this.sprite.setAnimation(ANIM_JUMP_RIGHT);
		}
	if(this.cooldownTimer > 0)
	{
		this.cooldownTimer -= deltaTime;
	}
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true && this.cooldownTimer <= 0)
		{
		sfxFire.play();
		this.cooldownTimer = 0.3;
		//shoot a bullet.
			}
		}
	
	/*if (keyboard.isKeyDown(keyboard.KEY_LEFT) == true) 
	{
        left = true;
    }*/
    /*if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) 
	{
        right = true;
    }*/
    //if (keyboard.isKeyDown(keyboard.KEY_SPACE) == true) 
	//{
        //jump = true;
	//}
	var wasleft = this.velocity.x < 0;
	var wasright = this.velocity.x > 0;
	var falling = this.falling;

	var ddx = 0;
	var ddy = GRAVITY;

	if (left)
	{
		ddx = ddx -= ACCEL;
	}
	else if (wasleft)
	{
		ddx = ddx += FRICTION;
	}
	if (right)
	{
		ddx = ddx += ACCEL;
	}
	else if (wasright)
	{
		ddx = ddx -= FRICTION;
	}

	if (jump && !this.falling && !this.jumping) 
	{
		ddy = ddy - JUMP;         
		this.jumping = true;
		if(this.direction == LEFT)
			this.sprite.setAnimation(ANIM_JUMP_LEFT)
		else
			this.sprite.setAnimation(ANIM_JUMP_RIGHT)
	}

	// calculate the new position and velocity:
	this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
	this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);

    if ((wasleft && (this.velocity.x > 0)) ||
        (wasright && (this.velocity.x < 0))) 
	{
        this.velocity.x = 0;
    }

	// collision detection
	// Our collision detection logic is greatly simplified by the fact that the player is a rectangle
	// and is exactly the same size as a single tile. So we know that the player can only ever
	// occupy 1, 2 or 4 cells.
	// This means we can short-circuit and avoid building a general purpose collision detection
	// engine by simply looking at the 1 to 4 cells that the player occupies:
	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x) % TILE; // true if player overlaps right
	var ny = (this.position.y) % TILE; // true if player overlaps below
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
	var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

	//if the player has verticle velocity, then check to see if they have hit a platform below or above.
	//in which case, stop their verticle velocty, and clamp their y position.
	if (this.velocity.y > 0)
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx))
		{
			this.position.y = tileToPixel(ty);
			this.velocity.y = 0;
			this.falling = false;
			this.jumping = false;
			ny = 0;
		}
	}

else if (this.velocity.y < 0)
{
	if ((cell && !celldown) || (cellright && !celldiag && nx))
	{
		this.position.y = tileToPixel(ty + 1);
		this.velocity.y = 0;
		cell = celldown;
		cellright = celldiag;
		ny = 0;
	}
}

	if (this.velocity.x > 0)
	{
		if ((cellright && !cell) || (celldiag &&!celldown && ny))
		{
			this.position.x = tileToPixel(tx);
			this.velocity.x = 0;
		}
	}

	else if (this.velocity.x < 0)
	{
		if ((cell && !cellright) || (celldown && !celldiag && ny))
		{
			this.position.x = tileToPixel(tx +1);
			this.velocity.x = 0;
		}
	}

	if(this.position.y > 600)
	{
		this.lives -= 1;
		if(lives < 1)
		{
			console.log("Hey! How are you still alive?");
			state = LOSE;
		}
		else
		{
			this.position.set(this.reset.x, this.reset.y);
		}
	}

	if(this.position.x > 2000)
	{
		console.log("You've Won!");
		state = WIN;
	}
}

Player.prototype.draw = function () 
{
	this.sprite.draw(context,
	this.position.x - worldOffsetX,
	this.position.y);

	context.fillStyle = "000000";
	context.fillText("player y pos = : " + this.position.y.toString(), 5, 200, 100);
	context.fillText("player x pos = : " + this.position.x.toString(), 5, 180);

	/*context.save();
	context.translate(this.position.x, this.position.y);
	context.rotate(this.rotation);
	context.drawImage(this.image, -this.width / 2, -this.height / 2);
	context.restore();*/
}