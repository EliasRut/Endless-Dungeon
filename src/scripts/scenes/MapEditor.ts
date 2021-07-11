import 'phaser';
import { 
	TILE_WIDTH,
	TILE_HEIGHT 
} from '../helpers/generateDungeon';
import PositionText from '../drawables/ui/PositionText';
import globalState from '../worldstate';
import firebase from 'firebase';
import { DatabaseRoom } from '../../../typings/custom';

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
	libraryBackgroundLayer: 4,
	libraryTileLayer: 5,
	libraryHighlighting: 6
};

type MapLayout = number[][];

interface MultiLevelLayout {
	base: MapLayout;
	decoration: MapLayout;
	overlay: MapLayout;
}

type LevelHistory = MultiLevelLayout[];

export default class MapEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

	fileData: Partial<DatabaseRoom> = {};
	roomName: string = '';

	isPointerDown: boolean = false;

	tileSetName: string = 'dungeon';
	roomLayout: MapLayout = [];

	decorationTileSetName: string = 'dungeon';
	roomDecorationLayout: MapLayout = [];

	overlayTileSetName: string = 'dungeon';
	roomOverlayLayout: MapLayout = [];

	roomWidth = 8;
	roomHeight = 8;
	selectedId = 32;

	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationTileLayer: Phaser.Tilemaps.TilemapLayer;
	overlayTileLayer: Phaser.Tilemaps.TilemapLayer;
	libraryLayer: Phaser.Tilemaps.TilemapLayer;
	backgroundLibraryLayer: Phaser.Tilemaps.TilemapLayer;

	mapEditorHighlighting: Phaser.GameObjects.Image;

	oneKey: Phaser.Input.Keyboard.Key;
	twoKey: Phaser.Input.Keyboard.Key;
	threeKey: Phaser.Input.Keyboard.Key;
	wKey: Phaser.Input.Keyboard.Key;
	aKey: Phaser.Input.Keyboard.Key;
	sKey: Phaser.Input.Keyboard.Key;
	dKey: Phaser.Input.Keyboard.Key;
	tKey: Phaser.Input.Keyboard.Key;
	zKey: Phaser.Input.Keyboard.Key;
	ctrlKey: Phaser.Input.Keyboard.Key;
	shiftKey: Phaser.Input.Keyboard.Key;

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
	wasUndoDown: boolean = false;
	isLibraryVisible: boolean = false;

	tilesetHistory: LevelHistory = [];

	selectionStartPoint: [number, number] | undefined;
	selectionEndPoint: [number, number] | undefined;
	selectedTileValues: Partial<MultiLevelLayout> | undefined;

	constructor() {
		super({ key: 'MapEditor' });
		this.database = firebase.firestore().collection('rooms');
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

		this.mapEditorHighlighting = new Phaser.GameObjects.Image(
			this, TILE_WIDTH / 2, TILE_HEIGHT / 2, 'map-editor-highlighting');
		this.mapEditorHighlighting.setDepth(DEPTHS.libraryHighlighting);
		this.mapEditorHighlighting.setScrollFactor(0, 0);
		this.mapEditorHighlighting.alpha = 0.5;
		this.add.existing(this.mapEditorHighlighting);

		while (this.roomsDropdownElement.firstChild) {
			this.roomsDropdownElement.remove(0);
		}

		Object.keys(this.database
			.get()
			.then((query) => {
				query.forEach((roomDoc) => {
					const newOption = document.createElement('option');
					newOption.value = roomDoc.id;
					newOption.innerText = roomDoc.id;
					this.roomsDropdownElement.appendChild(newOption);
				});
			})
		);

		// Object.keys(globalState.availableRooms).forEach((roomName) => {
		// 	const newOption = document.createElement('option');
		// 	newOption.value = roomName;
		// 	newOption.innerText = roomName;
		// 	this.roomsDropdownElement.appendChild(newOption);
		// });

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

		this.loadButtonElement.onclick = async () => {
			const roomName = this.roomsDropdownElement.value;

			const selectedRoomDoc = await this.database.doc(roomName).get();
			const databaseSelectedRoom = selectedRoomDoc.data() as DatabaseRoom;
			const selectedRoom = {
				...databaseSelectedRoom,
				layout: JSON.parse(databaseSelectedRoom.layout),
				decorations: JSON.parse(databaseSelectedRoom.decorations),
				overlays: JSON.parse(databaseSelectedRoom.overlays),
			}
			this.fileData = selectedRoom;
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
			this.tilesetHistory = [];
			this.addToHistory();
		};

		const goButtonElement = document.getElementById('goButton') as HTMLButtonElement;
		goButtonElement.onclick = () => {
			this.applyConfiguration();
		};
		this.applyConfiguration();

		this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, false);
		this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, false);
		this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, false);
		this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false);
		this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
		this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
		this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
		this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T, false);
		this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z, false);
		this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
		this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);

		this.exportButtonElement.onclick = () => {
			const roomNameValue = this.roomNameElement.value;

			const tilesetValue = this.tilesetDropdownElement.value;
			const decorationTilesetValue = this.tilesetDecorationDropdownElement.value;
			const overlayTilesetValue = this.tilesetOverlayDropdownElement.value;

			const fileData = {
				npcs: [],
				items: [],
				scripts: [],
				...this.fileData,
				openings: JSON.stringify(this.fileData.openings || []),
				name: roomNameValue,
				tileset: tilesetValue,
				decorationTileset: decorationTilesetValue,
				overlayTileset: overlayTilesetValue,
				layout: JSON.stringify(this.roomLayout),
				decorations: JSON.stringify(this.roomDecorationLayout),
				overlays: JSON.stringify(this.roomOverlayLayout),
			};

			this.database.doc(roomNameValue).set(fileData);

			// const dataStr = 'data:text/json;charset=utf-8,' +
			// 	encodeURIComponent(JSON.stringify(fileData));
			// const dlAnchorElem = document.getElementById('downloadAnchorElem') as HTMLLinkElement;
			// dlAnchorElem.setAttribute('href', dataStr);
			// dlAnchorElem.setAttribute('download', `${roomNameValue}.json`);
			// dlAnchorElem.click();
		};

		this.activeLayerDropdownElement.onchange = () => {
			this.updateActiveLayer();
		};

		this.addToHistory();
	}

	getTileLayerForName(layerName: string) {
		switch (layerName) {
			case 'decoration': return this.decorationTileLayer;
			case 'overlay': return this.overlayTileLayer;
			default: return this.tileLayer;
		}
	}

	getActiveLayer() {
		return this.getTileLayerForName(this.activeLayerDropdownElement.value);
	}

	getLayerValuesForName(layerName: string) {
		switch (layerName) {
			case 'decoration': return this.roomDecorationLayout;
			case 'overlay': return this.roomOverlayLayout;
			default: return this.roomLayout;
		}
	}

	getActiveLayerValues() {
		return this.getLayerValuesForName(this.activeLayerDropdownElement.value);
	}

	updateActiveLayer() {
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
			this.libraryLayer = map.createLayer(0, tileSet, 0, 0).setInteractive();
			this.libraryLayer.setDepth(DEPTHS.libraryTileLayer);
			this.libraryLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
				this.selectedTileValues = undefined;
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
					this.mapEditorHighlighting.x = clickedTile.x * TILE_WIDTH + (TILE_WIDTH / 2);
					this.mapEditorHighlighting.y = clickedTile.y * TILE_HEIGHT + (TILE_HEIGHT / 2);
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
				backgroundMap.createLayer(0, backgroundTileSet, 0, 0).setInteractive();
			this.backgroundLibraryLayer.setDepth(DEPTHS.libraryBackgroundLayer);
			this.backgroundLibraryLayer.setScrollFactor(0, 0);
	}

	getDataFromClick (
			posX: number,
			posY: number,
			tileLayer: Phaser.Tilemaps.TilemapLayer
		) {
		const clickX =
			posX - this.cameras.main.centerX + this.cameraPositionX - tileLayer.x;
		const clickY =
			posY - this.cameras.main.centerY + this.cameraPositionY - tileLayer.y;
		const tileX = Math.floor(clickX / TILE_WIDTH);
		const tileY = Math.floor(clickY / TILE_HEIGHT);
		return [
			tileX,
			tileY,
			tileLayer.getTileAt(tileX, tileY)
		] as [number, number, Phaser.Tilemaps.Tile];
	}

	addToHistory() {
		const deepCopyArray: (values: number[][]) => number[][] = (values) => {
			return JSON.parse(JSON.stringify(values)) as number[][];
		};

		this.tilesetHistory.push({
			base: deepCopyArray(this.roomLayout),
			decoration: deepCopyArray(this.roomDecorationLayout),
			overlay: deepCopyArray(this.roomOverlayLayout),
		});
		// tslint:disable-next-line: no-magic-numbers
		if (this.tilesetHistory.length > 100) {
			this.tilesetHistory.shift();
		}
	}

	endSelection(wasCtrlPressed: boolean) {
		if (!this.selectionStartPoint || !this.selectionEndPoint) {
			return;
		}
		const minX = Math.min(this.selectionStartPoint[0], this.selectionEndPoint[0]);
		const maxX = Math.max(this.selectionStartPoint[0], this.selectionEndPoint[0]);
		const minY = Math.min(this.selectionStartPoint[1], this.selectionEndPoint[1]);
		const maxY = Math.max(this.selectionStartPoint[1], this.selectionEndPoint[1]);

		const selectionValues: Partial<MultiLevelLayout> = {};
		const activeLayers: (keyof MultiLevelLayout)[] = wasCtrlPressed ?
			['base', 'decoration', 'overlay'] :
			[this.activeLayerDropdownElement.value as keyof MultiLevelLayout];
		for (const layer of activeLayers) {
			selectionValues[layer] = [];
			for (let y = minY; y <= maxY; y++) {
				const yIndex = y - minY;
				selectionValues[layer]![yIndex] = [];
				for (let x = minX; x <= maxX; x++) {
					const xIndex = x - minX;
					selectionValues[layer]![yIndex][xIndex] = this.getLayerValuesForName(layer)[y][x];
				}
			}
		}

		this.selectedTileValues = selectionValues;
	}

	pasteSelectedValues(tileX: number, tileY: number) {
		this.addToHistory();
		if (!this.selectedTileValues) {
			return;
		}
		const layers = Object.keys(this.selectedTileValues).reduce(
			(obj, tileLayerName) => {
				obj[tileLayerName] = this.getLayerValuesForName(tileLayerName);
				return obj;
			}, {} as {[name: string]: MapLayout});
		Object.entries(layers).forEach(([layerName, layerValues]) => {
			const layerKey = layerName as keyof MultiLevelLayout;
			for (let y = 0; y < this.selectedTileValues![layerKey]!.length; y++) {
				for (let x = 0; x < this.selectedTileValues![layerKey]![y].length; x++) {
						layerValues[tileY + y][tileX + x] =
							this.selectedTileValues![layerKey]![y][x];
				}
			}
		});
		this.drawRoom();
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
			.createLayer(0, tileSet, -map.widthInPixels / 2, -map.heightInPixels / 2)
			.setInteractive();
		this.tileLayer.setDepth(DEPTHS.baseLayer);

		const onPointerDown: (
			tilemapLayer: Phaser.Tilemaps.TilemapLayer,
			layoutValues: MapLayout,
			x: number,
			y: number
		) => void = (tilemapLayer, layoutValues, x, y) => {
			const [tileX, tileY, clickedTile] = this.getDataFromClick(x, y, tilemapLayer);
			if (this.shiftKey.isDown) {
				this.selectionStartPoint = [tileX, tileY];
				this.selectedTileValues = undefined;
				return;
			}
			if (this.selectedTileValues) {
				this.pasteSelectedValues(tileX, tileY);
				return;
			}
			this.isPointerDown = true;

			this.addToHistory();

			layoutValues[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				clickedTile.index = this.selectedId;
				if (tilemapLayer !== this.tileLayer) {
					clickedTile.setVisible(this.selectedId !== 0);
				}
				tilemapLayer.update();
			}
		};

		const onPointerMove: (
			tilemapLayer: Phaser.Tilemaps.TilemapLayer,
			layoutValues: MapLayout,
			x: number,
			y: number
		) => void = (tilemapLayer, layoutValues, x, y) => {
			if (!this.isPointerDown || this.shiftKey.isDown) {
				return;
			}
			const [tileX, tileY, clickedTile] = this.getDataFromClick(x, y, tilemapLayer);
			layoutValues[tileY][tileX] = this.selectedId;
			if (clickedTile) {
				clickedTile.index = this.selectedId;
				if (tilemapLayer !== this.tileLayer) {
					clickedTile.setVisible(this.selectedId !== 0);
				}
				this.tileLayer.update();
			}
		};

		const onPointerUp: (
			tilemapLayer: Phaser.Tilemaps.TilemapLayer,
			x: number,
			y: number
		) => void = (tilemapLayer, x, y) => {
			this.isPointerDown = false;
			if (this.shiftKey.isDown) {
				const [tileX, tileY] = this.getDataFromClick(x, y, tilemapLayer);
				this.selectionEndPoint = [tileX, tileY];
				this.endSelection(this.ctrlKey.isDown);
			}
		};

		this.tileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			onPointerDown(this.tileLayer, this.roomLayout, pointer.downX, pointer.downY);
		});
		this.tileLayer.on('pointermove', (pointer: {position: {x: number; y: number;}}) => {
			onPointerMove(this.tileLayer, this.roomLayout, pointer.position.x, pointer.position.y);
		});
		this.tileLayer.on('pointerup', (pointer: { upX: number; upY: number; }) => {
			onPointerUp(this.tileLayer, pointer.upX, pointer.upY);
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
			.createLayer(0, decorationTileSet, -map.widthInPixels / 2, -map.heightInPixels / 2);
			// .setInteractive();
		this.decorationTileLayer.setDepth(DEPTHS.decorationLayer);
		this.decorationTileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			onPointerDown(this.decorationTileLayer, this.roomDecorationLayout,
				pointer.downX, pointer.downY);
		});
		this.decorationTileLayer.on('pointermove', (pointer: {position: {x: number; y: number;}}) => {
			onPointerMove(this.decorationTileLayer, this.roomDecorationLayout,
				pointer.position.x, pointer.position.y);
		});
		this.decorationTileLayer.on('pointerup', (pointer: { upX: number; upY: number; }) => {
			onPointerUp(this.decorationTileLayer, pointer.upX, pointer.upY);
		});

		const overlayMap = this.make.tilemap({
			data: this.roomOverlayLayout,
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
			.createLayer(0, overlayTileSet, -map.widthInPixels / 2, -map.heightInPixels / 2);
		this.overlayTileLayer.setDepth(DEPTHS.overlayLayer);
		this.overlayTileLayer.on('pointerdown', (pointer: { downX: number; downY: number; }) => {
			onPointerDown(this.overlayTileLayer, this.roomOverlayLayout,
				pointer.downX, pointer.downY);
		});
		this.overlayTileLayer.on('pointermove', (pointer: {position: {x: number; y: number;}}) => {
			onPointerMove(this.overlayTileLayer, this.roomOverlayLayout,
				pointer.position.x, pointer.position.y);
		});
		this.overlayTileLayer.on('pointerup', (pointer: { upX: number; upY: number; }) => {
			onPointerUp(this.overlayTileLayer, pointer.upX, pointer.upY);
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
		if (this.oneKey.isDown || this.twoKey.isDown || this.threeKey.isDown) {
			const newLayer = this.oneKey.isDown ? 'base' : (
				this.twoKey.isDown ? 'decoration' : 'overlay'
			);
			const activeLayerValue = this.activeLayerDropdownElement.value;
			if (activeLayerValue !== newLayer) {
				this.activeLayerDropdownElement.value = newLayer;
				this.updateActiveLayer();
			}
		}
		// Phaser will keep saying that tKey is down for multiple update calls, we only care about the
		// first.
		if (this.tKey.isDown && !this.wasTKeyDown) {
			this.isLibraryVisible = !this.isLibraryVisible;
			this.libraryLayer.setVisible(this.isLibraryVisible);
			this.backgroundLibraryLayer.setVisible(this.isLibraryVisible);
			this.mapEditorHighlighting.setVisible(this.isLibraryVisible);
		}
		// Phaser will keep saying that undo was down for multiple update calls, we only care about the
		// first.
		if (this.zKey.isDown && this.ctrlKey.isDown && !this.wasUndoDown) {
			this.wasUndoDown = true;
			const historyEntry = this.tilesetHistory.pop();
			if (historyEntry) {
				this.roomLayout = historyEntry.base;
				this.roomDecorationLayout = historyEntry.decoration;
				this.roomOverlayLayout = historyEntry.overlay;
				this.drawRoom();
			}
			if (this.tilesetHistory.length === 0) {
				this.addToHistory();
			}
		}
		this.wasUndoDown = this.zKey.isDown && this.ctrlKey.isDown;
		this.wasTKeyDown = this.tKey.isDown;

		// tslint:disable no-magic-numbers
		this.tileLayer.forEachTile((tile) => tile.tint = 0xffffff);
		this.decorationTileLayer.forEachTile((tile) => tile.tint = 0xffffff);
		this.overlayTileLayer.forEachTile((tile) => tile.tint = 0xffffff);

		if (this.shiftKey.isDown) {
			const position = this.input.mousePointer.position;
			const [_tileX, _tileY, hoveredTile] =
				this.getDataFromClick(position.x, position.y, this.tileLayer);
			if (hoveredTile) {
				hoveredTile.tint = this.ctrlKey.isDown ? 0x9999ff : 0xff9999;
			}
			if (this.selectionStartPoint) {
				const minX = Math.min(this.selectionStartPoint[0], tileX);
				const maxX = Math.max(this.selectionStartPoint[0], tileX);
				const minY = Math.min(this.selectionStartPoint[1], tileY);
				const maxY = Math.max(this.selectionStartPoint[1], tileY);
				for (let y = minY; y <= maxY; y++) {
					for (let x = minX; x <= maxX; x++) {
						const tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
						if (this.ctrlKey.isDown) {
							tileLayers.push(this.tileLayer, this.decorationTileLayer, this.overlayTileLayer);
						} else {
							tileLayers.push(this.getActiveLayer());
						}
						tileLayers.forEach((layer) => {
							const tile = layer.getTileAt(x, y);
							if (tile) {
								tile.tint = this.ctrlKey.isDown ? 0x9999ff : 0xff9999;
							}
						});
					}
				}
			}
		} else {
			this.selectionStartPoint = undefined;
			this.selectionEndPoint = undefined;
		}
		// tslint:enable

		this.cameras.main.centerOn(this.cameraPositionX, this.cameraPositionY);
	}
}
