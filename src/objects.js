"use strict";

function GameObject(image, name, x, y, width, height) {
	this.properties = {};
	this.tag = "";
	this.image = image;
	
	this.name = name;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.isMarkedForDelete = false;
	
	this.collisionLevel = 10;
}

GameObject.instantiate = function(gameObject) {
	var property;
	for(property in gameObject.properties) {
		GameObjectProperty.instantiate(gameObject.properties[property]);
	}
	return gameObject;
}

GameObject.prototype.destroy = function() {
	this.isMarkedForDelete = true;
}

GameObject.prototype.act = function(frameTime) {

}

GameObject.prototype.draw = function(ctx, cellSize) {
	
}

GameObject.prototype.getProperty = function(functionName) {
	var property;
	for(property in this.properties) {
		if(this.properties[property] instanceof functionName) {
			return this.properties[property];
		}
	}
	
	return null;
}

function Stash(image, name, x, y, width, height, team) {
	GameObject.call(this, image, name, x, y, width, height);
	
	this.properties = {
		pPlayerUnit : new PPlayerUnit(this, team, 4)
	}
}
Stash.prototype = Object.create(GameObject.prototype);
Stash.prototype.constructor = Stash;
Stash.prototype.act = function(frameTime) {
	
}
Stash.prototype.draw = function(ctx, cellSize) {
	ctx.drawImage(this.image, this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
}

function Wall(image, name, x, y, width, height) {
	GameObject.call(this, image, name, x, y, width, height);
}
Wall.prototype = Object.create(GameObject.prototype);
Wall.prototype.constructor = Wall;
Wall.prototype.act = function(frameTime) {
	
}
Wall.prototype.draw = function(ctx, cellSize) {
	ctx.drawImage(this.image, this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
}

function Ore(image, name, x, y, width, height, cosp) {
	GameObject.call(this, image, name, x, y, width, height);
	
	this.properties = {
		pOreResources : new POreResources(this)
	}
	
	this.cosp = cosp;
}
Ore.prototype = Object.create(GameObject.prototype);
Ore.prototype.constructor = Ore;
Ore.prototype.act = function(frameTime) {
	
}
Ore.prototype.draw = function(ctx, cellSize) {
	var res = this.properties.pOreResources.oreResources[0];
	var res2 = this.properties.pOreResources.oreResources[1];
	
	if(res) { //TODO i'm almost positive there is a more efficient way to do this
		if(res.amtCur >= 64) {
			ctx.drawImage(Game.Assets["imgOre_" + res.resourceName + "_large"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
		}
		else if(res.amtCur >= 32) {
			if(res2)
				if(res2.amtCur >= 64)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_large"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
			ctx.drawImage(Game.Assets["imgOre_" + res.resourceName + "_medium"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
		}
		else if(res.amtCur >= 12) {
			if(res2)
				if(res2.amtCur >= 64)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_large"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
				else if(res2.amtCur >= 32)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_medium"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
			ctx.drawImage(Game.Assets["imgOre_" + res.resourceName + "_small"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
		}
		else {
			if(res2)
				if(res2.amtCur >= 64)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_large"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
				else if(res2.amtCur >= 32)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_medium"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
				else if(res2.amtCur >= 12)
					ctx.drawImage(Game.Assets["imgOre_" + res2.resourceName + "_small"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
			ctx.drawImage(Game.Assets["imgOre_" + res.resourceName + "_tiny"], this.x * cellSize, this.y * cellSize, this.width * cellSize, this.height * cellSize);
		}
	}
}

function Proxy(image, name, x, y, width, height, team, level, particles, player) {
	GameObject.call(this, image, name, x, y, width, height);
	
	this.speed = 0;
	this.miningSpeed = 0;
	
	/*this.targetPath = [];
	this.pathIndex = 1;
	this.targetType = "";
	
	this.state = "Halted";
	
	this.haltedInterval = 1000;
	this.haltedClock = 0;*/
	
	this.level = level;
	this.particles = particles;
	this.player = player;
	
	this.properties = {
		pPlayerUnit : new PPlayerUnit(this, team, 3),
		pOreMiner : new POreMiner(this, level, particles, player),
		pOreBuffer : new POreBuffer(this),
		pOreBufferUnloader : new POreBufferUnloader(this, particles, player),
		pGridMovement : new PGridMovement(this, level),
		pUpgradesProxy : new PUpgradesProxy(this),
		pProxyAI : new PProxyAI(this, level)
	}
}
Proxy.prototype = Object.create(GameObject.prototype);
Proxy.prototype.constructor = Proxy;
Proxy.prototype.destroy = function() { //TODO everything
	this.properties.pOreMiner = new POreMiner(this, this.level, this.particles, this.player); //TODO get rid of all of this by moving properties' variables to proxy
	this.properties.pOreBuffer = new POreBuffer(this);
	this.properties.pOreBufferUnloader = new POreBufferUnloader(this, this.particles, this.player);
	this.properties.pGridMovement = new PGridMovement(this, this.level);
	this.properties.pProxyAI = new PProxyAI(this, this.level);
	
	GameObject.instantiate(this);
	
	GameObject.prototype.destroy.apply(this);
}

Proxy.prototype.act = function(frameTime) {
	this.properties.pProxyAI.act(frameTime);
}

Proxy.prototype.draw = function(ctx, cellSize) {
	var mov = this.properties.pGridMovement;
	if(this.rotation !== 0) {
		ctx.save();
		ctx.translate(mov.calculatedX * cellSize + cellSize / 2, mov.calculatedY * cellSize + cellSize / 2);
		ctx.rotate(this.properties.pGridMovement.rotation * Math.PI / 180);
		ctx.drawImage(this.image, -(this.width * cellSize / 2), -(this.height * cellSize / 2), this.width * cellSize, this.height * cellSize);
		ctx.restore();
	}
	else {
		ctx.drawImage(this.image, mov.calculatedX * cellSize, mov.calculatedY * cellSize, this.width * cellSize, this.height * cellSize);
	}
}

