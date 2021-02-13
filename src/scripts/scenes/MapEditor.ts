import 'phaser';
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';
import PositionText from '../drawables/ui/PositionText';
import globalState from '../worldstate';

const TILE_SPACING = 2;

const DEFAULT_TILE = 32;
const DEFAULT_DECORATION_TILE = 0;
const DEFAULT_OVERLAY_TILE = 0;

const CAMERA_MOVEMENT_PER_FRAME = 10;

const ROOM_DEFAULT_WIDTH = 8;
const ROOM_DEFAULT_HEIGHT = 8;

const DEPTHS = {
	baseLayer: 1,
	decorationLayer: 2,
	overlayLayer: 3,
	backgroundLibraryLayer: 4,
	libraryTileLayer: 5,
	libraryHighlighting: 6
};

// The main scene handles the actual game play.
export default class MapEditor extends Phaser.Scene {
	roomName: string = '';

	tileSetName: string = 'dungeon';
	roomLayout: number[][] = [];

	decorationTileSetName: string = 'dungeon';
	roomDecorationLayout: number[][] = [];

	overlayTileSetName: string = 'dungeon';
	roomOverlayLayout: number[][] = [];

	roomWidth = 8;
	roomHeight = 8;
	selectedId = 32;

	tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	decorationTileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	overlayTileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	libraryLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	backgroundLibraryLayer: Phaser.Tilemaps.DynamicTilemapLayer;

	mapEditorHighlighting: Phaser.GameObjects.Image;

	wKey: Phaser.Input.Keyboard.Key;
	aKey: Phaser.Input.Keyboard.Key;
	sKey: Phaser.Input.Keyboard.Key;
	dKey: Phaser.Input.Keyboard.Key;
	tKey: Phaser.Input.Keyboard.Key;

	cameraPositionX: number = 0;
	cameraPositionY: number = 0;

	positionText: PositionText;

	mapEditorMenuElement: HTMLDivElement;
	roomsDropdownElement: HTMLSelectElement;
	tilesetDropdownElement: HTMLSelectElement;
	tilesetDecorationDropdownElement: HTMLSelectElement;
	tilesetOverlayDropdownElement: HTMLSelectElement;
	loadButtonElement: HTMLButtonElement;
	roomNameElement: HTMLInputElement;
	roomHeightElement: HTMLInputElement;
	roomWidthElement: HTMLInputElement;
	exportButtonElement: HTMLButtonElement;
	activeLayerDropdownElement: HTMLSelectElement;

	wasTKeyDown: boolean = false;
	isLibraryVisible: boolean = false;

	constructor() {
		super({ key: 'MapEditor' });
		this.mapEditorMenuElement = document.getElementById('mapEditorMenu') as HTMLDivElement;
		this.roomsDropdownElement = document.getElementById('roomDropdown') as HTMLSelectElement;
		this.tilesetDropdownElement = document.getElementById('tilesetDropdown') as HTMLSelectElement;
		this.tilesetDecorationDropdownElement =
			document.getElementById('tilesetDecorationDropdown') as HTMLSelectElement;
		this.tilesetOverlayDropdownElement =
			document.getElementById('tilesetOverlayDropdown') as HTMLSelectElement;
		this.loadButtonElement = document.getElementById('loadRoomButton') as HTMLButtonElement;
		this.roomNameElement = document.getElementById('roomName') as HTMLInputElement;
		this.roomHeightElement = document.getElementById('roomHeight') as HTMLInputElement;
		this.roomWidthElement = document.getElementById('roomWidth') as HTMLInputElement;
		this.exportButtonElement = document.getElementById('exportButton') as HTMLButtonElement;
		this.activeLayerDropdownElement =
			document.getElementById('activeLayerDropdown') as HTMLSelectElement;
	}

	create() {
		this.positionText = new PositionText(this);
		this.mapEditorMenuElement.style.display = 'flex';

		this.mapEditorHighlighting = 
			new Phaser.GameObjects.Image(this, 8, 8, 'map-editor-highlighting');
		this.mapEditorHighlighting.setDepth(DEPTHS.libraryHighlighting);
		this.mapEditorHighlighting.setScrollFactor(0, 0);
		this.mapEditorHighlighting.alpha = 0.5;
		this.add.existing(this.mapEditorHighlighting);

		while (this.roomsDropdownElement.firstChild) {
			this.roomsDropdownElement.remove(0);
		}

		Object.keys(globalState.availableRooms).forEach((roomName) => {
			const newOption = document.createElement('option');
			newOption.value = roomName;
			newOption.innerText = roomName;
			this.roomsDropdownElement.appendChild(newOption);
		});

		// Prepare Base Tileset dropdown
		while (this.tilesetDropdownElement.firstChild) {
			this.tilesetDropdownElement.remove(0);
		}

		globalState.availableTilesets.forEach((tileset) => {
			const newOption = document.createElement('option');
			newOption.value = tileset;
			newOption.innerText = tileset;
			this.tilesetDropdownElement.appendChild(newOption);
		});

		// Prepare Decoration Tileset dropdown
		while (this.tilesetDecorationDropdownElement.firstChild) {
			this.tilesetDecorationDropdownElement.remove(0);
		}

		globalState.availableTilesets.forEach((tileset) => {
			const newOption = document.createElement('option');
			newOption.value = tileset;
			newOption.innerText = tileset;
			this.tilesetDecorationDropdownElement.appendChild(newOption);
		});

		// Prepare Overlay Tileset dropdown
		while (this.tilesetOverlayDropdownElement.firstChild) {
			this.tilesetOverlayDropdownElement.remove(0);
		}

		globalState.availableTilesets.forEach((tileset) => {
			const newOption = document.createElement('option');
			newOption.value = tileset;
			newOption.innerText = tileset;
			this.tilesetOverlayDropdownElement.appendChild(newOption);
		});

		this.loadButtonElement.onclick = () => {
			const roomName = this.roomsDropdownElement.value;

			const selectedRoom = globalState.availableRooms[roomName]!;
			this.roomNameElement.value = selectedRoom.name;

			this.tilesetDropdownElement.value = selectedRoom.tileset;
			this.tilesetDecorationDropdownElement.value = selectedRoom.decorationTileset ?
				selectedRoom.decorationTileset :
				this.tilesetDecorationDropdownElement.options[0].value;
			this.tilesetOverlayDropdownElement.value = selectedRoom.overlayTileset ?
				selectedRoom.overlayTileset :
				this.tilesetOverlayDropdownElement.options[0].value;

			this.roomHeightElement.value = `${selectedRoom.layout.length}`;
			this.roomWidthElement.value = `${selectedRoom.layout[0].length}`;

			this.roomLayout = [];
			this.roomDecorationLayout = [];
			this.roomOverlayLayout = [];

			this.applyConfiguration();

			for (let y = 0; y < selectedRoom.layout.length; y++) {
				for (let x = 0; x < selectedRoom.layout[y].length; x++) {
					this.roomLayout[y][x] = selectedRoom.layout[y][x];
					this.roomDecorationLayout[y][x] = selectedRoom.decorations ?
						selectedRoom.decorations[y][x] :
						0;
					this.roomOverlayLayout[y][x] = selectedRoom.overlays ?
						selectedRoom.overlays[y][x] :
						0;

					const tile = this.tileLayer.getTileAt(x, y);
					if (tile) {
						tile.index = selectedRoom.layout[y][x];
					}

					const decorationTile = this.decorationTileLayer?.getTileAt(x, y);
					if (decorationTile) {
						decorationTile.index = this.roomDecorationLayout[y][x];
						decorationTile.visible = this.roomDecorationLayout[y][x] !== 0;
					}

					const overlayTile = this.overlayTileLayer?.getTileAt(x, y);
					if (overlayTile) {
						overlayTile.index = this.roomOverlayLayout[y][x];
						overlayTile.visible = this.roomOverlayLayout[y][x] !== 0;
					}
				}
			}
		};

		const goButtonElement = document.getElementById('goButton') as HTMLButtonElement;
		goButtonElement.onclick = () => {
			this.applyConfiguration();
		};
		this.applyConfiguration();

		this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false);
		this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
		this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
		this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
		this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T, false);
		
		this.exportButtonElement.onclick = () => {
			const roomNameValue = this.roomNameElement.value;

			const tilesetValue = this.tilesetDropdownElement.value;
			const decorationTilesetValue = this.tilesetDecorationDropdownElement.value;
			const overlayTilesetValue = this.tilesetOverlayDropdownElement.value;

			let fileRows = '{\n' +
				`\t"name": "${roomNameValue}",\n` +
				`\t"tileset": "${tilesetValue}",\n` +
				`\t"decorationTileset": "${decorationTilesetValue}",\n` +
				`\t"overlayTileset": "${overlayTilesetValue}",\n` +
				`\t"openings": [],\n` +
				`\t"layout": [\n`;
			this.roomLayout.forEach((row, index) => {
				fileRows +=
					`\t\t${JSON.stringify(row)}${index < this.roomLayout.length -1 ? ',' : ''}\n`;
			});
			fileRows += `],\n\t"decorations": [\n`;
			this.roomDecorationLayout.forEach((row, index) => {
				fileRows +=
					`\t\t${JSON.stringify(row)}${index < this.roomDecorationLayout.length -1 ? ',' : ''}\n`;
			});
			fileRows += `],\n\t"overlays": [\n`;
			this.roomOverlayLayout.forEach((row, index) => {
				fileRows +=
					`\t\t${JSON.stringify(row)}${index < this.roomOverlayLayout.length -1 ? ',' : ''}\n`;
			});
			fileRows += `],\n` +
				`\t"npcs": [],\n` +
				`\t"items": [],\n` +
				`\t"scripts": {}\n` +
				`}`;

			const dataStr = 'data:text/json;charset=utf-8,' +
				encodeURIComponent(fileRows);
			const dlAnchorElem = document.getElementById('downloadAnchorElem') as HTMLLinkElement;
			dlAnchorElem.setAttribute('href', dataStr);
			dlAnchorElem.setAttribute('download', `${roomNameValue}.json`);
			dlAnchorElem.click();
		};

		this.activeLayerDropdownElement.onchange = () => {
			const activeLayerValue = this.activeLayerDropdownElement.value;
			if (activeLayerValue === 'base') {
				this.tileLayer.setInteractive();
				this.decorationTileLayer.removeInteractive();
				this.overlayTileLayer.removeInteractive();
			} else if (activeLayerValue === 'decoration') {
				this.tileLayer.removeInteractive();
				this.decorationTileLayer.setInteractive();
				this.overlayTileLayer.removeInteractive();
			} else if (activeLayerValue === 'overlay') {
				this.tileLayer.removeInteractive();
				this.decorationTileLayer.removeInteractive();
				this.overlayTileLayer.setInteractive();
			}			
			this.drawTileSet();
		};
	}

	applyConfiguration() {
		const roomNameValue = this.roomNameElement.value;
		this.roomName = roomNameValue;

		this.tileSetName = this.tilesetDropdownElement.value;
		this.decorationTileSetName = this.tilesetDecorationDropdownElement.value;
		this.overlayTileSetName = this.tilesetOverlayDropdownElement.value;
		const roomWidthValue = parseInt(this.roomWidthElement.value, 10) || ROOM_DEFAULT_WIDTH;
		const roomWidth = roomWidthValue > 0 ? roomWidthValue : ROOM_DEFAULT_WIDTH;
		this.roomWidth = roomWidth;
		const roomHeightValue = parseInt(this.roomHeightElement.value, 10) || ROOM_DEFAULT_HEIGHT;
		const roomHeight = roomHeightValue > 0 ? roomHeightValue : ROOM_DEFAULT_HEIGHT;
		this.roomHeight = roomHeight;

		const newRoomLayout: number[][] = [];
		const newRoomDecorationLayout: number[][] = [];
		const newRoomOverlayLayout: number[][] = [];
		for (let y = 0; y < roomHeight; y++) {
			newRoomLayout[y] = [];
			newRoomDecorationLayout[y] = [];
			newRoomOverlayLayout[y] = [];
			for (let x = 0; x < roomWidth; x++) {
				newRoomLayout[y][x] = this.roomLayout[y] ?
					(this.roomLayout[y][x] || DEFAULT_TILE) :
					DEFAULT_TILE;
				newRoomDecorationLayout[y][x] = this.roomDecorationLayout[y] ?
					(this.roomDecorationLayout[y][x] || DEFAULT_DECORATION_TILE) :
					DEFAULT_DECORATION_TILE;
				newRoomOverlayLayout[y][x] = this.roomOverlayLayout[y] ?
					(this.roomOverlayLayout[y][x] || DEFAULT_OVERLAY_TILE) :
					DEFAULT_OVERLAY_TILE;
			}
		}
		this.roomLayout = newRoomLayout;
		this.roomDecorationLayout = newRoomDecorationLayout;
		this.roomOverlayLayout = newRoomOverlayLayout;

		this.drawTileSet();
		this.drawRoom();
	
	}

	drawTileSet() {
			if (this.libraryLayer) {
				this.libraryLayer.destroy(true);
			}
			if (this.backgroundLibraryLayer) {
				this.backgroundLibraryLayer.destroy(true);
			}
			let tileSetName: string;
			let backgroundTileSetName: string;
			switch (this.activeLayerDropdownElement.value) {
				case 'decoration': {
					tileSetName = this.decorationTileSetName;
					backgroundTileSetName = 'decoration-background';
					break;
				}
				case 'overlay': {
					tileSetName = this.overlayTileSetName;
					backgroundTileSetName = 'overlay-background';
					break;
				}
				case 'base':
				default: {
					tileSetName = this.tileSetName;
					backgroundTileSetName = 'base-background';
					break;
				}
			}

			const tileSetImage = this.textures.get(tileSetName).source[0];
			const backgroundTileSetImage = this.textures.get(backgroundTileSetName).source[0];
			const imageWidth = tileSetImage.width;
			const imageHeight = tileSetImage.height;
			const widthInTiles = Math.ceil(imageWidth / (TILE_WIDTH + TILE_SPACING));
			const heightInTiles = Math.ceil(imageHeight / (TILE_HEIGHT + TILE_SPACING));

			const data: number[][] = [];
			const backgroundData: number[][] = [];

			for (let y = 0; y < heightInTiles; y++) {
				data[y] = [];
				backgroundData[y] = [];
				for (let x = 0; x < widthInTiles; x++) {
					data[y][x] = y * widthInTiles + x;
					// backgroundData repeats for every line, so we only care about the x, not the y position
					backgroundData[y][x] = x;
				}
			}
			const map = this.make.tilemap({
				data,
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_HEIGHT,
			});
			const tileSet = map.addTilesetImage(
				`${tileSetName}-lib`,
				tileSetName,
				TILE_WIDTH,
				TILE_HEIGHT,
				1,
				2
			);
			this.libraryLayer = map.createDynamicLayer(0, tileSet, 0, 0).setInteractive();
			this.libraryLayer.setDepth(DEPTHS.libraryTileLayer);
			this.libraryLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
				this.libraryLayer.forEachTile((tile) => {
					tile.clearAlpha();
				});
				const clickX = pointer.downX - this.libraryLayer.x;
				const clickY = pointer.downY - this.libraryLayer.y;
				const tileX = Math.floor(clickX / TILE_WIDTH);
				const tileY = Math.floor(clickY / TILE_HEIGHT);
				const clickedTile = this.libraryLayer.getTileAt(tileX, tileY);
				if (clickedTile) {
					this.selectedId = clickedTile.index;
					this.mapEditorHighlighting.x = clickedTile.x * TILE_WIDTH + 8;
					this.mapEditorHighlighting.y = clickedTile.y * TILE_HEIGHT + 8;
				}
			});
			this.libraryLayer.setScrollFactor(0, 0);

			const backgroundMap = this.make.tilemap({
				data: backgroundData,
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_HEIGHT,
			});
			const backgroundTileSet = backgroundMap.addTilesetImage(
				`${backgroundTileSetName}-lib`,
				backgroundTileSetName,
				TILE_WIDTH,
				TILE_HEIGHT,
				1,
				2
			);
			this.backgroundLibraryLayer = 
				backgroundMap.createDynamicLayer(0, backgroundTileSet, 0, 0).setInteractive();
			this.backgroundLibraryLayer.setDepth(DEPTHS.backgroundLibraryLayer);
			this.backgroundLibraryLayer.setScrollFactor(0, 0);
	}

	getDataFromClick (
			pointer: {downX: number; downY: number;},
			tileLayer: Phaser.Tilemaps.DynamicTilemapLayer
		) {
		const clickX =
			pointer.downX - this.cameras.main.centerX + this.cameraPositionX - tileLayer.x;
		const clickY =
			pointer.downY - this.cameras.main.centerY + this.cameraPositionY - tileLayer.y;
		const tileX = Math.floor(clickX / TILE_WIDTH);
		const tileY = Math.floor(clickY / TILE_HEIGHT);
		return [
			tileX,
			tileY,
			tileLayer.getTileAt(tileX, tileY)
		] as [number, number, Phaser.Tilemaps.Tile];
	}

	drawRoom() {
		if (this.tileLayer) {
			this.tileLayer.destroy(true);
		}
		if (this.decorationTileLayer) {
			this.decorationTileLayer.destroy(true);
		}
		if (this.overlayTileLayer) {
			this.overlayTileLayer.destroy(true);
		}

		const map = this.make.tilemap({
			data: this.roomLayout,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT
		});
		const tileSet = map.addTilesetImage(
			`${this.tileSetName}-image`,
			this.tileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.tileLayer = map
			.createDynamicLayer(0, tileSet, -map.widthInPixels / 2, -map.heightInPixels / 2)
			.setInteractive();
		this.tileLayer.setDepth(DEPTHS.baseLayer);
		this.tileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			const [tileX, tileY, clickedTile] = this.getDataFromClick(pointer, this.tileLayer);
			this.roomLayout[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				clickedTile.index = this.selectedId;
				this.tileLayer.update();
			}
		});

		const decorationMap = this.make.tilemap({
			data: this.roomDecorationLayout,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT
		});
		const decorationTileSet = decorationMap.addTilesetImage(
			`${this.decorationTileSetName}-image`,
			this.decorationTileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.decorationTileLayer = decorationMap
			.createDynamicLayer(0, decorationTileSet, -map.widthInPixels / 2, -map.heightInPixels / 2);
			// .setInteractive();
		this.decorationTileLayer.setDepth(DEPTHS.decorationLayer);
		this.decorationTileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			const [tileX, tileY, clickedTile] = this.getDataFromClick(pointer, this.decorationTileLayer);
			this.roomDecorationLayout[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				clickedTile.index = this.selectedId;
				clickedTile.setVisible(this.selectedId !== 0);
				this.decorationTileLayer.update();
			}
		});

		const overlayMap = this.make.tilemap({
			data: this.roomDecorationLayout,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT
		});
		const overlayTileSet = overlayMap.addTilesetImage(
			`${this.overlayTileSetName}-image`,
			this.overlayTileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.overlayTileLayer = overlayMap
			.createDynamicLayer(0, overlayTileSet, -map.widthInPixels / 2, -map.heightInPixels / 2);
			// .setInteractive();
		this.overlayTileLayer.setDepth(DEPTHS.overlayLayer);
		this.overlayTileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			const [tileX, tileY, clickedTile] = this.getDataFromClick(pointer, this.overlayTileLayer);
			this.roomOverlayLayout[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				clickedTile.index = this.selectedId;
				clickedTile.setVisible(this.selectedId !== 0);
				this.overlayTileLayer.update();
			}
		});

		for (let y = 0; y < this.roomHeight; y++) {
			for (let x = 0; x < this.roomWidth; x++) {
				const decorationTile = this.decorationTileLayer.getTileAt(x, y);
				if (decorationTile) {
					decorationTile.setVisible(decorationTile.index !== 0);
				}
				const overlayTile = this.overlayTileLayer.getTileAt(x, y);
				if (overlayTile) {
					overlayTile.setVisible(overlayTile.index !== 0);
				}
			}
		}

		this.decorationTileLayer.update();
		this.overlayTileLayer.update();
	}

	renderDebugGraphics() {
		// tslint:disable: no-magic-numbers
		const debugGraphics = this.add.graphics().setAlpha(0.75);
		this.tileLayer.renderDebug(debugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
		// tslint:enable
	}

	update(globalTime: number, delta: number) {

		const pointerPosX = this.input.activePointer.worldX;
		const tileX = Math.floor((pointerPosX - this.tileLayer.x) / TILE_WIDTH);
		const pointerPosY = this.input.activePointer.worldY;
		const tileY = Math.floor((pointerPosY - this.tileLayer.y) / TILE_HEIGHT);
		
		this.positionText.update(tileY, tileX);

		if (document.activeElement && document.activeElement.nodeName === 'INPUT') {
			return;
		}
			if (this.sKey.isDown) {
			this.cameraPositionY = this.cameraPositionY + CAMERA_MOVEMENT_PER_FRAME;
		}
		if (this.dKey.isDown) {
			this.cameraPositionX = this.cameraPositionX + CAMERA_MOVEMENT_PER_FRAME;
		}
		if (this.wKey.isDown) {
			this.cameraPositionY = this.cameraPositionY - CAMERA_MOVEMENT_PER_FRAME;
		}
		if (this.aKey.isDown) {
			this.cameraPositionX = this.cameraPositionX - CAMERA_MOVEMENT_PER_FRAME;
		}
		// Phaser will keep saying that tKey is down for multiple update calls, we only care about the
		// first.
		if (this.tKey.isDown && !this.wasTKeyDown) {
			this.isLibraryVisible = !this.isLibraryVisible;
			this.libraryLayer.setVisible(this.isLibraryVisible);
			this.backgroundLibraryLayer.setVisible(this.isLibraryVisible);
			this.mapEditorHighlighting.setVisible(this.isLibraryVisible);
		}
		this.wasTKeyDown = this.tKey.isDown
		
		this.cameras.main.centerOn(this.cameraPositionX, this.cameraPositionY);
	}
}
