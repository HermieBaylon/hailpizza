var gameEngine = new GameEngine();

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./assets/bgtile00.png");
ASSET_MANAGER.queueDownload("./assets/streetlight.png");
ASSET_MANAGER.queueDownload("./assets/streetlight02.png");
ASSET_MANAGER.queueDownload("./assets/fence.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house1.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house2.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house3.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house4.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house5.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house6.png");
ASSET_MANAGER.queueDownload("./assets/buildings/house7.png");
ASSET_MANAGER.queueDownload("./assets/buildings/pool.png");
ASSET_MANAGER.queueDownload("./assets/buildings/court.jpg");
ASSET_MANAGER.queueDownload("./assets/buildings/building.png");
ASSET_MANAGER.queueDownload("./assets/buildings/parasol.png");
ASSET_MANAGER.queueDownload("./assets/buildings/bench.png");
ASSET_MANAGER.queueDownload("./assets/buildings/bench2.png");
ASSET_MANAGER.queueDownload("./assets/buildings/roof.png");

ASSET_MANAGER.queueDownload("./assets/npcs.png");
ASSET_MANAGER.queueDownload("./assets/npccars.png");

ASSET_MANAGER.queueDownload("./assets/driver.png");
ASSET_MANAGER.queueDownload("./assets/drivercar.png");

ASSET_MANAGER.queueDownload("./assets/exhaustflame.png");
ASSET_MANAGER.queueDownload("./assets/health.PNG");

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	var streetlight = new Streetlight(gameEngine, 116, 104);

	// Background
	var bgTiles = [];
	for (var i = 0; i <= 2; i++) {
		for (var j = 0; j <= 2; j++) {
			bgTiles.push(new Background(gameEngine, i * PARAMS.TILE_WIDTH, j * PARAMS.TILE_WIDTH));		
		}
	}
	

	var buildings = [];
	buildings.push(new House1(gameEngine, 0, 0));
	buildings.push(new House1(gameEngine, 530, 0));
	buildings.push(new House2(gameEngine, 180, 580));
	buildings.push(new House3(gameEngine, 180, 10));
	buildings.push(new House4(gameEngine, 330, 0));
	buildings.push(new House4(gameEngine, 370, 600));
	buildings.push(new House4(gameEngine, 540, 600));
	buildings.push(new House4(gameEngine, 320, 260));
	buildings.push(new House5(gameEngine, 700, 0));
	buildings.push(new House6(gameEngine, 880, 20));
	buildings.push(new House7(gameEngine, 800, 430));
	buildings.push(new Pool(gameEngine, 100, 380));
	buildings.push(new Court(gameEngine, 800, 325));
	buildings.push(new Building(gameEngine, 10, 275));

	var nonBuildings = [];
	nonBuildings.push(new Bench(gameEngine, 200, 280));
	nonBuildings.push(new Bench(gameEngine, 100, 280));
	nonBuildings.push(new Bench2(gameEngine, 200, 330));
	nonBuildings.push(new Bench2(gameEngine, 100, 330));
	nonBuildings.push(new Roof(gameEngine, 215, 295));
	nonBuildings.push(new Roof(gameEngine, 115, 295));
	nonBuildings.push(new Fence(gameEngine, 128, 600));
	nonBuildings.push(new Fence(gameEngine, 128-65, 600));
	nonBuildings.push(new Fence(gameEngine, 128+65, 600));
	nonBuildings.push(new Fence(gameEngine, 128-2*65, 600));
	nonBuildings.push(new Parasol(gameEngine, 680, 370));
	nonBuildings.push(new Parasol(gameEngine, 145, 280));

	// NPCs
	var npccars = [];
	npccars.push(new Car(gameEngine, 160, 288, 0, 0));
	npccars.push(new Car(gameEngine, 96, 322, 1, 0));

	var npcs = [];
	npcs.push(new Pedestrian(gameEngine, 224, 576, 1, 0));
	npcs.push(new Pedestrian(gameEngine, 544, 696, 0, 180));
	npcs.push(new Pedestrian(gameEngine, 224, 224, 1, 0));
	
	// Player
	var driver = new Driver(gameEngine, 224, 544);
	var drivercar = new DriverCar(gameEngine, 32, 288);

	///// Draw all entities 
	gameEngine.init(ctx);
	for (var i = 0; i < bgTiles.length; i++) {
		gameEngine.addEntity(bgTiles[i]);
	}
	// NPCs
	for (var i = 0; i < npccars.length; i++)
	{
		gameEngine.addEntity(npccars[i]);
	}
	for (var i = 0; i < npcs.length; i++)
	{
		gameEngine.addEntity(npcs[i]);
	}

	for (var i = 0; i < buildings.length; i++) {
		//gameEngine.addEntity(buildings[i]);
	}

	for (var i = 0; i < nonBuildings.length; i++) {
		//gameEngine.addEntity(nonBuildings[i]);
	}
	
	// Player
	gameEngine.addEntity(driver);
	gameEngine.addEntity(drivercar);
	
	new SceneManager(gameEngine);
	new AudioManager(gameEngine);
	
	gameEngine.start();
});
