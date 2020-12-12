import 'phaser';
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';
import PositionText from '../drawables/ui/PositionText';
import globalState from '../worldstate';

const TILE_SPACING = 2;

const DEFAULT_TILE = 32;

const CAMERA_MOVEMENT_PER_FRAME = 10;

const ROOM_DEFAULT_WIDTH = 8;
const ROOM_DEFAULT_HEIGHT = 8;

// The main scene handles the actual game play.
export default class MapEditor extends Phaser.Scene {
	roomName: string = '';
	tileSetName: string = 'dungeon';
	roomLayout: number[][] = [];
	roomWidth = 8;
	roomHeight = 8;
	selectedId = 32;

	tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	libraryLayer: Phaser.Tilemaps.DynamicTilemapLayer;

	wKey: Phaser.Input.Keyboard.Key;
	aKey: Phaser.Input.Keyboard.Key;
	sKey: Phaser.Input.Keyboard.Key;
	dKey: Phaser.Input.Keyboard.Key;

	cameraPositionX: number = 0;
	cameraPositionY: number = 0;

	positionText: PositionText;

	mapEditorMenuElement: HTMLDivElement;
	roomsDropdownElement: HTMLSelectElement;
	tilesetDropdownElement: HTMLSelectElement;
	loadButtonElement: HTMLButtonElement;
	roomNameElement: HTMLInputElement;
	roomHeightElement: HTMLInputElement;
	roomWidthElement: HTMLInputElement;

	constructor() {
		super({ key: 'MapEditor' });
		this.mapEditorMenuElement = document.getElementById('mapEditorMenu') as HTMLDivElement;
		this.roomsDropdownElement = document.getElementById('roomDropdown') as HTMLSelectElement;
		this.tilesetDropdownElement = document.getElementById('tilesetDropdown') as HTMLSelectElement;
		this.loadButtonElement = document.getElementById('loadRoomButton') as HTMLButtonElement;
		this.roomNameElement = document.getElementById('roomName') as HTMLInputElement;
		this.roomHeightElement = document.getElementById('roomHeight') as HTMLInputElement;
		this.roomWidthElement = document.getElementById('roomWidth') as HTMLInputElement;
	}

	create() {
		this.positionText = new PositionText(this);
		this.mapEditorMenuElement.style.display = 'flex';

		while (this.roomsDropdownElement.firstChild) {
			this.roomsDropdownElement.remove(0);
		}

		Object.keys(globalState.availableRooms).forEach((roomName) => {
			const newOption = document.createElement('option');
			newOption.value = roomName;
			newOption.innerText = roomName;
			this.roomsDropdownElement.appendChild(newOption);
		});

		while (this.tilesetDropdownElement.firstChild) {
			this.tilesetDropdownElement.remove(0);
		}

		globalState.availableTilesets.forEach((tileset) => {
			const newOption = document.createElement('option');
			newOption.value = tileset;
			newOption.innerText = tileset;
			this.tilesetDropdownElement.appendChild(newOption);
		});

		this.loadButtonElement.onclick = () => {
			const roomName = this.roomsDropdownElement.value;

			const selectedRoom = globalState.availableRooms[roomName]!;
			this.roomNameElement.value = selectedRoom.name;

			const tilesetElement = document.getElementById('tilesetDropdown') as HTMLSelectElement;
			tilesetElement.value = selectedRoom.tileset;

			this.roomHeightElement.value = `${selectedRoom.layout.length}`;
			this.roomWidthElement.value = `${selectedRoom.layout[0].length}`;

			this.roomLayout = [];
			this.applyConfiguration();
			for (let y = 0; y < selectedRoom.layout.length; y++) {
				for (let x = 0; x < selectedRoom.layout[y].length; x++) {
					this.roomLayout[y][x] = selectedRoom.layout[y][x];
					const tile = this.tileLayer.getTileAt(x, y);
					if (tile) {
						tile.index = selectedRoom.layout[y][x];
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

		const exportButtonElement = document.getElementById('exportButton') as HTMLButtonElement;
		exportButtonElement.onclick = () => {
			const roomNameValue = this.roomNameElement.value;

			const tilesetElement = document.getElementById('tilesetDropdown') as HTMLSelectElement;
			const tilesetValue = tilesetElement.value;

			let fileRows = '{\n' +
				`\t"name": "${roomNameValue}",\n` +
				`\t"tileset": "${tilesetValue}",\n` +
				`\t"openings": [],\n` +
				`\t"layout": [\n`;
			this.roomLayout.forEach((row, index) => {
				fileRows += `\t\t${JSON.stringify(row)}${index < this.roomLayout.length -1 ? ',' : ''}\n`;
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
	}

	applyConfiguration() {
		const roomNameValue = this.roomNameElement.value;
		this.roomName = roomNameValue;

		this.tileSetName = this.tilesetDropdownElement.value;
		const roomWidthValue = parseInt(this.roomWidthElement.value, 10) || ROOM_DEFAULT_WIDTH;
		const roomWidth = roomWidthValue > 0 ? roomWidthValue : ROOM_DEFAULT_WIDTH;
		const roomHeightValue = parseInt(this.roomHeightElement.value, 10) || ROOM_DEFAULT_HEIGHT;
		const roomHeight = roomHeightValue > 0 ? roomHeightValue : ROOM_DEFAULT_HEIGHT;

		const newRoomLayout: number[][] = [];
		for (let y = 0; y < roomHeight; y++) {
			newRoomLayout[y] = [];
			for (let x = 0; x < roomWidth; x++) {
				newRoomLayout[y][x] = this.roomLayout[y] ?
					(this.roomLayout[y][x] || DEFAULT_TILE) :
					DEFAULT_TILE;
			}
		}
		this.roomLayout = newRoomLayout;

		this.drawTileSet();
		this.drawRoom();
	}

	drawTileSet() {
		if (this.libraryLayer) {
			this.libraryLayer.destroy(true);
		}
		const data: number[][] = [];

		const tileSetImage = this.textures.get(this.tileSetName).source[0];
		const imageWidth = tileSetImage.width;
		const imageHeight = tileSetImage.height;
		const widthInTiles = Math.ceil(imageWidth / (TILE_WIDTH + TILE_SPACING));
		const heightInTiles = Math.ceil(imageHeight / (TILE_HEIGHT + TILE_SPACING));

		for (let y = 0; y < heightInTiles; y++) {
			data[y] = [];
			for (let x = 0; x < widthInTiles; x++) {
				data[y][x] = y * widthInTiles + x;
			}
		}
		const map = this.make.tilemap({
			data,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT,
		});
		const tileSet = map.addTilesetImage(
			`${this.tileSetName}-lib`,
			this.tileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.libraryLayer = map.createDynamicLayer(0, tileSet, 0, 0).setInteractive();
		this.libraryLayer.setDepth(1);
		this.libraryLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			const clickX = pointer.downX - this.libraryLayer.x;
			const clickY = pointer.downY - this.libraryLayer.y;
			const tileX = Math.floor(clickX / TILE_WIDTH);
			const tileY = Math.floor(clickY / TILE_HEIGHT);
			const clickedTile = this.libraryLayer.getTileAt(tileX, tileY);
			if (clickedTile) {
				this.selectedId = clickedTile.index;
			}
		});
		this.libraryLayer.setScrollFactor(0, 0);
	}

	drawRoom() {
		if (this.tileLayer) {
			this.tileLayer.destroy(true);
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
		this.tileLayer =
			map.createDynamicLayer(0, tileSet, -map.widthInPixels / 2, -map.heightInPixels / 2)
			.setInteractive();
		this.tileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			const clickX =
				pointer.downX - this.cameras.main.centerX + this.cameraPositionX - this.tileLayer.x;
			const clickY =
				pointer.downY - this.cameras.main.centerY + this.cameraPositionY - this.tileLayer.y;
			const tileX = Math.floor(clickX / TILE_WIDTH);
			const tileY = Math.floor(clickY / TILE_HEIGHT);
			const clickedTile = this.tileLayer.getTileAt(tileX, tileY);
			this.roomLayout[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				// map.replaceByIndex()
				clickedTile.index = this.selectedId;

				// clickedTile.tint = 0xff0000;
				this.tileLayer.update();
			}
		});
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
		this.cameras.main.centerOn(this.cameraPositionX, this.cameraPositionY);
	}
}
