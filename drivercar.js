class DriverCar {
	constructor(game, x, y, direction) {
		// Constants
		this.WIDTH = 70;
		this.HEIGHT = PARAMS.GRID_WIDTH;
		this.BB_WIDTH = 60;
		this.BB_HEIGHT = 36;
		
		this.ACCELERATION = 0.5;
		this.REVERSE = this.ACCELERATION / 2;
		this.MAX_SPEED = 15;
		this.MAX_REVERSE = this.MAX_SPEED / 2;
		this.TURN_SPEED = 4;
		this.DRIFT_TURN_SPEED = this.TURN_SPEED * (1);
		this.DRAG = 0.5;
		this.TURN_DRAG = this.ACCELERATION + 0.1;
		this.BRAKE_DRAG = this.DRAG / 2;
		this.LOG_LENGTH = 10;
		this.PUSH_DRAG = this.DRAG * 2;
		this.MAX_SPIN_SPEED = this.TURN_SPEED * 2;
		this.SPIN_DRAG = this.DRAG * 5;

		// Assign Object Variables
		Object.assign(this, { game, x, y });
		this.direction = direction; // 0 - 359, with 0 = right facing
		this.directionLog = [];
		this.currentSpeed = 0;
		this.driftFlag = false;
		this.driftSpeed = this.currentSpeed;
		this.driftDirection = this.direction;
		this.burnoutFlag = false;
		this.active = false;
		this.enterFlag = false;
		this.spinSpeed = 0;
		this.pushSpeed = 0;
		this.pushDirection = this.direction;
		
		this.spritesheet = ASSET_MANAGER.getAsset("./assets/drivercar.png");
		
		// Initialize bounding box
		this.updateBB();
		
		// Animations
		this.driving = new AngleAnimator(this.spritesheet, 426, 0,
			this.WIDTH, this.HEIGHT, 1, 1, 1, this.direction, false, true);		// Driving
		this.entering = new AngleAnimator(this.spritesheet, 0, 0,
			this.WIDTH, this.HEIGHT, 7, 0.05, 1, this.direction, false, false);	// Enter
		this.exiting = new AngleAnimator(this.spritesheet, 426, 0,
			this.WIDTH, this.HEIGHT, 7, 0.5, 1, this.direction, true, false);	// Exit
		this.idling = new AngleAnimator(this.spritesheet, 0, 0,
			this.WIDTH, this.HEIGHT, 1, 1, 1, this.direction, false, true);		// idle
		this.braking = new AngleAnimator(this.spritesheet, 0, this.HEIGHT,
			this.WIDTH, this.HEIGHT, 1, 1, 1, this.direction, false, true);		// brakes
			
		this.flame = new AngleAnimator(ASSET_MANAGER.getAsset("./assets/exhaustflame.png"), 0, 0,
			210, 210, 5, 0.1, 0, (this.direction + 180) % 360, false, true);	// Exhaust Flame
	};
	
	updateBB(){
		this.BB = new AngleBoundingBox(this.x, this.y, this.BB_WIDTH, this.BB_HEIGHT, this.direction);
	}
	
	update() {
		var that = this;
		
		if (this.active) {
			// Affirm focus
			this.game.player = this;
			
			// Drifting
			if (!this.driftFlag && this.game.space) {			// Initiate Drift
				this.driftFlag = true;
				this.driftSpeed = this.currentSpeed;
				this.driftDirection = this.direction;
			} else if (this.driftFlag && !this.game.space) {	// End Drift
				if (this.game.forward && (Math.abs(this.driftDirection - this.direction) > 45)) {
					this.currentSpeed += this.driftSpeed;
				}
				this.driftDirection = this.direction;
				this.driftFlag = false;
			}
			
			// Turning
			let difference = 0;	// Log direction for reference in direction correction
			if (this.directionLog.length > this.LOG_LENGTH) difference = (this.directionLog.shift() - this.direction);
			if (difference > 180) difference -= 360;
			if (difference < -180) difference += 360;
			this.directionLog.push(this.direction);
			
			if (this.game.left && !this.game.right) {									// Turning Left
				if (this.driftFlag) {
					this.direction -= this.DRIFT_TURN_SPEED * (this.driftSpeed / this.MAX_SPEED);
				} else {
					this.direction -= this.TURN_SPEED * (this.currentSpeed / this.MAX_SPEED);
					if (this.currentSpeed > (this.MAX_SPEED * (3 / 4))) this.currentSpeed -= this.DRAG;
				}
			} else if (!this.game.left && this.game.right) {							// Turning Right
				if (this.driftFlag) {
					this.direction += this.DRIFT_TURN_SPEED * (this.driftSpeed / this.MAX_SPEED);
				} else {
					this.direction += this.TURN_SPEED * (this.currentSpeed / this.MAX_SPEED);
					if (this.currentSpeed > (this.MAX_SPEED * (3 / 4))) this.currentSpeed -= this.DRAG;
				}
			} else {																	// Direction correction to roads TODO only when on road
				if ((this.direction % 90) <= this.TURN_SPEED)  this.direction -= (this.direction % 90);
				if (90 - (this.direction % 90) <= this.TURN_SPEED)  this.direction += 90 - (this.direction % 90);
				if (this.currentSpeed > 0 && (difference > 0) && (this.direction % 90) < 30) {
					this.direction -= this.TURN_SPEED * (this.currentSpeed / this.MAX_SPEED);
				}
				if (this.currentSpeed > 0 && (difference < 0) && 90 - (this.direction % 90) < 30) {
					this.direction += this.TURN_SPEED * (this.currentSpeed / this.MAX_SPEED);
				}
			}
			
			// Normalize to range integers 0-359
			this.direction = (Math.floor(this.direction) % 360 + 360) % 360;
			
			// Acceleration/Deceleration
			if (this.game.space) {									// Brakes
				if (this.currentSpeed > 0) {
					this.currentSpeed -= this.ACCELERATION;
				} else if (this.currentSpeed < 0) {
					this.currentSpeed +=  this.ACCELERATION;
				}
				if (this.driftSpeed >= this.DRAG){					// Drifting
					this.driftSpeed -= this.DRAG;
				} else if (this.driftSpeed <= -this.DRAG){
					this.driftSpeed += this.DRAG;
				} else {
					this.driftSpeed = 0;
				}
			} else if (this.game.forward && !this.game.backward) {	// Accelerate
				if (this.currentSpeed < this.MAX_SPEED) {	// Normal Acceleration
					this.currentSpeed += this.ACCELERATION;
				} else if (this.currentSpeed > this.MAX_SPEED){ // Overspeeding
					this.currentSpeed -= this.ACCELERATION / 2;
				} else {
					this.currentSpeed = this.MAX_SPEED;
				}
			} else if (!this.game.forward && this.game.backward) {	// Decelerate
				if (this.currentSpeed > -this.MAX_SPEED / 2) {
					this.currentSpeed -= this.ACCELERATION / 2;
				} else {
					this.currentSpeed = -this.MAX_SPEED / 2;
				}
			} else {												// Drag
				if (this.currentSpeed >= this.DRAG){
					this.currentSpeed -= this.DRAG;
				} else if (this.currentSpeed <= -this.DRAG){
					this.currentSpeed += this.DRAG;
				} else {
					this.currentSpeed = 0;
				}
			} 
			
			// Release control, place driver
			if (this.game.keyE && !this.game.blockExit) {
				this.game.camera.controlText = "W/Up: Forward. S/Down: Backward. A,D/Left,Right: Pivot. E: Enter Vehicle. Space: Jump.";
				// Calculate Exit direction
				let exitDirection = (Math.floor(this.direction + 270) % 360 + 360) % 360;
				this.active = false;
				this.game.driver.active = true;
				this.game.driver.x = this.x + ((this.WIDTH / 3) * Math.cos((Math.PI / 180) * exitDirection));
				this.game.driver.y = this.y + ((this.WIDTH / 3) * Math.sin((Math.PI / 180) * exitDirection));
				this.game.driver.direction = this.direction;
				this.game.player = this.game.driver;
				this.game.blockExit = true;
				this.enterFlag = true;
				//this.game.audio.lowerVolume();
				setTimeout(function () {
					that.game.blockExit = false;
				}, 500)
			}
		} else {
			if (this.currentSpeed >= this.DRAG){		// Uncontrolled, Drag
				this.currentSpeed -= this.DRAG;
			} else if (this.currentSpeed <= -this.DRAG){
				this.currentSpeed += this.DRAG;
			} else {
				this.currentSpeed = 0;
			}
			
			// Audio proximity
			let distance = (Math.sqrt( Math.pow(this.x - this.game.driver.x,2) + Math.pow(this.y - this.game.driver.y,2) ));
			if (distance < (this.WIDTH * 3)) {
				if (!this.game.audio.isPlaying) this.game.audio.play();
				this.game.audio.setVolume(0.34 - ((distance / (this.WIDTH * 3)) / 3));
			} else {
				this.game.audio.pause();
			}
		}
		
		// Handle spinning
		if (this.spinSpeed !== 0) {
			this.direction += this.spinSpeed;
			this.spinSpeed = Math.sign(this.spinSpeed) * (Math.abs(this.spinSpeed) - this.SPIN_DRAG);
			if (Math.abs(this.spinSpeed) < 2) this.spinSpeed = 0;
		}
		
		// Movement
		if (this.driftFlag && this.active) {
			this.x += (this.driftSpeed * Math.cos((Math.PI / 180) * this.driftDirection));
			this.y += (this.driftSpeed * Math.sin((Math.PI / 180) * this.driftDirection));
		} else {
			this.x += (this.currentSpeed * Math.cos((Math.PI / 180) * this.direction));
			this.y += (this.currentSpeed * Math.sin((Math.PI / 180) * this.direction));
		}
		
		// Handle pushes
		if (this.pushSpeed >= this.DRAG){
			this.pushSpeed -= this.DRAG;
		} else if (this.pushSpeed <= -this.DRAG){
			this.pushSpeed += this.DRAG;
		} else {
			this.pushSpeed = 0;
		}
		this.x += (this.pushSpeed * Math.cos((Math.PI / 180) * this.pushDirection));
		this.y += (this.pushSpeed * Math.sin((Math.PI / 180) * this.pushDirection));
		
		// Update bounding box
		this.updateBB();
		
		// Collision
		this.game.entities.forEach(function (entity) {
            if (entity.BB && that.BB.collide(entity.BB)) {
				if (entity instanceof Pedestrian) { // squish pedestrians
				if (that.currentSpeed > that.DRAG || that.driftSpeed > that.DRAG) {
					entity.dead = true;
					//console.log("dead");
				} else {
					// Calculate center to center angle
					let angle = Math.atan( Math.abs(entity.y - that.y) / Math.abs(entity.x - that.x) ) * (180 / Math.PI);
					if (entity.x - that.x >= 0 && entity.y - that.y >= 0) angle = (angle % 90); //Q1
					if (entity.x - that.x <  0 && entity.y - that.y >= 0) angle = 180 - (angle % 90); //Q2
					if (entity.x - that.x <  0 && entity.y - that.y <  0) angle = 180 + (angle % 90); //Q3
					if (entity.x - that.x >= 0 && entity.y - that.y <  0) angle = 360 - (angle % 90); //Q4
					entity.pushSpeed = Math.max(that.currentSpeed, 10 * that.DRAG) / 2;
					entity.pushDirection = angle;
				}
				}
				if (entity instanceof Building) {	// hit building
					if (entity.BB.top < that.BB.bottom && entity.BB.top > that.y) that.y = entity.BB.top - that.WIDTH / 2;
					if (entity.BB.bottom > that.BB.top && entity.BB.bottom < that.y) that.y = entity.BB.bottom + that.WIDTH / 2;
					if (entity.BB.left < that.BB.right && entity.BB.left > that.x) that.x = entity.BB.left - that.WIDTH / 2;
					if (entity.BB.right > that.BB.left && entity.BB.right < that.x) that.x = entity.BB.right + that.WIDTH / 2;
					
					// Calculate center to center angle
					let angle = Math.atan( Math.abs(entity.y - that.y) / Math.abs(entity.x - that.x) ) * (180 / Math.PI);
					if (entity.x - that.x >= 0 && entity.y - that.y >= 0) angle = (angle % 90); //Q1
					if (entity.x - that.x <  0 && entity.y - that.y >= 0) angle = 180 - (angle % 90); //Q2
					if (entity.x - that.x <  0 && entity.y - that.y <  0) angle = 180 + (angle % 90); //Q3
					if (entity.x - that.x >= 0 && entity.y - that.y <  0) angle = 360 - (angle % 90); //Q4
					
					// Halt movement
					that.driftSpeed = 0;
					that.currentSpeed = 0;
					// Push
					that.pushSpeed = Math.max(that.currentSpeed, 10 * that.DRAG) / 2;
					that.pushDirection = angle + 180;
				}
				if (entity instanceof Car) {	// hit car
					// Calculate center to center angle
					let angle = Math.atan( Math.abs(entity.y - that.y) / Math.abs(entity.x - that.x) ) * (180 / Math.PI);
					let spin = 3;
					if (Math.abs(angle) < 30) spin = 1;
					if (entity.x - that.x >= 0 && entity.y - that.y >= 0) angle = (angle % 90); //Q1
					if (entity.x - that.x <  0 && entity.y - that.y >= 0) {angle = 180 - (angle % 90); //Q2
						spin = -spin;}
					if (entity.x - that.x <  0 && entity.y - that.y <  0) angle = 180 + (angle % 90); //Q3
					if (entity.x - that.x >= 0 && entity.y - that.y <  0) {angle = 360 - (angle % 90); //Q4
						spin = -spin;}
					// Stop drivercar
					that.currentSpeed = 0;
					that.driftSpeed = 0;
					// push car
					entity.pushSpeed = Math.max(that.currentSpeed, 10 * that.DRAG) / 2;
					entity.pushDirection = angle;
					entity.spinSpeed = spin;	// TODO calculate spinning
					////console.log("boom (car)");
				}
			};
		});
		
		// Keep in bounds
		if (this.BB.left.x < -this.WIDTH || this.BB.top.y < -this.WIDTH
				|| this.BB.right.x > PARAMS.MAP_WIDTH + this.WIDTH
				|| this.BB.bottom.y > PARAMS.MAP_HEIGHT + this.WIDTH) {
			this.direction += 180;
			this.driftDirection += 180;
		}
		this.updateBB();
	};
	
	draw(ctx) {
		if (this.game.keyE) {
			this.enterFlag = true;
		}
		
		// Car animation
		if (this.active && this.enterFlag) {
			this.entering.drawFrame(this.game.clockTick, this.direction, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
			if (this.entering.isDone()) {
				this.enterFlag = false;
				this.entering = new AngleAnimator(this.spritesheet, 0, 0,
					this.WIDTH, this.HEIGHT, 7, 0.05, 1, this.direction, false, false);
			}
		//} else if (!this.active && this.enterFlag) {
			//TODO EXIT VEHICLE
		} else if (!this.active) {
			this.idling.drawFrame(this.game.clockTick, this.direction, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
		} else if (this.game.space){
			this.braking.drawFrame(this.game.clockTick, this.direction, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
		} else {
			this.driving.drawFrame(this.game.clockTick, this.direction, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
		}
		// Burnout animation
		if ((this.currentSpeed > this.MAX_SPEED + 2) && !this.burnoutFlag) {
			this.burnoutFlag = true;
		} else if (!(this.currentSpeed > this.MAX_SPEED) && this.burnoutFlag) {
			this.burnoutFlag = false;
		}
		
		if (this.burnoutFlag) {
			this.flame.drawFrame(this.game.clockTick, (this.direction + 270) % 360, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, 1);
		}
		
		if (PARAMS.DEBUG) {
			// Draw 4 Bounding Box points to represent corners
			ctx.strokeStyle = 'Red';
			for (var i = 0; i < this.BB.points.length; i++) {
				ctx.beginPath();
				ctx.moveTo(this.BB.points[i].x - this.game.camera.x, this.BB.points[i].y - this.game.camera.y);
				ctx.lineTo(this.BB.points[(i-1 + 4) % 4].x - this.game.camera.x, this.BB.points[(i-1 + 4) % 4].y - this.game.camera.y);
				ctx.stroke();
			}
		} 
	};
};
