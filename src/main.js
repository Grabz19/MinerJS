"use strict";

(function() {
	var cosp = null;
	
	function CanvasObject(_cosp, canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		
		cosp = _cosp;
	}
	
	CanvasObject.prototype.act = function(frameTime) {
		
	}
	
	CanvasObject.prototype.draw = function() {
		
	}
	
	CanvasObject.prototype.onClick = function(e, worldX, worldY) {
		
	}
	
	CanvasObject.prototype.onMouseMove = function(e, worldX, worldY) {

	}
	
	Game.CanvasObject = CanvasObject;
})();

(function() {
	function CanvasObjectSharedProperties() {
		this.cellSize = 0;
		this.cellWidth = 0;
		this.cellHeight = 0;
	}
	
	Game.CanvasObjectSharedProperties = CanvasObjectSharedProperties;
})();

(function() {
	var canvas = document.getElementById("canvas_events");
	var ctx = canvas.getContext("2d");
	
	var canvasObjects = [];
	
	var lastMouseX = 0, lastMouseY = 0;
	var x = 0, y = 0;
	var isCamera = false;
	var zoomLevel = 64;
	
	var cosp = null;
	
	function CanvasObjectManager(_cosp) {
		canvas.addEventListener("click", this.onClick.bind(this));
		canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
		canvas.addEventListener("wheel", this.onWheel.bind(this));
		
		cosp = _cosp;
	}
	
	CanvasObjectManager.prototype.toggleCamera = function(bool) {
		if(typeof bool === "boolean")
			isCamera = bool;
		else {
			isCamera = !isCamera;
		}
		
		if(isCamera) {
			cosp.cellSize = zoomLevel;
		}
		else {
			this.onResize();
		}
	}
	
	CanvasObjectManager.prototype.getCameraToggled = function() {
		return isCamera;
	}
	
	CanvasObjectManager.prototype.addCanvasObject = function(canvasObject) {
		if(canvasObject instanceof Game.CanvasObject) {
			canvasObjects.push(canvasObject);
		}
	}
	
	CanvasObjectManager.prototype.act = function(frameTime) {
		for(var i = 0; i < canvasObjects.length; i++)
			canvasObjects[i].act(frameTime);
	}
	
	CanvasObjectManager.prototype.draw = function() {
		if(isCamera) {
			if(Game.KeyInputManager.instance.getButtonDown("left"))
				x -= 16;
			if(Game.KeyInputManager.instance.getButtonDown("right"))
				x += 16;
			if(Game.KeyInputManager.instance.getButtonDown("up"))
				y -= 16;
			if(Game.KeyInputManager.instance.getButtonDown("down"))
				y += 16;
			
			this.onMouseMove({offsetX: lastMouseX, offsetY: lastMouseY});
			
			//throws negatives if reordered
			x = x > (cosp.cellSize * cosp.cellWidth - canvas.width) ? (cosp.cellSize * cosp.cellWidth - canvas.width) : x;
			x = x < 0 ? 0 : x;
			y = y > (cosp.cellSize * cosp.cellHeight - canvas.height) ? (cosp.cellSize * cosp.cellHeight - canvas.height) : y;
			y = y < 0 ? 0 : y;
		

			for(var i = 0; i < canvasObjects.length; i++) {

				canvasObjects[i].ctx.setTransform(1, 0, 0, 1, 0, 0);
				canvasObjects[i].ctx.clearRect(0, 0, canvasObjects[i].canvas.width, canvasObjects[i].canvas.height);
			
				canvasObjects[i].ctx.translate(-x, -y);
				
				canvasObjects[i].draw(x, y);
			}
		}
		else {
			for(var i = 0; i < canvasObjects.length; i++) {
				canvasObjects[i].draw(0, 0);
			}
		}
	}
	
	CanvasObjectManager.prototype.onClick = function(e) {
		if(typeof e.offsetX == "undefined" || typeof e.offsetY == "undefined") {
			e.offsetX = e.clientX - canvas.getBoundingClientRect().left;
			e.offsetY = e.clientY - canvas.getBoundingClientRect().top;
		}
		
		var worldX = e.offsetX + (isCamera ? x : 0);
		var worldY = e.offsetY + (isCamera ? y : 0);
		
		for(var i = 0; i < canvasObjects.length; i++)
			canvasObjects[i].onClick(e, worldX, worldY);
	}
	
	CanvasObjectManager.prototype.onMouseMove = function(e) {
		if(typeof e.offsetX == "undefined" || typeof e.offsetY == "undefined") {
			e.offsetX = e.clientX - canvas.getBoundingClientRect().left;
			e.offsetY = e.clientY - canvas.getBoundingClientRect().top;
		}
		
		lastMouseX = e.offsetX;
		lastMouseY = e.offsetY;
		
		var worldX = e.offsetX + (isCamera ? x : 0);
		var worldY = e.offsetY + (isCamera ? y : 0);
		
		for(var i = 0; i < canvasObjects.length; i++)
			canvasObjects[i].onMouseMove(e, worldX, worldY);
	}
	
	CanvasObjectManager.prototype.onWheel = function(e) {
		if(isCamera) {
			var zoomOld = zoomLevel;
			
			if(e.deltaY < 0) {
				zoomLevel += Math.ceil(zoomLevel / 8);
			}
			else if(e.deltaY > 0) {
				zoomLevel -= Math.floor(zoomLevel / 8);
			}
			
			//var shiftPxWidth = (zoomLevel - zoomOld) * cosp.cellWidth * (lastMouseX / canvas.width);
			//var shiftPxHeight = (zoomLevel - zoomOld) * cosp.cellHeight * (lastMouseY / canvas.height);
			var shiftPxWidth = (zoomLevel - zoomOld) * ((x + lastMouseX) / cosp.cellSize);
			var shiftPxHeight = (zoomLevel - zoomOld) * ((y + lastMouseY) / cosp.cellSize);
			
			x += Math.round(shiftPxWidth);
			y += Math.round(shiftPxHeight);
			
			//x = Math.round((x * zoomLevel) / zoomOld);
			//y = Math.round((x * zoomLevel) / zoomOld);
			
			var oW = canvas.offsetWidth;
			var oH = canvas.offsetHeight;
			
			var length = Math.min(oW, oH);
			var cellLength = Math.max(cosp.cellWidth, cosp.cellHeight);
			
			var cellSize = Math.floor(length / cellLength);
			
			
			
			if(cellSize >= zoomLevel) {
				zoomLevel = cellSize;
				x = 0;
				y = 0;
			}
			
			cosp.cellSize = zoomLevel;
		}
	}

	CanvasObjectManager.prototype.onResize = function() {
		var i;
		var oW = canvas.offsetWidth;
		var oH = canvas.offsetHeight;
		
		var length = Math.min(oW, oH);
		var cellLength = Math.max(cosp.cellWidth, cosp.cellHeight);
		
		var cellSize = Math.floor(length / cellLength);
		
		var calcWidth = cellSize * cosp.cellWidth;
		var calcHeight = cellSize * cosp.cellHeight;
		
		if(isCamera) {
			if(cellSize >= cosp.cellSize)
				cosp.cellSize = cellSize;
			else
				return;
		}
		else
			cosp.cellSize = cellSize;
		
		for(i = 0; i < canvasObjects.length; i++) {
			canvasObjects[i].canvas.width = oW;
			canvasObjects[i].canvas.height = oH;
			
			canvas.width = oW;
			canvas.height = oH;
			
			canvasObjects[i].ctx.mozImageSmoothingEnabled = false;
			canvasObjects[i].ctx.msImageSmoothingEnabled = false;
			canvasObjects[i].ctx.imageSmoothingEnabled = false;
		}
	}
	
	Game.CanvasObjectManager = CanvasObjectManager;
})();

(function() {
	var particles = [];
	
	var cosp;
	
	function Particles(_cosp) {
		Game.CanvasObject.call(this, _cosp, document.getElementById("canvas_particles")); //TODO
		
		cosp = _cosp;
	}
	Particles.prototype = Object.create(Game.CanvasObject.prototype);
	Particles.prototype.constructor = Particles;
	
	Particles.prototype.act = function(frameTime) {
		Game.CanvasObject.prototype.act.apply(this, [frameTime]);
		
		var i;
		var l = particles.length;
		for(i = 0; i < l; i++) {
			particles[i].act(frameTime);
		}
		
		for(i = 0; i < particles.length; i++) {
			if(particles[i].isMoving == false) {
				particles.splice(particles.indexOf(particles[i]), 1);
				i--;
			}
		}
	}
	
	Particles.prototype.draw = function(worldX, worldY) {
		Game.CanvasObject.prototype.draw.apply(this);
		
		var i;
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		var l = particles.length;
		for(i = 0; i < l; i++) {
			if(GameUtil.isColliding(particles[i].x * cosp.cellSize, particles[i].y * cosp.cellSize, cosp.cellSize * particles[i].width, cosp.cellSize * particles[i].height,
				worldX, worldY, this.canvas.width + worldX, this.canvas.height + worldY))
				particles[i].draw(this.ctx, cosp.cellSize);
		}
	}
	
	Particles.prototype.createParticle = function(callback, image, width, height, x, y, targetX, targetY, speed, rotation) { //TODO
		particles.push(new Game.Particle(callback, image, width, height, new Vector2(x, y), new Vector2(targetX, targetY), speed, rotation));
	}
	
	Particles.prototype.createFloatingResourceParticle = function(decimal, image, x, y, hexColor) {
		particles.push(new Game.ParticleFloatingResource(null, image, 1, 1, new Vector2(x, y), new Vector2(x, y - 0.5), 0.5, 0, decimal, hexColor));
	}
	
	Game.Particles = Particles;
})();

(function() {
	var mouseX = 0;
	var mouseY = 0;
	
	var cosp = null;
	
	function Highlight(_cosp) {
		Game.CanvasObject.call(this, _cosp, document.getElementById("canvas_highlight")); //TODO
		
		cosp = _cosp;
	}
	
	Highlight.prototype = Object.create(Game.CanvasObject.prototype);
	Highlight.prototype.constructor = Highlight;
	
	Highlight.prototype.onMouseMove = function(e, worldX, worldY) {
		Game.CanvasObject.prototype.onMouseMove.apply(this, [e]);
		
		mouseX = worldX;
		mouseY = worldY;
	}
	
	Highlight.prototype.draw = function(worldX, worldY) {
		Game.CanvasObject.prototype.draw.apply(this);
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(mouseX && mouseY) {
			var cellX = Math.floor(mouseX / cosp.cellSize);
			var cellY = Math.floor(mouseY / cosp.cellSize);
			
			var pxThick = 1;
			
			this.ctx.fillStyle = "#FFFF00";
			//left | 
			this.ctx.fillRect(cellX * cosp.cellSize, cellY * cosp.cellSize, pxThick, cosp.cellSize);
			//right |
			this.ctx.fillRect(cellX * cosp.cellSize + cosp.cellSize - pxThick, cellY * cosp.cellSize, pxThick, cosp.cellSize);
			//top _
			this.ctx.fillRect(cellX * cosp.cellSize, cellY * cosp.cellSize, cosp.cellSize, pxThick);
			//bottom _
			this.ctx.fillRect(cellX * cosp.cellSize, cellY * cosp.cellSize + cosp.cellSize - pxThick, cosp.cellSize, pxThick);
		}
	}
	
	Game.Highlight = Highlight;
})();

(function() {
	var selectedObject = null;
	
	var objects = [];
	var objectsGrid = [];
	var pfMatrix = [];
	var pfGrid = null;
	var pfFinder = new PF.AStarFinder();
	var wallGenerator = new GameUtil.WallGenerator();
	
	var fogOfWarGrid = [];
	
	var isPlacingObject = false;
	var objectToPlace = null;
	
	var particles = null;
	var player = null;
	var cosp = null;
	
	function Level(_particles, _player, _cosp) {
		Game.CanvasObject.call(this, _cosp, document.getElementById("canvas_level")); //TODO
		
		particles = _particles;
		player = _player;
		cosp = _cosp;
	}
	
	Level.prototype = Object.create(Game.CanvasObject.prototype);
	Level.prototype.constructor = Level;
	
	Level.prototype.getPath = function(origX, origY, targetX, targetY) {
		var path;
		
		if(cosp.cellWidth <= 65 && cosp.cellHeight <= 65) { // default solution
			pfGrid.setWalkableAt(targetX, targetY, true);
			path = pfFinder.findPath(origX, origY, targetX, targetY, pfGrid.clone());
			pfGrid.setWalkableAt(targetX, targetY, false);
			
			return path;
		}
		else { // large level compatibility
			if(Math.abs(targetX - origX) > 64 || Math.abs(targetY - origY) > 64) { //TODO
				return [];
			}
		
			var newOrigY = 32;
			var newOrigX = 32;
			var newTargetY = 32 + (targetY - origY);
			var newTargetX = 32 + (targetX - origX);
			
			var startY = origY - 32;
			if(startY < 0) {
				newOrigY += startY;
				newTargetY += startY;
				startY = 0;
			}
			
			var startX = origX - 32;
			if(startX < 0) {
				newOrigX += startX;
				newTargetX += startX;
				startX = 0;
			}
			
			var endY = origY + 32;
			if(endY >= cosp.cellHeight) {
				newOrigY -= endY - cosp.cellHeight - 1;
				newTargetY -= endY - cosp.cellHeight - 1;
				endY = cosp.cellHeight - 1;
			}
			
			var endX = origX + 32;
			if(endX >= cosp.cellWidth) {
				newOrigX -= endX - cosp.cellWidth - 1;
				newTargetX -= endX - cosp.cellWidth - 1;
				endX = cosp.cellWidth - 1;
			}
			
			console.log(startX, endX, startY, endY);
			console.log(newOrigX, newOrigY, newTargetX, newTargetY);
			
			var grid = new PF.Grid(endX - startX, endY - startY);
			
			var yy = 0;
			var xx = 0;
			var y, x;
			for(y = startY; y <= endY; y++) {
				for(x = startX; x <= endX; x++) {
					if(!pfGrid.getNodeAt(x, y).walkable) {
						grid.setWalkableAt(xx, yy, false);
					}
					xx++;
				}
				xx = 0;
				yy++;
			}
			
			grid.setWalkableAt(newTargetX, newTargetY, true);
			path = pfFinder.findPath(newOrigX, newOrigY, newTargetX, newTargetY, grid);
			
			path.forEach(function(coordinates) {
				coordinates[0] += startX;
				coordinates[1] += startY;
			});
			
			return path;
		}
		
	}
	
	Level.prototype.uncoverFogOfWar = function(x, y, radius) {
		var i, j;
		for(i = -radius; i <= radius; i++)
			for(j = -radius; j <= radius; j++) {
				if(j*j+i*i <= radius*radius) {
					if(j*j+i*i >= radius * (radius/2)) {
						if(typeof fogOfWarGrid[y + i] !== "undefined" && typeof fogOfWarGrid[y + i][x + j] !== "undefined" && fogOfWarGrid[y + i][x + j] == 2)
							fogOfWarGrid[y + i][x + j] = 1;
					}
					else {
						if(typeof fogOfWarGrid[y + i] !== "undefined" && typeof fogOfWarGrid[y + i][x + j] !== "undefined")
							fogOfWarGrid[y + i][x + j] = 0;
					}
				}
			}
	}
	
	Level.prototype.resetFogOfWar = function(state) {
		fogOfWarGrid.splice(0, fogOfWarGrid.length);
		
		var x, y;
		for(y = 0; y < cosp.cellHeight; y++) {
			fogOfWarGrid[y] = [];
			for(x = 0; x < cosp.cellWidth; x++) {
				fogOfWarGrid[y][x] = state;
			}
		}
	}
	
	Level.prototype.addGameObject = function(gameObject) {
		if(gameObject instanceof GameObject) {
			var x, y, z;
			/*for(y = 0; y < gameObject.height; y++) {
				for(x = 0; x < gameObject.width; x++) {
					if(typeof objectsGrid[gameObject.y + y] !== "undefined" && typeof objectsGrid[gameObject.y + y][gameObject.x + x] !== "undefined") {
						objectsGrid[gameObject.y + y][gameObject.x + x].push(gameObject);
						pfGrid.setWalkableAt(gameObject.x + x, gameObject.y + y, false);
					}
					else {
						console.warn("Registering a GameObject which is fully or partially out of bounds. Possibly unwanted behaviour.");
					}
				}
			}*/
			gameObject.isMarkedForDelete = false;
			objects.push(gameObject);
			
			if(!(gameObject.x % 1) && !(gameObject.y % 1)) {
				if(objectsGrid[gameObject.y] !== undefined && objectsGrid[gameObject.y][gameObject.x] !== undefined)
					for(z = 0; z < objectsGrid[gameObject.y][gameObject.x].length; z++) {
						if(objectsGrid[gameObject.y][gameObject.x][z] === null) {
							objectsGrid[gameObject.y][gameObject.x][z] = gameObject;
							pfGrid.setWalkableAt(gameObject.x, gameObject.y, false);
							break;
						}
					}
			}
			
			var pPlayerUnit = gameObject.getProperty(PPlayerUnit);
			
			if(pPlayerUnit) {
				for(y = 0; y < gameObject.height; y++)
					for(x = 0; x < gameObject.width; x++) {
						this.uncoverFogOfWar(gameObject.x + x, gameObject.y + y, pPlayerUnit.fogOfWarRadius);
					}
			}
			return true;
		}
		else
			return false;
	}
	
	Level.prototype.getGameObjectsAt = function(x, y) {
		if(objectsGrid[y] !== undefined && objectsGrid[y][x] !== undefined) {
			var z, arr = [], i = 0;
			for(z = 0; z < objectsGrid[y][x].length; z++) {
				if(objectsGrid[y][x][z] !== null) {
					arr[i] = objectsGrid[y][x][z];
					i++;
				}
			}
			return arr.length === 0 ? null : arr;
		}
		
		return null;
	}
	
	Level.prototype.getSingleGameObjectOfClassAt = function(x, y, func) {
		if(objectsGrid[y] !== undefined && objectsGrid[y][x] !== undefined) {
			var z;
			for(z = 0; z < objectsGrid[y][x].length; z++) {
				if(objectsGrid[y][x][z] !== null && objectsGrid[y][x][z] instanceof func) {
					return objectsGrid[y][x][z];
				}
			}
		}
		
		return null;
	}
	
	Level.prototype.getGameObjectsGrid = function() {
		return objectsGrid;
	}
	
	Level.prototype.buildGameObjectsGrid = function() {
		var i;
		var x, y, z;
		
		for(y = 0; y < cosp.cellHeight; y++) {
			if(objectsGrid[y] === undefined)
				objectsGrid[y] = [];
			if(pfMatrix[y] === undefined)
				pfMatrix[y] = [];
			
			for(x = 0; x < cosp.cellWidth; x++) {
				if(objectsGrid[y][x] === undefined)
					objectsGrid[y][x] = [];
				if(pfMatrix[y][x] === undefined)
					pfMatrix[y][x] = 0;
				objectsGrid[y][x][0] = null;
				objectsGrid[y][x][1] = null;
				objectsGrid[y][x][2] = null;
			}
		}
		
		pfGrid = new PF.Grid(pfMatrix);
		/*
		for(i = 0; i < objects.length; i++) {
			if(objects[i].x % 1 === 0 && objects[i].y % 1 === 0) {
				for(y = objects[i].y; y < objects[i].y + objects[i].height; y++) {
					for(x = objects[i].x; x < objects[i].x + objects[i].width; x++) {
						for(z = 0; z < 3; z++) {
							if(objectsGrid[y][x][z] === null) {
								objectsGrid[y][x][z] = objects[i];
								break;
							}
							pfMatrix[y][x] = 1; //TODO isCollider
						}
					}
				}
			}
		}
		*/
	}
	
	Level.prototype.getGameObjectsOfClass = function(c) {
		var i, j = 0;
		var arr = [];
		for(i = 0; i < objects.length; i++) {
			if(objects[i] instanceof c) {
				arr[j] = objects[i];
				j++;
			}
		}
		return arr;
	}
	
	Level.prototype.getGameObjectsWithProperty = function(c) {
		var i, j = 0, property;
		var arr = [];
		for(i = 0; i < objects.length; i++) {
			property = objects[i].getProperty(c);
			if(property) {
				arr[j] = objects[i];
				j++;
				break;
			}
		}
		
		return arr;
	}
	
	Level.prototype.generateNew = function(width, height, isNoFog) {
		var i;
		
		cosp.cellWidth = width;
		cosp.cellHeight = height;
		
		if(isNoFog)
			this.resetFogOfWar(0);
		else
			this.resetFogOfWar(2);
		
		objects.splice(0, objects.length);
		
		this.buildGameObjectsGrid();
		
		do {
			noise.seed(Math.random());
			
			var x, y, weight, weightArray = [], ore, oreProperty, peakArray = [], lowestPointsArray = [], random, distance;
			for(y = 0; y < height; y++) {
				weightArray[y] = [];
				for(x = 0; x < width; x++) {
					weight = 10 + Math.floor(noise.simplex2(x / 18, y / 18) * 10); //0-19
					weightArray[y][x] = weight;

					if(weight >= 19) {
						peakArray.push([x, y, Math.random() > 0.5 ? "c" : "t"]);
					}
				}
			}
			
			for(i = 0; i < 20; i++) {
				for(y = 0; y < height; y++) {
					for(x = 0; x < width; x++) {
						if(weightArray[y][x] == i)
							lowestPointsArray.push([x, y]);
					}
				}
				if(lowestPointsArray.length >= 2)
					break;
			}
		}
		while(peakArray.length <= 1);
		
		for(y = 0; y < height; y++) {
			for(x = 0; x < width; x++) {
				random = Math.random() <= weightArray[y][x] / 19;
				if(random) {
					var lowestDistance = null;
					var closestPeak = null;
					
					for(i = 0; i < peakArray.length; i++) {
						distance = Vector2.distance(new Vector2(peakArray[i][0], peakArray[i][1]), new Vector2(x, y));
						if(lowestDistance === null || lowestDistance > distance) {
							lowestDistance = distance;
							closestPeak = peakArray[i];
						}
					}

					if(lowestDistance <= width / 3) {
						if(closestPeak[2] == "c") {
							ore = GameObject.instantiate(new Ore(null, "Copper", x, y, 1, 1, cosp));
							oreProperty = ore.getProperty(POreResources);
							oreProperty.addOreResource(new OreResource("copper", "Copper", new Decimal(1), new Decimal(1)));
							oreProperty.addOreResource(new OreResource("stone", "Stone", new Decimal(1), new Decimal(1)));
						}
						else {
							ore = GameObject.instantiate(new Ore(null, "Tin", x, y, 1, 1, cosp));
							oreProperty = ore.getProperty(POreResources);
							oreProperty.addOreResource(new OreResource("tin", "Tin", new Decimal(1), new Decimal(1)));
							oreProperty.addOreResource(new OreResource("stone", "Stone", new Decimal(1), new Decimal(1)));
						}
						
						if(weightArray[y][x] >= 16) {
							oreProperty.oreResources[0].amtCur = new Decimal(96);
							oreProperty.oreResources[0].amtMax = new Decimal(96);
							oreProperty.oreResources[1].amtCur = new Decimal(96);
							oreProperty.oreResources[1].amtMax = new Decimal(96);
						}
						else if(weightArray[y][x] >= 12) {
							oreProperty.oreResources[0].amtCur = new Decimal(63);
							oreProperty.oreResources[0].amtMax = new Decimal(63);
							oreProperty.oreResources[1].amtCur = new Decimal(63);
							oreProperty.oreResources[1].amtMax = new Decimal(63);
						}
						else if(weightArray[y][x] >= 8) {
							oreProperty.oreResources[0].amtCur = new Decimal(31);
							oreProperty.oreResources[0].amtMax = new Decimal(31);
							oreProperty.oreResources[1].amtCur = new Decimal(31);
							oreProperty.oreResources[1].amtMax = new Decimal(31);
						}
						else {
							oreProperty.oreResources[0].amtCur = new Decimal(11);
							oreProperty.oreResources[0].amtMax = new Decimal(11);
							oreProperty.oreResources[1].amtCur = new Decimal(11);
							oreProperty.oreResources[1].amtMax = new Decimal(11);
						}
					}
					else {
						ore = GameObject.instantiate(new Ore(null, "Stone", x, y, 1, 1, cosp));
						oreProperty = ore.getProperty(POreResources);
						oreProperty.addOreResource(new OreResource("stone", "Stone", new Decimal(1), new Decimal(1)));
						if(weightArray[y][x] >= 16) {
							oreProperty.oreResources[0].amtCur = new Decimal(96);
							oreProperty.oreResources[0].amtMax = new Decimal(96);
						}
						else if(weightArray[y][x] >= 12) {
							oreProperty.oreResources[0].amtCur = new Decimal(63);
							oreProperty.oreResources[0].amtMax = new Decimal(63);
						}
						else if(weightArray[y][x] >= 8) {
							oreProperty.oreResources[0].amtCur = new Decimal(31);
							oreProperty.oreResources[0].amtMax = new Decimal(31);
						}
						else {
							oreProperty.oreResources[0].amtCur = new Decimal(11);
							oreProperty.oreResources[0].amtMax = new Decimal(11);
						}
					}
					
					this.addGameObject(ore);
				}
			}
		}
		
		/*for(i = 0; i < 2; i++) {
			var randomX = Math.ceil(Math.random() * (width-1));
			var randomY = Math.ceil(Math.random() * (height-1));
			switch(Math.ceil(Math.random() * 3)) {
				case 0:
					x = randomX;
					y = 0;
					break;
				case 1:
					x = randomX;
					y = height - 1;
					break;
				case 2:
					x = 0;
					y = randomY;
					break;
				default:
					x = width - 1;
					y = randomY;
					break;
			}
			var obj = this.getGameObjectAt(x, y);
			if(obj)
				obj.destroy();
			this.addGameObject(new Stash("stash", x, y, 1, 1));
		}*/
		
		var rand = [];
		rand[0] = Math.ceil(Math.random() * lowestPointsArray.length) - 1;
		rand[1] = Math.ceil(Math.random() * lowestPointsArray.length) - 1;
		
		var objs;
		var j, k, m;
		for(i = 0; i < 1; i++) {
			for(j = 0; j < 2; j++) {
				for(k = 0; k < 2; k++) {
					objs = this.getGameObjectsAt(lowestPointsArray[rand[i]][0] + j, lowestPointsArray[rand[i]][1] + k);
					
					if(objs !== null)
						for(m = 0; m < objs.length; m++)
							if(objs[m])
								objs[m].destroy();
				}
			}
			this.uncoverFogOfWar(lowestPointsArray[rand[i]][0], lowestPointsArray[rand[i]][1], 4);
		}
		
		var arrWalls = wallGenerator.getLevel(width, height, Math.random());
		var arrWalls2 = wallGenerator.getLevel(width, height, Math.random());
		var arrWalls3 = wallGenerator.getLevel(width, height, Math.random());
		for(y = 0; y < height; y++) {
			for(x = 0; x < width; x++) {
				if(arrWalls[y][x] === 1 || arrWalls2[y][x] === 1 || arrWalls3[y][x] === 1) {
					objs = this.getGameObjectsAt(x, y);
					if(objs !== null) {
						for(m = 0; m < objs.length; m++)
							if(objs[m])
								objs[m].destroy();
					}
					
					this.addGameObject(GameObject.instantiate(new Wall(Game.Assets.imgWall, "Wall", x, y, 1, 1)));
				}
			}
		}
	}
	
	Level.prototype.reportGameObjectMovementThisFrame = function(gameObject, origX, origY, targetX, targetY) {
		var objs = this.getGameObjectsAt(origX, origY);
		if(objs === null)
			return;
		var i, z, z2;
		
		for(i = 0; i < objs.length; i++) {
			if(gameObject === objs[i]) {
				var count = 0;
				
				for(z = 0; z < objectsGrid[origY][origX].length; z++) {
					if(objectsGrid[origY][origX][z] !== null)
						count++;
					
					if(objectsGrid[origY][origX][z] === gameObject) {
						objectsGrid[origY][origX][z] = null;
						count--;
						for(z2 = 0; z2 < objectsGrid[targetY][targetX].length; z2++) {
							if(objectsGrid[targetY][targetX][z2] === null)
								objectsGrid[targetY][targetX][z2] = gameObject;
						}
					}
						
				}
				
				if(!count)
					pfGrid.setWalkableAt(origX, origY, true);
				
				pfGrid.setWalkableAt(targetX, targetY, false);
				return true;
			}
		}
		
		return false;
	}
	
	Level.prototype.act = function(frameTime) {
		Game.CanvasObject.prototype.act.apply(this, [frameTime]);
		
		var i;
		
		for(i = 0; i < objects.length; i++) {
			if(!objects[i].isMarkedForDelete)
				objects[i].act(frameTime);
			
			if(objects[i].isMarkedForDelete) {
				if(!(objects[i].x % 1) && !(objects[i].y % 1) && objectsGrid[objects[i].y] !== undefined && objectsGrid[objects[i].y][objects[i].x] !== undefined) {
					var z, count = 0;
					for(z = 0; z < objectsGrid[objects[i].y][objects[i].x].length; z++) {
						if(objectsGrid[objects[i].y][objects[i].x][z] !== null)
							count++;
						
						if(objectsGrid[objects[i].y][objects[i].x][z] === objects[i]) {
							objectsGrid[objects[i].y][objects[i].x][z] = null;
							count--;
						}
					}
					
					if(!count)
						pfGrid.setWalkableAt(objects[i].x, objects[i].y, true);
				}
				objects[i].isMarkedForDelete = false;
				objects.splice(i, 1);
				
				i--;
			}
		}
	}
	
	Level.prototype.draw = function(worldX, worldY) {
		Game.CanvasObject.prototype.draw.apply(this);
		
		this.ctx.fillStyle = "#8e6b38";
		this.ctx.fillRect(0, 0, cosp.cellWidth * cosp.cellSize, cosp.cellHeight * cosp.cellSize);
		var i, x, y, z, pGridMovement;
		
		var minY = Math.floor(worldY / cosp.cellSize);
		var minX = Math.floor(worldX / cosp.cellSize);
		var maxY = Math.ceil((worldY + this.canvas.height) / cosp.cellSize);
		var maxX = Math.ceil((worldX + this.canvas.width) / cosp.cellSize);
		for(y = minY; y < maxY; y++) {
			for(x = minX; x < maxX; x++) {
				if(objectsGrid[y] !== undefined && objectsGrid[y][x] !== undefined && 
					fogOfWarGrid[y] !== undefined && fogOfWarGrid[y][x] !== undefined && 
					fogOfWarGrid[y][x] !== 2) {
					
					for(z = 0; z < objectsGrid[y][x].length; z++) {
						if(objectsGrid[y][x][z] instanceof GameObject)
							objectsGrid[y][x][z].draw(this.ctx, cosp.cellSize);
					}
				}
			}
		}
		
		for(y = minY; y < maxY; y++) {
			for(x = minX; x < maxX; x++) {
				if(fogOfWarGrid[y] !== undefined && fogOfWarGrid[y][x] !== undefined) {
					if(fogOfWarGrid[y][x] === 2) {
						this.ctx.fillStyle = "#000000";
						this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, cosp.cellSize, cosp.cellSize);
						
					}
					else if(fogOfWarGrid[y][x] === 1) {
						this.ctx.fillStyle = "rgba(0,0,0,0.5)";
						this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, cosp.cellSize, cosp.cellSize);
					}
					else if(isPlacingObject && this.getGameObjectsAt(x, y) === null) {
						this.ctx.fillStyle = "rgba(40,200,40,0.5)";
						this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, cosp.cellSize, cosp.cellSize);
					}
					
					//if(!pfGrid.nodes[y][x].walkable) {
					//	this.ctx.fillStyle = "rgba(255,0,0,0.5)";
					//	this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, cosp.cellSize, cosp.cellSize);
					//}
					
				}
			}
		}
		
		if(selectedObject !== null) {
			this.ctx.fillStyle = "yellow";
			pGridMovement = selectedObject.getProperty(PGridMovement);
			x = pGridMovement ? pGridMovement.calculatedX : selectedObject.x;
			y = pGridMovement ? pGridMovement.calculatedY : selectedObject.y;
			
			this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, cosp.cellSize, 1);
			this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize, 1, cosp.cellSize);
			this.ctx.fillRect(x * cosp.cellSize, y * cosp.cellSize + cosp.cellSize - 1, cosp.cellSize, 1);
			this.ctx.fillRect(x * cosp.cellSize + cosp.cellSize - 1, y * cosp.cellSize, 1, cosp.cellSize);
		}
	}
	
	Level.prototype.placeSelectedGameObject = function(x, y) {
		if(fogOfWarGrid[y] !== undefined && fogOfWarGrid[y][x] !== undefined && 
		   isPlacingObject === true && fogOfWarGrid[y][x] === 0) {
			var i, j;

			objectToPlace.x = x - Math.floor((objectToPlace.width - 1) / 2);
			objectToPlace.y = y - Math.floor((objectToPlace.height - 1) / 2);
			
			for(i = objectToPlace.y; i < objectToPlace.y + objectToPlace.height; i++)
				for(j = objectToPlace.x; j < objectToPlace.x + objectToPlace.width; j++) {
					if(this.getGameObjectsAt(j, i) !== null)
						return false;
				}
			
			if(this.addGameObject(objectToPlace)){
				isPlacingObject = false;
				//objectToPlace = null;
				
				Game.actions.onInventoryObjectPlaced(objectToPlace);
				return true;
			}
		}
		
		return false;
	}
	
	Level.prototype.onClick = function(e, worldX, worldY) {
		Game.CanvasObject.prototype.onClick.apply(this, [e]);
		
		var x = Math.floor(worldX / cosp.cellSize);
		var y = Math.floor(worldY / cosp.cellSize);
		
		if(fogOfWarGrid[y] !== undefined && fogOfWarGrid[y][x] !== undefined && fogOfWarGrid[y][x] === 2) { //click on darkest fog no select
			this.setSelectedObject(null);
			return;
		}
			
		if(isPlacingObject) {
			this.placeSelectedGameObject(x, y);
		}
		else {
			var objs = this.getGameObjectsAt(x, y);
			
			if(objs !== null)
				this.setSelectedObject(objs[0]);
			else
				this.setSelectedObject(null);
		}
	}
	
	Level.prototype.isGameObjectPlaced = function(gameObject) {
		if(gameObject instanceof GameObject) {
			var i;
			for(i = 0; i < objects.length; i++) {
				if(objects[i] === gameObject)
					return true;
			}
		}
		return false;
	}
	
	Level.prototype.getSelectedObject = function() {
		return selectedObject;
	}
	
	Level.prototype.setSelectedObject = function(gameObject) {
		if(gameObject instanceof GameObject) {
			if(this.isGameObjectPlaced(gameObject)) {
				selectedObject = gameObject;
				Game.actions.onSelectedGameObjectChanged();
				return true;
			}
		}
		else if(gameObject === null) {
			selectedObject = null;
			Game.actions.onSelectedGameObjectChanged();
			return true;
		}
		
		return false;
	}
	
	Level.prototype.togglePlaceObject = function(gameObject) {
		if(gameObject instanceof GameObject) {
			if(!isPlacingObject || (isPlacingObject && gameObject !== objectToPlace)) {
				isPlacingObject = true;
				objectToPlace = gameObject;
				return true;
			}
			else {
				isPlacingObject = false;
				objectToPlace = null;
				return false;
			}
		}
		
		return false;
	}
	
	Game.Level = Level;
})();

(function() {
	var resources = {
		science : new Decimal(0),
		stone : new Decimal(0),
		copper : new Decimal(0),
		tin : new Decimal(0),
		iron : new Decimal(0)
	}
	
	var inventory = [];
	
	function Player() {
	
	}
	
	Player.prototype.addResource = function(resourceName, val) {
		if(typeof resources[resourceName] !== "undefined") {
			resources[resourceName] = resources[resourceName].plus(val);
			return true;
		}
		return false;
	}
	
	Player.prototype.addGameObjectToInventory = function(gameObject) {
		if(gameObject instanceof GameObject) {
			var p = gameObject.getProperty(PPlayerUnit);
			
			if(p) {
				var i;
				for(i = 0; i < inventory.length; i++) {
					if(gameObject === inventory[i])
						return false;
				}
				p.id = inventory.length;
				inventory.push(gameObject);
				
				Game.actions.onInventoryChanged();
				return true;
			}
		}
		
		return false;
	}
	
	Player.prototype.getResources = function() {
		return {
			science : resources.science.toNumber(),
			stone : resources.stone.toNumber(),
			copper : resources.copper.toNumber(),
			tin : resources.tin.toNumber(),
			iron : resources.iron.toNumber()
		}
	}
	
	Player.prototype.getInventory = function() {
		return inventory;
	}
	
	Game.Player = Player;
})();

(function() {
	function Binding() {
		this.key = null;
		this.keyAlt = null;
	}
	
	var keybinds = {}; //Binding{}
	var keysDown = []; //[]
	
	function onKeyDown(e) {
		if(!keysDown.includes(e.keyCode))
			keysDown.push(e.keyCode)
	}
	
	function onKeyUp(e) {
		var index = keysDown.indexOf(e.keyCode);
		if(index > -1)
			keysDown.splice(index, 1);
	}
	
	function KeyInputManager() {
		if(!Game.KeyInputManager.instance) {
			
		}
		else return null;
		
		this.Key = {
			Shift: 16,
			A: 65,
			B: 66,
			C: 67,
			D: 68,
			E: 69,
			F: 70,
			G: 71,
			H: 72,
			I: 73,
			J: 74,
			K: 75,
			L: 76,
			M: 77,
			N: 78,
			O: 79,
			P: 80,
			Q: 81,
			R: 82,
			S: 83,
			T: 84,
			U: 85,
			V: 86,
			W: 87,
			X: 88,
			Y: 89,
			Z: 90
		}
		Object.freeze(this.Key);
		
		document.addEventListener("keydown", onKeyDown.bind(this));
		document.addEventListener("keyup", onKeyUp.bind(this));
		
		Game.KeyInputManager.instance = this;
	}
	
	KeyInputManager.prototype.changeKeybind = function(name, key, isAlt) {
		if(keybinds[name] === undefined) {
			keybinds[name] = new Binding();
		}
		
		if(isAlt)
			keybinds[name].keyAlt = key;
		else
			keybinds[name].key = key;
	}
	
	KeyInputManager.prototype.getKeybind = function(name, isAlt) {
		if(keybinds[name] === undefined) {
			return null;
		}
		
		if(isAlt)
			return keybinds[name].keyAlt;
		else
			return keybinds[name].key;
	}
	
	KeyInputManager.prototype.getButtonDown = function(name) {
		if(keybinds[name] === undefined) {
			return false;
		}
		
		return keysDown.includes(keybinds[name].key) || keysDown.includes(keybinds[name].keyAlt);
	}
	
	Game.KeyInputManager = KeyInputManager;
	Game.KeyInputManager.instance = new Game.KeyInputManager();
})();

(function() {
	var textOwnedScience = document.getElementById("text_owned_science");
	var textOwnedStone = document.getElementById("text_owned_stone");
	var textOwnedCopper = document.getElementById("text_owned_copper");
	var textOwnedTin = document.getElementById("text_owned_tin");
	
	var buttonUseFog = document.getElementById("button_use_fog"); 
	
	var buttonNewLevel16 = document.getElementById("button_new_level_16");
	var buttonNewLevel32 = document.getElementById("button_new_level_32");
	var buttonNewLevel64 = document.getElementById("button_new_level_64");
	var buttonNewLevel128 = document.getElementById("button_new_level_128");
	var buttonNewLevel256 = document.getElementById("button_new_level_256");
	var buttonNewLevel512 = document.getElementById("button_new_level_512");
	var buttonNewLevel1024 = document.getElementById("button_new_level_1024");
	
	var buttonDrawDebug = document.getElementById("button_draw_debug");
	var buttonToggleCamera = document.getElementById("button_toggle_camera");
	
	var containerSelectionDescription = document.getElementById("container_selection_description");
	var containerInventory = document.getElementById("container_inventory");
	var containerSelectionUpgrades = document.getElementById("container_selection_upgrades");
	
	var arrInventory = [];
	
	var settings = null;
	var level = null;
	var player = null;
	
	function UI(_settings, _level, _player) {
		settings = _settings;
		level = _level;
		player = _player;
	}
	
	UI.prototype.update = function() {
		var i, str = "";
		
		var resources = player.getResources();
		textOwnedScience.innerHTML = resources.science;
		textOwnedStone.innerHTML = resources.stone;
		textOwnedCopper.innerHTML = resources.copper;
		textOwnedTin.innerHTML = resources.tin;
		
		var obj = level.getSelectedObject();
		if(obj) {
			if(obj instanceof GameObject) {
				str += obj.name + " (" + obj.x + "," + obj.y + ") w:" + obj.width + " h:" + obj.height + "<br><br>";
				
				var p, i;
				p = obj.getProperty(PPlayerUnit);
				if(p) {
					str += "Clear fog radius: " + p.fogOfWarRadius + "<br><br>";
				}
				
				if(obj instanceof Ore) {
					p = obj.getProperty(POreResources);
					str += "Contains:<br>";
					for(i = 0; i < p.oreResources.length; i++) {
						str += p.oreResources[i].labelName + ": " + p.oreResources[i].amtCur.toNumber() + "/" + p.oreResources[i].amtMax.toNumber() + "<br>";
						
					}
				}
				else if(obj instanceof Proxy) {
					var ore;
					
					str += "Speed: " + (Math.round(obj.speed * 100) / 100) + " cells/s<br>"; //TODO prettify
					str += "Mining speed: " + (Math.round(obj.miningSpeed * 100) / 100) + "/s<br>"; //TODO prettify
					str += "State: " + obj.getProperty(PProxyAI).state + "<br><br>";
					p = obj.getProperty(POreBuffer);
					str += "Stored ore: " + p.bufferCount.toNumber() + "/" + p.bufferMax.toNumber() + "<br>";
					for(ore in p.buffer) {
						str += ore + ": " + p.buffer[ore].toNumber() + "<br>";
					}
				}
			}
		}
		
		containerSelectionDescription.innerHTML = str;
	}
	
	UI.prototype.resetInventoryButtonColors = function() {
		var inventory = player.getInventory();
		var i;
		var l = inventory.length;
		for(i = 0; i < l; i++) {
			if(level.isGameObjectPlaced(inventory[i]))
				GameUtil.swapClass("btn-col-", "btn-col-disabled", arrInventory[i]);
			else
				GameUtil.swapClass("btn-col-", "btn-col-default", arrInventory[i]);
		}
	}
	
	UI.prototype.onInventoryObjectPlaced = function(object) {
		if(!(object instanceof GameObject))
			return;
		
		this.resetInventoryButtonColors();
		
		level.setSelectedObject(object); //TODO decide if this should be kept
		
		if(Game.KeyInputManager.instance.getButtonDown("placeMultiple")) {
			var inventory = player.getInventory();
			var i;
			var l = inventory.length;
			for(i = 0; i < l; i++) {
				if(object.constructor.name === inventory[i].constructor.name &&
				   object.getProperty(PPlayerUnit) && inventory[i].getProperty(PPlayerUnit) &&
				   object.getProperty(PPlayerUnit).team === inventory[i].getProperty(PPlayerUnit).team) {
					if(!level.isGameObjectPlaced(inventory[i])) {
						GameUtil.swapClass("btn-col-", "btn-col-selected", arrInventory[i]);
						level.togglePlaceObject(inventory[i]);
						break;
					}
				}
			}
		}
	}
	
	UI.prototype.onInventoryChanged = function() {
		var inventory = player.getInventory();
		var i, j;
		
		arrInventory.splice(0, arrInventory.length);

		for(i = containerInventory.children.length - 1; i >= 0; i--) {
			containerInventory.children[i].onmousedown = null;
			containerInventory.removeChild(containerInventory.children[i]);
		}
		
		for(i = 0; i < inventory.length; i++) {
			var object = inventory[i];
			var elem = document.createElement("div");
			elem.className = "btn btn-inventory btn-col-default btn-border-default";
			arrInventory[i] = elem;
			
			if(object.image) {
				var img = document.createElement("img");
				img.src = object.image.src;
				elem.appendChild(img);
			}
			elem.onmousedown = (function(o){
				var that = this;
				return function setObject() {
					if(!level.setSelectedObject(o)) {
						that.resetInventoryButtonColors();
						
						if(level.togglePlaceObject(o)) {
							GameUtil.swapClass("btn-col-", "btn-col-selected", this);
						}
						else {
							GameUtil.swapClass("btn-col-", "btn-col-default", this);
						}
					}
				};
			}).bind(this)(object);
			containerInventory.appendChild(elem);
		}
	}
	
	UI.prototype.onSelectedGameObjectChanged = function() {
		var i, l;
		var inventory = player.getInventory();
		for(i = containerSelectionUpgrades.children.length - 1; i >= 0; i--) {
			containerSelectionUpgrades.children[i].onmousedown = null;
			containerSelectionUpgrades.removeChild(containerSelectionUpgrades.children[i]);
		}
		
		l = arrInventory.length;
		for(i = 0; i < l; i++) {
			GameUtil.swapClass("btn-border-", "btn-border-default", arrInventory[i]);
		}
		
		var obj = level.getSelectedObject();
		if(obj === null)
			return;
		
		if(inventory.indexOf(obj) > -1)
			GameUtil.swapClass("btn-border-", "btn-border-selected", arrInventory[inventory.indexOf(obj)]);
		
		var p = obj.getProperty(PUpgradesProxy);
		var upgrade;
		if(p) {
			for(upgrade in p.upgradesInfo) {
				if(typeof p.upgradesPurchased[upgrade] !== "undefined" && typeof obj[upgrade] !== "undefined") {
					var node = document.createElement("div");
					node.className = "btn btn-col-default";
					node.innerHTML = "Upgrade " + p.upgradesInfo[upgrade].name;
					node.onmousedown = (function(upgrade){
						return function(){
							p.upgrade(upgrade);
						}
					})(upgrade);
					containerSelectionUpgrades.appendChild(node);
					containerSelectionUpgrades.appendChild(document.createElement("br"));
				}
			}
		}
	}
	
	buttonNewLevel16.addEventListener("click", function(){
		level.generateNew(16, 16, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel32.addEventListener("click", function(){
		level.generateNew(32, 32, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel64.addEventListener("click", function(){
		level.generateNew(64, 64, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel128.addEventListener("click", function(){
		level.generateNew(128, 128, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel256.addEventListener("click", function(){
		level.generateNew(256, 256, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel512.addEventListener("click", function(){
		level.generateNew(512, 512, !settings.isUseFog);
		onResize();
	});
	buttonNewLevel1024.addEventListener("click", function(){
		level.generateNew(1024, 1024, !settings.isUseFog);
		onResize();
	});
	buttonUseFog.addEventListener("click", function() {
		settings.isUseFog = !settings.isUseFog;
		
		if(settings.isUseFog)
			GameUtil.swapClass("btn-col-", "btn-col-selected", this);
		else
			GameUtil.swapClass("btn-col-", "btn-col-default", this);
	});
	buttonToggleCamera.addEventListener("click", function() {
		settings.isUseCamera = !settings.isUseCamera;
		if(settings.isUseCamera)
			GameUtil.swapClass("btn-col-", "btn-col-selected", this);
		else
			GameUtil.swapClass("btn-col-", "btn-col-default", this);
	});
	buttonDrawDebug.addEventListener("click", function() {
		settings.isDrawDebug = !settings.isDrawDebug;
		if(settings.isDrawDebug)
			GameUtil.swapClass("btn-col-", "btn-col-selected", this);
		else
			GameUtil.swapClass("btn-col-", "btn-col-default", this);
	});
	
	Game.UI = UI;
})();

(function() {
	var isLoaded = false;
	
	function Assets() {
		
	}
	
	Assets.load = function(callback) {
		if(isLoaded)
			return false;
		
		isLoaded = true;
		
		var loader = new PxLoader();
		
		Assets.imgOre_stone_large = loader.addImage("images/ore-stone-large.png");
		Assets.imgOre_stone_medium = loader.addImage("images/ore-stone-medium.png");
		Assets.imgOre_stone_small = loader.addImage("images/ore-stone-small.png");
		Assets.imgOre_stone_tiny = loader.addImage("images/ore-stone-tiny.png");
		
		Assets.imgOre_copper_large = loader.addImage("images/ore-copper-large.png");
		Assets.imgOre_copper_medium = loader.addImage("images/ore-copper-medium.png");
		Assets.imgOre_copper_small = loader.addImage("images/ore-copper-small.png");
		Assets.imgOre_copper_tiny = loader.addImage("images/ore-copper-tiny.png");
		
		Assets.imgOre_tin_large = loader.addImage("images/ore-tin-large.png");
		Assets.imgOre_tin_medium = loader.addImage("images/ore-tin-medium.png");
		Assets.imgOre_tin_small = loader.addImage("images/ore-tin-small.png");
		Assets.imgOre_tin_tiny = loader.addImage("images/ore-tin-tiny.png");
		
		Assets.imgOre_copper = loader.addImage("images/ore-copper.png");
		Assets.imgOre_tin = loader.addImage("images/ore-tin.png");
		
		Assets.imgParticle_stone = loader.addImage("images/particle-stone.png");
		Assets.imgParticle_copper = loader.addImage("images/particle-copper.png");
		Assets.imgParticle_tin = loader.addImage("images/particle-tin.png");
		
		Assets.imgProxy = loader.addImage("images/proxy-top.png");
		Assets.imgProxyEnemy = loader.addImage("images/proxy-enemy-top.png");
		Assets.imgProxyEnemy2 = loader.addImage("images/proxy-enemy2-top.png");
		Assets.imgParticleCopper = loader.addImage("images/particle-copper.png");
		Assets.imgStash = loader.addImage("images/stash.png");
		Assets.imgStashEnemy = loader.addImage("images/stash-enemy.png");
		Assets.imgStashEnemy2 = loader.addImage("images/stash-enemy2.png");
		Assets.imgWall = loader.addImage("images/wall.png");
		
		loader.addProgressListener(function(e) {
			console.log(e.completedCount + ' / ' + e.totalCount);
		});
		loader.addCompletionListener(function() {
			callback();
		});
		
		loader.start();
	}
	
	Game.Assets = Assets;
})();

(function() {
	var width = 20;
	var height = 20;
	var i;
	
	var startTime = null;
	var sessionClock = 0;
	
	var fixedUpdateClock = 0;
	var fixedUpdateInterval = 1000 / 60;
	
	var fps = 0;
	
	var isPaused = false;
	
	Game.KeyInputManager.instance.changeKeybind("placeMultiple", 	Game.KeyInputManager.instance.Key.Shift, 	false);
	Game.KeyInputManager.instance.changeKeybind("left", 			Game.KeyInputManager.instance.Key.A, 		false);
	Game.KeyInputManager.instance.changeKeybind("right", 			Game.KeyInputManager.instance.Key.D, 		false);
	Game.KeyInputManager.instance.changeKeybind("up", 				Game.KeyInputManager.instance.Key.W, 		false);
	Game.KeyInputManager.instance.changeKeybind("down", 			Game.KeyInputManager.instance.Key.S, 		false);
	
	var cosp = new Game.CanvasObjectSharedProperties();
	var canvasObjectManager = new Game.CanvasObjectManager(cosp, settings);
	
	var player = new Game.Player();
	var enemy = new Game.Player();
	
	var particles = new Game.Particles(cosp);
	var highlight = new Game.Highlight(cosp);
	var level = new Game.Level(particles, player, cosp);
	
	canvasObjectManager.addCanvasObject(level);
	canvasObjectManager.addCanvasObject(particles);
	canvasObjectManager.addCanvasObject(highlight);
	
	var settings = {
		isDrawDebug : false,
		isUseFog : true,
		get isUseCamera() {
			return canvasObjectManager.getCameraToggled();
		},
		set isUseCamera(bool) {
			return canvasObjectManager.toggleCamera(bool);
		}
	}
	
	var ui = new Game.UI(settings, level, player);
	
	Game.actions = {};
	
	Game.actions.onInventoryObjectPlaced = function(object) {
		ui.onInventoryObjectPlaced(object);
	}
	
	Game.actions.onInventoryChanged = function() {
		ui.onInventoryChanged();
	}
	
	Game.actions.onSelectedGameObjectChanged = function() {
		ui.onSelectedGameObjectChanged();
	}
	
	Game.actions.onResize = function() {
		canvasObjectManager.onResize();
	}
	
	Game.actions.pause = function() {
		isPaused = !isPaused;
	}
	
	Game.debug = {};
	Game.debug.settings = settings;
	Game.debug.level = level;
	Game.debug.particles = particles;
	Game.debug.cosp = cosp;
	Game.debug.player = player;
	
	//////////////////////////////////////////
	
	var fpsElem = document.getElementById("debug_frametime");
	var clockElem = document.getElementById("debug_clock");
	
	console.log("Loading assets");
	Game.Assets.load(onLoaded);
	
	function onLoaded() {
		console.log("Assets loaded");
		
		level.generateNew(16, 16, false);
		onResize();
		
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStash, "Stash", 0, 0, 1, 1, 0)));
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStash, "Stash", 0, 0, 1, 1, 0)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxy, "Proxy", 0, 0, 1, 1, 0, level, particles, player)));
		
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStashEnemy, "Stash", 0, 0, 1, 1, 1)));
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStashEnemy, "Stash", 0, 0, 1, 1, 1)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy, "Proxy", 0, 0, 1, 1, 1, level, particles, enemy)));
		
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStashEnemy2, "Stash", 0, 0, 1, 1, 2)));
		player.addGameObjectToInventory(GameObject.instantiate(new Stash(Game.Assets.imgStashEnemy2, "Stash", 0, 0, 1, 1, 2)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		player.addGameObjectToInventory(GameObject.instantiate(new Proxy(Game.Assets.imgProxyEnemy2, "Proxy", 0, 0, 1, 1, 2, level, particles, enemy)));
		
		setTimeout(begin, 0);
	}
	
	function begin() {
		window.requestAnimationFrame(gameLoop);
	}
	
	function gameLoop(timestamp) {
		window.requestAnimationFrame(gameLoop);
		
		if(!startTime) startTime = timestamp - (1000 / 60);
		var dif = (timestamp - startTime) - sessionClock;
		fixedUpdateClock += dif;
		
		/*while(fixedUpdateClock >= fixedUpdateInterval) {
			act(fixedUpdateInterval);
			fixedUpdateClock -= fixedUpdateInterval;
		}*/
		act(dif > 1000 ? 1000 : dif);
		
		draw();
		
		sessionClock += dif;
		fps = (fps * 0.9) + ((1000 / dif) * (1.0 - 0.9));

		fpsElem.innerHTML = Math.round(fps);
		clockElem.innerHTML = GameUtil.getMsAsFormattedString(sessionClock);
		
		ui.update();
	}
	
	function act(frameTime) {
		canvasObjectManager.act(frameTime);
	}
	
	function draw() {
		canvasObjectManager.draw();
		
		if(settings.isDrawDebug) {
			var objects = level.getGameObjectsOfClass(Proxy);
			for(i = 0; i < objects.length; i++) {
				var mov = objects[i].properties.pGridMovement;
				var cellSize = cosp.cellSize;
				if(objects[i].properties.pOreMiner.isMining) {
					level.ctx.fillStyle = "rgba(40, 40, 200, 0.5)";
					level.ctx.fillRect(mov.calculatedX * cellSize, mov.calculatedY * cellSize, objects[i].width * cellSize, objects[i].height * cellSize);
				}
				else if(objects[i].properties.pOreBufferUnloader.isUnloading) {
					level.ctx.fillStyle = "rgba(40, 200, 40, 0.5)";
					level.ctx.fillRect(mov.calculatedX * cellSize, mov.calculatedY * cellSize, objects[i].width * cellSize, objects[i].height * cellSize);
				}
				else if(objects[i].properties.pOreBuffer.isFull) {
					level.ctx.fillStyle = "rgba(200, 40, 40, 0.5)";
					level.ctx.fillRect(mov.calculatedX * cellSize, mov.calculatedY * cellSize, objects[i].width * cellSize, objects[i].height * cellSize);
				}
			}
		}
	}
})();


function onResize() {
	if(Game !== undefined && Game !== null) {
		Game.actions.onResize();
	}
}
