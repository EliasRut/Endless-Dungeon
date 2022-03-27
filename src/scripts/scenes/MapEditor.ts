import 'phaser';
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';
import PositionText, {
	POSITION_TEXT_X_OFFSET,
	POSITION_TEXT_Y_OFFSET,
} from '../drawables/ui/PositionText';
import globalState from '../worldstate';
import firebase from 'firebase';
import { DatabaseRoom, ItemsPositioning, NpcPositioning, Room } from '../../../typings/custom';
import { deserializeRoom } from '../helpers/serialization';
import { spawnNpc } from '../helpers/spawn';
import fixedItems from '../../items/fixedItems.json';
import WorldItemToken from '../drawables/tokens/WorldItemToken';
import { getItemDataForName, UneqippableItem } from '../../items/itemData';

const SCALE = 2;

const MIN_ZOOM_LEVEL = 0.125;

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
	npcLayer: 3,
	itemLayer: 4,
	overlayLayer: 5,
	libraryBackgroundLayer: 6,
	libraryTileLayer: 7,
	libraryHighlighting: 8,
};

type MapLayout = number[][];

interface MultiLevelLayout {
	base: MapLayout;
	decoration: MapLayout;
	overlay: MapLayout;
}

type LevelHistory = MultiLevelLayout[];

const npcKeys = ['hilda-base', 'vanya-base', 'agnes', 'erwin', 'rich'];

export default class MapEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
	backupDatabase: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

	fileData: Partial<Room> = {};
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

	widthInPixels: number;
	heightInPixels: number;

	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationTileLayer: Phaser.Tilemaps.TilemapLayer;
	overlayTileLayer: Phaser.Tilemaps.TilemapLayer;
	libraryLayer: Phaser.Tilemaps.TilemapLayer;
	backgroundLibraryLayer: Phaser.Tilemaps.TilemapLayer;
	npcLibraryLayer: Phaser.GameObjects.Group;
	npcLibraryTokens: Phaser.GameObjects.Image[];
	itemLibraryLayer: Phaser.GameObjects.Group;
	itemLibraryTokens: Phaser.GameObjects.Image[];

	highlightingX = 0;
	highlightingY = 0;
	mapEditorHighlighting: Phaser.GameObjects.Image;

	selectedLibraryNpcIndex: number = 0;
	selectedNpcTokenIndex: number = -1;
	selectedLibraryItemIndex: number = 0;
	selectedItemTokenIndex: number = -1;
	npcTokens: Phaser.GameObjects.Image[];
	npcs: NpcPositioning[];
	itemTokens: Phaser.GameObjects.Sprite[];
	items: ItemsPositioning[];

	oneKey: Phaser.Input.Keyboard.Key;
	twoKey: Phaser.Input.Keyboard.Key;
	threeKey: Phaser.Input.Keyboard.Key;
	fourKey: Phaser.Input.Keyboard.Key;
	fiveKey: Phaser.Input.Keyboard.Key;
	wKey: Phaser.Input.Keyboard.Key;
	aKey: Phaser.Input.Keyboard.Key;
	sKey: Phaser.Input.Keyboard.Key;
	dKey: Phaser.Input.Keyboard.Key;
	tKey: Phaser.Input.Keyboard.Key;
	rKey: Phaser.Input.Keyboard.Key;
	ctrlKey: Phaser.Input.Keyboard.Key;
	shiftKey: Phaser.Input.Keyboard.Key;
	zoomOut: Phaser.Input.Keyboard.Key;
	zoomIn: Phaser.Input.Keyboard.Key;

	cameraPositionX: number = 0;
	cameraPositionY: number = 0;

	positionText: PositionText;

	// Details Dialog elements
	mapEditorMenuElement: HTMLDivElement;
	roomsDropdownElement: HTMLSelectElement;
	tilesetDropdownElement: HTMLSelectElement;
	tilesetDecorationDropdownElement: HTMLSelectElement;
	tilesetOverlayDropdownElement: HTMLSelectElement;
	loadButtonElement: HTMLButtonElement;
	loadFromAutosaveButtonElement: HTMLButtonElement;
	roomNameElement: HTMLInputElement;
	roomHeightElement: HTMLInputElement;
	roomWidthElement: HTMLInputElement;
	detailsSaveButtonElement: HTMLButtonElement;

	// Main UI elements
	exportButtonElement: HTMLButtonElement;
	activeLayerDropdownElement: HTMLSelectElement;
	showDetailsButtonElement: HTMLButtonElement;
	createNewButtonElement: HTMLButtonElement;
	detailsCancelButtonElement: HTMLButtonElement;

	// Npc Details Dialog fields
	npcTypeDropdownElement: HTMLSelectElement;
	npcIdElement: HTMLInputElement;
	npcLevelElement: HTMLInputElement;
	npcXElement: HTMLInputElement;
	npcYElement: HTMLInputElement;
	npcSaveButton: HTMLButtonElement;
	npcDeleteButton: HTMLButtonElement;

	// Item Details Dialog fields
	itemIdElement: HTMLSelectElement;
	itemXElement: HTMLInputElement;
	itemYElement: HTMLInputElement;
	itemSaveButton: HTMLButtonElement;
	itemDeleteButton: HTMLButtonElement;

	wasTKeyDown: boolean = false;
	wasUndoDown: boolean = false;
	wasZoomInDown: boolean = false;
	wasZoomOutDown: boolean = false;
	isLibraryVisible: boolean = false;

	tilesetHistory: LevelHistory = [];

	selectionStartPoint: [number, number] | undefined;
	selectionEndPoint: [number, number] | undefined;
	selectedTileValues: Partial<MultiLevelLayout> | undefined;

	zoomFactor: number = 1;

	constructor() {
		super({ key: 'MapEditor' });
		this.database = firebase.firestore().collection('rooms');
		this.backupDatabase = firebase.firestore().collection('roomsAutoSave');
		this.mapEditorMenuElement = document.getElementById('mapEditorMenu') as HTMLDivElement;
		this.roomsDropdownElement = document.getElementById('roomDropdown') as HTMLSelectElement;
		this.tilesetDropdownElement = document.getElementById('tilesetDropdown') as HTMLSelectElement;
		this.tilesetDecorationDropdownElement = document.getElementById(
			'tilesetDecorationDropdown'
		) as HTMLSelectElement;
		this.tilesetOverlayDropdownElement = document.getElementById(
			'tilesetOverlayDropdown'
		) as HTMLSelectElement;
		this.loadButtonElement = document.getElementById('loadRoomButton') as HTMLButtonElement;
		this.loadFromAutosaveButtonElement = document.getElementById(
			'loadFromAutosaveRoomButton'
		) as HTMLButtonElement;
		this.roomNameElement = document.getElementById('roomName') as HTMLInputElement;
		this.roomHeightElement = document.getElementById('roomHeight') as HTMLInputElement;
		this.roomWidthElement = document.getElementById('roomWidth') as HTMLInputElement;
		this.exportButtonElement = document.getElementById('exportButton') as HTMLButtonElement;
		this.activeLayerDropdownElement = document.getElementById(
			'activeLayerDropdown'
		) as HTMLSelectElement;
		this.showDetailsButtonElement = document.getElementById(
			'showDetailsButton'
		) as HTMLButtonElement;
		this.createNewButtonElement = document.getElementById('createNewButton') as HTMLButtonElement;
		this.detailsSaveButtonElement = document.getElementById(
			'detailsSaveButton'
		) as HTMLButtonElement;
		this.detailsCancelButtonElement = document.getElementById(
			'detailsCancelButton'
		) as HTMLButtonElement;

		this.createNewButtonElement.onclick = () => this.showMapDetailsDialog(true);
		this.showDetailsButtonElement.onclick = () => this.showMapDetailsDialog(false);
		this.detailsCancelButtonElement.onclick = () => this.hideMapDetailsDialog();

		// Npc Details Dialog fields
		this.npcTypeDropdownElement = document.getElementById('npcType') as HTMLSelectElement;
		this.npcIdElement = document.getElementById('npcId') as HTMLInputElement;
		this.npcLevelElement = document.getElementById('npcLevel') as HTMLInputElement;
		this.npcXElement = document.getElementById('npcX') as HTMLInputElement;
		this.npcYElement = document.getElementById('npcY') as HTMLInputElement;
		this.npcSaveButton = document.getElementById('npcSaveButton') as HTMLButtonElement;
		this.npcSaveButton.onclick = () => this.saveNpcToken();
		this.npcDeleteButton = document.getElementById('npcDeleteButton') as HTMLButtonElement;
		this.npcDeleteButton.onclick = () => this.deleteNpcToken();

		// Item Details Dialog fields
		this.itemIdElement = document.getElementById('itemId') as HTMLSelectElement;
		this.itemXElement = document.getElementById('itemX') as HTMLInputElement;
		this.itemYElement = document.getElementById('itemY') as HTMLInputElement;
		this.itemSaveButton = document.getElementById('itemSaveButton') as HTMLButtonElement;
		this.itemSaveButton.onclick = () => this.saveItemToken();
		this.itemDeleteButton = document.getElementById('itemDeleteButton') as HTMLButtonElement;
		this.itemDeleteButton.onclick = () => this.deleteItemToken();
	}

	populateFromDatabase(databaseSelectedRoom: DatabaseRoom) {
		const selectedRoom = deserializeRoom(databaseSelectedRoom);
		this.fileData = selectedRoom;
		this.roomNameElement.value = selectedRoom.name;

		this.tilesetDropdownElement.value = selectedRoom.tileset;
		this.tilesetDecorationDropdownElement.value = selectedRoom.decorationTileset
			? selectedRoom.decorationTileset
			: this.tilesetDecorationDropdownElement.options[0].value;
		this.tilesetOverlayDropdownElement.value = selectedRoom.overlayTileset
			? selectedRoom.overlayTileset
			: this.tilesetOverlayDropdownElement.options[0].value;

		this.roomHeightElement.value = `${selectedRoom.layout.length}`;
		this.roomWidthElement.value = `${selectedRoom.layout[0].length}`;

		this.roomLayout = [];
		this.roomDecorationLayout = [];
		this.roomOverlayLayout = [];

		this.npcs = selectedRoom.npcs || [];
		this.items = selectedRoom.items || [];

		this.npcTokens.forEach((token) => {
			token.destroy(true);
		});
		this.npcTokens = [];

		this.itemTokens.forEach((token) => {
			token.destroy(true);
		});
		this.itemTokens = [];

		this.applyConfiguration();

		for (let y = 0; y < selectedRoom.layout.length; y++) {
			for (let x = 0; x < selectedRoom.layout[y].length; x++) {
				this.roomLayout[y][x] = selectedRoom.layout[y][x];
				this.roomDecorationLayout[y][x] = selectedRoom.decorations
					? selectedRoom.decorations[y][x]
					: 0;
				this.roomOverlayLayout[y][x] = selectedRoom.overlays ? selectedRoom.overlays[y][x] : 0;

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
		this.addToHistory(false);
	}

	create() {
		this.zoomFactor = SCALE;
		this.positionText = new PositionText(this);
		this.mapEditorMenuElement.style.display = 'flex';

		this.mapEditorHighlighting = new Phaser.GameObjects.Image(
			this,
			0,
			0,
			'map-editor-highlighting'
		);
		this.mapEditorHighlighting.setDepth(DEPTHS.libraryHighlighting);
		this.mapEditorHighlighting.setScrollFactor(0, 0);
		this.mapEditorHighlighting.setOrigin(0);
		this.mapEditorHighlighting.setScale(SCALE);
		this.mapEditorHighlighting.alpha = 0.5;
		this.add.existing(this.mapEditorHighlighting);

		while (this.roomsDropdownElement.firstChild) {
			this.roomsDropdownElement.remove(0);
		}

		this.database.get().then((query) => {
			query.forEach((roomDoc) => {
				const newOption = document.createElement('option');
				newOption.value = roomDoc.id;
				newOption.innerText = roomDoc.id;
				this.roomsDropdownElement.appendChild(newOption);
			});
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

		this.loadButtonElement.onclick = async () => {
			const roomName = this.roomsDropdownElement.value;

			const selectedRoomDoc = await this.database.doc(roomName).get();
			const databaseSelectedRoom = selectedRoomDoc.data() as DatabaseRoom;
			this.populateFromDatabase(databaseSelectedRoom);
		};

		this.detailsSaveButtonElement.onclick = () => {
			this.applyConfiguration();
			this.hideMapDetailsDialog();
		};

		// NPC Details Dialog
		// Prepare NPC Type dropdown
		while (this.npcTypeDropdownElement.firstChild) {
			this.npcTypeDropdownElement.remove(0);
		}

		npcKeys.forEach((npcKey) => {
			const newOption = document.createElement('option');
			newOption.value = npcKey;
			newOption.innerText = npcKey;
			this.npcTypeDropdownElement.appendChild(newOption);
		});

		// Items Details Dialog
		// Prepare NPC Type dropdown
		while (this.itemIdElement.firstChild) {
			this.itemIdElement.remove(0);
		}

		Object.values(fixedItems).forEach((item) => {
			const newOption = document.createElement('option');
			newOption.value = item.id;
			newOption.innerText = item.id;
			this.itemIdElement.appendChild(newOption);
		});

		this.applyConfiguration();

		this.oneKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE, false);
		this.twoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO, false);
		this.threeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE, false);
		this.fourKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR, false);
		this.fiveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE, false);
		this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false);
		this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
		this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
		this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
		this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T, false);
		this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
		this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL, false);
		this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);
		this.zoomOut = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT,
			false
		);
		this.zoomIn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD, false);

		this.loadFromAutosaveButtonElement.onclick = async () => {
			const roomName = this.roomsDropdownElement.value;

			const selectedRoomDoc = await this.backupDatabase.doc(roomName).get();
			if (!selectedRoomDoc.exists) {
				return;
			}
			const backupDatabaseSelectedRoom = selectedRoomDoc.data() as DatabaseRoom;
			this.populateFromDatabase(backupDatabaseSelectedRoom);
		};

		this.cameras.main.setZoom(this.zoomFactor);
		this.exportButtonElement.onclick = () => {
			const data = this.getExportData();

			this.database.doc(data.name).set(data);
		};

		this.activeLayerDropdownElement.onchange = () => {
			this.updateActiveLayer();
		};

		this.npcLibraryLayer = new Phaser.GameObjects.Group(this);

		this.npcs = [];
		this.npcLibraryTokens = [];
		const npcCursorToken = new Phaser.GameObjects.Image(this, 0, 0, 'search-icon');
		npcCursorToken.setPosition(8 * SCALE, 8 * SCALE);
		npcCursorToken.setOrigin(0);
		npcCursorToken.setScrollFactor(0);
		npcCursorToken.setDepth(100);
		npcCursorToken.setScale(SCALE);
		npcCursorToken.addListener('pointerdown', () => {
			this.selectedLibraryNpcIndex = 0;
			this.highlightingX = 0;
			this.highlightingY = 0;
			this.mapEditorHighlighting.setPosition(
				npcCursorToken.x - 4 * SCALE,
				npcCursorToken.y - 4 * SCALE
			);
		});
		npcCursorToken.setInteractive();
		this.npcLibraryTokens.push(npcCursorToken);
		this.npcLibraryLayer.add(npcCursorToken, true);
		npcKeys.forEach((key, index) => {
			const token = new Phaser.GameObjects.Image(this, 0, 0, key);
			token.setPosition((index + 1) * 40 * SCALE, 0);
			token.setScale(SCALE);
			token.setOrigin(0);
			token.setScrollFactor(0);
			token.setDepth(100);
			token.addListener('pointerdown', () => {
				this.selectedLibraryNpcIndex = index + 1;
				this.highlightingX = (index + 1) * 40 * SCALE;
				this.highlightingY = 0;
				this.mapEditorHighlighting.setPosition(token.x, token.y);
			});
			token.setInteractive();
			this.npcLibraryTokens.push(token);
			this.npcLibraryLayer.add(token, true);
		});
		this.npcLibraryLayer.setVisible(this.activeLayerDropdownElement.value === 'npcs');
		this.add.existing(this.npcLibraryLayer);

		this.itemLibraryLayer = new Phaser.GameObjects.Group(this);

		this.items = [];
		this.itemLibraryTokens = [];
		const itemCursorToken = new Phaser.GameObjects.Sprite(this, 0, 0, 'search-icon', 0);
		itemCursorToken.setPosition(8 * SCALE, 8 * SCALE);
		itemCursorToken.setOrigin(0);
		itemCursorToken.setScale(SCALE);
		itemCursorToken.setScrollFactor(0);
		itemCursorToken.setDepth(100);
		itemCursorToken.addListener('pointerdown', () => {
			this.selectedLibraryItemIndex = 0;
			this.highlightingX = 0;
			this.highlightingY = 0;
			this.mapEditorHighlighting.setPosition(
				itemCursorToken.x - 4 * SCALE,
				itemCursorToken.y - 4 * SCALE
			);
		});
		itemCursorToken.setScale(SCALE);
		itemCursorToken.setInteractive();
		this.itemLibraryTokens.push(itemCursorToken);
		this.itemLibraryLayer.add(itemCursorToken, true);
		Object.values(fixedItems).forEach((item, index) => {
			const token = new Phaser.GameObjects.Sprite(
				this,
				0,
				0,
				'test-items-spritesheet',
				item.iconFrame
			);
			token.setPosition((index + 1) * 40 * SCALE + 12, 10 * SCALE);
			token.setOrigin(0);
			token.setScale(SCALE);
			token.setScrollFactor(0);
			token.setDepth(100);
			token.addListener('pointerdown', () => {
				this.selectedLibraryItemIndex = index + 1;
				this.highlightingX = (index + 1) * 40 * SCALE;
				this.highlightingY = 0;
				this.mapEditorHighlighting.setPosition(token.x - 4 * SCALE, token.y - 4 * SCALE);
			});
			token.setInteractive();
			this.itemLibraryTokens.push(token);
			this.itemLibraryLayer.add(token, true);
		});
		this.itemLibraryLayer.setVisible(this.activeLayerDropdownElement.value === 'npcs');
		this.add.existing(this.itemLibraryLayer);

		this.addToHistory(true);
		this.updateUiForZoomLevel();
	}

	showMapDetailsDialog(wasNewClicked: boolean) {
		const dialog = document.getElementById('mapDetailsDialog')!;
		dialog.style.display = 'flex';

		this.detailsSaveButtonElement.innerText = wasNewClicked ? 'Create' : 'Update';
		if (wasNewClicked) {
			this.roomNameElement.value = '';
		} else {
			this.roomNameElement.value = this.fileData.name || '';
		}
	}

	hideMapDetailsDialog() {
		const dialog = document.getElementById('mapDetailsDialog')!;
		dialog.style.display = 'none';
	}

	getTileLayerForName(layerName: string) {
		switch (layerName) {
			case 'decoration':
				return this.decorationTileLayer;
			case 'overlay':
				return this.overlayTileLayer;
			default:
				return this.tileLayer;
		}
	}

	getActiveLayer() {
		return this.getTileLayerForName(this.activeLayerDropdownElement.value);
	}

	getLayerValuesForName(layerName: string) {
		switch (layerName) {
			case 'decoration':
				return this.roomDecorationLayout;
			case 'overlay':
				return this.roomOverlayLayout;
			default:
				return this.roomLayout;
		}
	}

	getActiveLayerValues() {
		return this.getLayerValuesForName(this.activeLayerDropdownElement.value);
	}

	updateActiveLayer() {
		// drawTileSet registers the library layers pointerdown event listener, and the first event
		// listener to be defined is the one that get's triggered when there are multiple stacked
		// elements with listeners. Therefore, this.drawTileSet must come before changeing the
		// interactivity.
		this.drawTileSet();
		const activeLayerValue = this.activeLayerDropdownElement.value;
		if (activeLayerValue === 'base') {
			this.tileLayer.setInteractive();
			this.decorationTileLayer.removeInteractive();
			this.overlayTileLayer.removeInteractive();
			this.mapEditorHighlighting.setScale(SCALE);
			this.npcLibraryLayer.setVisible(false);
			this.itemLibraryLayer.setVisible(false);
			this.hideNpcDetailsDialog();
			this.hideItemDetailsDialog();
		} else if (activeLayerValue === 'decoration') {
			this.tileLayer.removeInteractive();
			this.decorationTileLayer.setInteractive();
			this.overlayTileLayer.removeInteractive();
			this.mapEditorHighlighting.setScale(SCALE);
			this.npcLibraryLayer.setVisible(false);
			this.itemLibraryLayer.setVisible(false);
			this.hideNpcDetailsDialog();
			this.hideItemDetailsDialog();
		} else if (activeLayerValue === 'overlay') {
			this.tileLayer.removeInteractive();
			this.decorationTileLayer.removeInteractive();
			this.overlayTileLayer.setInteractive();
			this.mapEditorHighlighting.setScale(SCALE);
			this.npcLibraryLayer.setVisible(false);
			this.itemLibraryLayer.setVisible(false);
			this.hideNpcDetailsDialog();
			this.hideItemDetailsDialog();
		} else if (activeLayerValue === 'npcs') {
			this.tileLayer.setInteractive();
			this.decorationTileLayer.removeInteractive();
			this.overlayTileLayer.removeInteractive();
			this.mapEditorHighlighting.setScale(SCALE * 2.5);
			this.itemLibraryLayer.setVisible(false);
			this.npcLibraryLayer.setVisible(true);
		} else if (activeLayerValue === 'items') {
			this.tileLayer.setInteractive();
			this.decorationTileLayer.removeInteractive();
			this.overlayTileLayer.removeInteractive();
			this.mapEditorHighlighting.setScale(SCALE * 2.5);
			this.npcLibraryLayer.setVisible(false);
			this.itemLibraryLayer.setVisible(true);
		}
		this.updateNpcTokens();
		this.updateItemTokens();
		this.updateUiForZoomLevel();
		this.hideNpcDetailsDialog();
		this.hideItemDetailsDialog();
	}

	updateNpcTokens() {
		// Update npc tokens transparency
		const isNpcLayerActive = this.activeLayerDropdownElement.value === 'npcs';
		(this.npcTokens || []).forEach((npc, index) => {
			npc.setAlpha(isNpcLayerActive ? 1 : 0.7);
			if (isNpcLayerActive) {
				npc.on('pointerdown', () => {
					if (this.selectedLibraryNpcIndex !== 0) {
						return;
					}
					const npcData = this.npcs[index];
					this.showNpcDetailsDialog(npcData);
					this.npcTokens.forEach((otherToken) => (otherToken.tint = 0xffffff));
					npc.tint = 0xffcccc;
					this.selectedNpcTokenIndex = index;
				});
				npc.setInteractive();
			} else {
				npc.removeInteractive();
				npc.tint = 0xffffff;
			}
		});
	}

	hideNpcDetailsDialog() {
		const dialog = document.getElementById('npcDetailsDialog')!;
		dialog.style.display = 'none';
		this.selectedNpcTokenIndex = -1;
	}

	showNpcDetailsDialog(npcPosition: NpcPositioning) {
		const dialog = document.getElementById('npcDetailsDialog')!;
		dialog.style.display = 'flex';

		this.npcTypeDropdownElement.value = npcPosition.type;
		this.npcIdElement.value = npcPosition.id;
		this.npcLevelElement.value = npcPosition.level || '+0';
		this.npcXElement.value = `${npcPosition.x}`;
		this.npcYElement.value = `${npcPosition.y}`;
	}

	deleteNpcToken() {
		if (this.selectedNpcTokenIndex === -1) {
			return;
		}

		this.npcTokens[this.selectedNpcTokenIndex].destroy(true);
		this.npcTokens.splice(this.selectedNpcTokenIndex, 1);
		this.npcs.splice(this.selectedNpcTokenIndex, 1);
		this.hideNpcDetailsDialog();
		this.drawRoom();
	}

	saveNpcToken() {
		if (this.selectedNpcTokenIndex === -1) {
			return;
		}

		this.npcTokens[this.selectedNpcTokenIndex].destroy(true);

		const npcPosition: NpcPositioning = {
			...this.npcs[this.selectedNpcTokenIndex],
			type: this.npcTypeDropdownElement.value,
			id: this.npcIdElement.value,
			level: this.npcLevelElement.value,
			x: parseInt(this.npcXElement.value, 10),
			y: parseInt(this.npcYElement.value, 10),
		};

		const npc = spawnNpc(
			this as any,
			npcPosition.type,
			npcPosition.id,
			npcPosition.x * TILE_WIDTH - this.widthInPixels / 2,
			npcPosition.y * TILE_HEIGHT - this.heightInPixels / 2,
			1
		);
		this.add.existing(npc);
		npc.setAlpha(this.activeLayerDropdownElement.value === 'npcs' ? 1 : 0.7);
		npc.setDepth(DEPTHS.npcLayer);
		this.npcTokens = [
			...this.npcTokens.slice(0, this.selectedNpcTokenIndex),
			npc,
			...this.npcTokens.slice(this.selectedNpcTokenIndex + 1),
		];
		this.npcs = [
			...this.npcs.slice(0, this.selectedNpcTokenIndex),
			npcPosition,
			...this.npcs.slice(this.selectedNpcTokenIndex + 1),
		];

		this.hideNpcDetailsDialog();
		this.drawRoom();
	}

	addNpc(x: number, y: number) {
		const npcPosition: NpcPositioning = {
			type: npcKeys[this.selectedLibraryNpcIndex - 1],
			id: `npc-${this.npcs.length}`,
			level: '+0',
			x,
			y,
		};

		const npc = spawnNpc(
			this as any,
			npcPosition.type,
			npcPosition.id,
			npcPosition.x * TILE_WIDTH - this.widthInPixels / 2,
			npcPosition.y * TILE_HEIGHT - this.heightInPixels / 2,
			1
		);
		this.add.existing(npc);
		npc.setAlpha(1);
		npc.setDepth(DEPTHS.npcLayer);
		this.npcTokens.push(npc);
		this.npcs.push(npcPosition);

		this.selectedNpcTokenIndex = this.npcs.length - 1;

		this.showNpcDetailsDialog(npcPosition);
		this.drawRoom();
	}

	updateItemTokens() {
		// Update items tokens transparency
		const isItemLayerActive = this.activeLayerDropdownElement.value === 'items';
		(this.itemTokens || []).forEach((item, index) => {
			item.setAlpha(isItemLayerActive ? 1 : 0.7);
			if (isItemLayerActive) {
				item.on('pointerdown', () => {
					if (this.selectedLibraryItemIndex !== 0) {
						return;
					}
					const itemData = this.items[index];
					this.showItemDetailsDialog(itemData);
					this.itemTokens.forEach((otherToken) => (otherToken.tint = 0xffffff));
					item.tint = 0xffcccc;
					this.selectedItemTokenIndex = index;
				});
				item.setInteractive();
			} else {
				item.removeInteractive();
				item.tint = 0xffffff;
			}
		});
	}

	hideItemDetailsDialog() {
		const dialog = document.getElementById('itemDetailsDialog')!;
		dialog.style.display = 'none';
		this.selectedItemTokenIndex = -1;
	}

	showItemDetailsDialog(itemPosition: ItemsPositioning) {
		const dialog = document.getElementById('itemDetailsDialog')!;
		dialog.style.display = 'flex';

		this.itemIdElement.value = itemPosition.id;
		this.itemXElement.value = `${itemPosition.x}`;
		this.itemYElement.value = `${itemPosition.y}`;
	}

	deleteItemToken() {
		if (this.selectedItemTokenIndex === -1) {
			return;
		}

		this.itemTokens[this.selectedItemTokenIndex].destroy(true);
		this.itemTokens.splice(this.selectedItemTokenIndex, 1);
		this.items.splice(this.selectedItemTokenIndex, 1);
		this.hideItemDetailsDialog();
		this.drawRoom();
	}

	saveItemToken() {
		if (this.selectedItemTokenIndex === -1) {
			return;
		}

		this.itemTokens[this.selectedItemTokenIndex].destroy(true);

		const itemPosition: ItemsPositioning = {
			...this.items[this.selectedItemTokenIndex],
			id: this.itemIdElement.value,
			x: parseInt(this.itemXElement.value, 10),
			y: parseInt(this.itemYElement.value, 10),
		};

		const { x, y, id } = itemPosition;

		const itemData = getItemDataForName(id);
		const itemToken = new WorldItemToken(
			this as any,
			x * TILE_WIDTH - this.widthInPixels / 2,
			y * TILE_HEIGHT - this.heightInPixels / 2,
			id as UneqippableItem,
			itemData,
			0
		);
		itemToken.setAlpha(this.activeLayerDropdownElement.value === 'items' ? 1 : 0.7);
		itemToken.setDepth(DEPTHS.npcLayer);
		this.itemTokens = [
			...this.itemTokens.slice(0, this.selectedItemTokenIndex),
			itemToken,
			...this.itemTokens.slice(this.selectedItemTokenIndex + 1),
		];
		this.items = [
			...this.items.slice(0, this.selectedItemTokenIndex),
			itemPosition,
			...this.items.slice(this.selectedItemTokenIndex + 1),
		];

		this.hideItemDetailsDialog();
		this.drawRoom();
	}

	addItem(x: number, y: number) {
		const itemPosition: ItemsPositioning = {
			id: Object.values(fixedItems)[this.selectedLibraryItemIndex - 1].id,
			x,
			y,
		};

		const { id } = itemPosition;
		const itemData = getItemDataForName(id);
		const itemToken = new WorldItemToken(
			this as any,
			x * TILE_WIDTH - this.widthInPixels / 2,
			y * TILE_HEIGHT - this.heightInPixels / 2,
			id as UneqippableItem,
			itemData,
			0
		);
		this.add.existing(itemToken);
		itemToken.setAlpha(1);
		itemToken.setDepth(DEPTHS.npcLayer);
		this.itemTokens.push(itemToken);
		this.items.push(itemPosition);

		this.selectedItemTokenIndex = this.items.length - 1;

		this.showItemDetailsDialog(itemPosition);
		this.drawRoom();
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
				newRoomLayout[y][x] = this.roomLayout[y]
					? this.roomLayout[y][x] || DEFAULT_TILE
					: DEFAULT_TILE;
				newRoomDecorationLayout[y][x] = this.roomDecorationLayout[y]
					? this.roomDecorationLayout[y][x] || DEFAULT_DECORATION_TILE
					: DEFAULT_DECORATION_TILE;
				newRoomOverlayLayout[y][x] = this.roomOverlayLayout[y]
					? this.roomOverlayLayout[y][x] || DEFAULT_OVERLAY_TILE
					: DEFAULT_OVERLAY_TILE;
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
			case 'base': {
				tileSetName = this.tileSetName;
				backgroundTileSetName = 'base-background';
				break;
			}
			default: {
				return;
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
		this.libraryLayer.setScale(SCALE);
		this.libraryLayer.on('pointerdown', (pointer: { downX: number; downY: number }) => {
			this.selectedTileValues = undefined;
			this.libraryLayer.forEachTile((tile) => {
				tile.clearAlpha();
			});
			const clickX = pointer.downX; // - this.libraryLayer.x;
			const clickY = pointer.downY; // - this.libraryLayer.y;
			const tileX = Math.floor(clickX / TILE_WIDTH / SCALE);
			const tileY = Math.floor(clickY / TILE_HEIGHT / SCALE);
			const clickedTile = this.libraryLayer.getTileAt(tileX, tileY);
			if (clickedTile) {
				this.selectedId = clickedTile.index;
				this.highlightingX = clickedTile.x * TILE_WIDTH * SCALE;
				this.highlightingY = clickedTile.y * TILE_HEIGHT * SCALE;
				const zoomedWidth = this.cameras.main.width * (1 / this.zoomFactor);
				const zoomedHeight = this.cameras.main.height * (1 / this.zoomFactor);
				const zoomedZeroX = (this.cameras.main.width - zoomedWidth) / 2;
				const zoomedZeroY = (this.cameras.main.height - zoomedHeight) / 2;
				this.mapEditorHighlighting.x = zoomedZeroX + this.highlightingX * (1 / this.zoomFactor);
				this.mapEditorHighlighting.y = zoomedZeroY + this.highlightingY * (1 / this.zoomFactor);
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
		this.backgroundLibraryLayer = backgroundMap
			.createLayer(0, backgroundTileSet, 0, 0)
			.setInteractive();
		this.backgroundLibraryLayer.setDepth(DEPTHS.libraryBackgroundLayer);
		this.backgroundLibraryLayer.setScrollFactor(0, 0);
	}

	getDataFromClick(posX: number, posY: number, tileLayer: Phaser.Tilemaps.TilemapLayer) {
		const clickX =
			posX - this.cameras.main.centerX + (this.cameraPositionX - tileLayer.x) * this.zoomFactor;
		const clickY =
			posY - this.cameras.main.centerY + (this.cameraPositionY - tileLayer.y) * this.zoomFactor;
		const tileX = Math.floor(clickX / (TILE_WIDTH * this.zoomFactor));
		const tileY = Math.floor(clickY / (TILE_HEIGHT * this.zoomFactor));
		return [tileX, tileY, tileLayer.getTileAt(tileX, tileY)] as [
			number,
			number,
			Phaser.Tilemaps.Tile
		];
	}

	addToHistory(autosave: boolean) {
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

		if (autosave) {
			this.autoSave();
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
		const activeLayers: (keyof MultiLevelLayout)[] = wasCtrlPressed
			? ['base', 'decoration', 'overlay']
			: [this.activeLayerDropdownElement.value as keyof MultiLevelLayout];
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
		this.addToHistory(true);
		if (!this.selectedTileValues) {
			return;
		}
		const layers = Object.keys(this.selectedTileValues).reduce((obj, tileLayerName) => {
			obj[tileLayerName] = this.getLayerValuesForName(tileLayerName);
			return obj;
		}, {} as { [name: string]: MapLayout });
		Object.entries(layers).forEach(([layerName, layerValues]) => {
			const layerKey = layerName as keyof MultiLevelLayout;
			for (let y = 0; y < this.selectedTileValues![layerKey]!.length; y++) {
				for (let x = 0; x < this.selectedTileValues![layerKey]![y].length; x++) {
					layerValues[tileY + y][tileX + x] = this.selectedTileValues![layerKey]![y][x];
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
			tileHeight: TILE_HEIGHT,
		});
		this.widthInPixels = map.widthInPixels;
		this.heightInPixels = map.heightInPixels;
		const tileSet = map.addTilesetImage(
			`${this.tileSetName}-image`,
			this.tileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);

		const activeLayerValue = this.activeLayerDropdownElement.value;

		this.tileLayer = map.createLayer(0, tileSet, -map.widthInPixels / 2, -map.heightInPixels / 2);
		if (
			activeLayerValue === 'base' ||
			activeLayerValue === 'npcs' ||
			activeLayerValue === 'items'
		) {
			this.tileLayer.setInteractive();
		}
		this.tileLayer.setDepth(DEPTHS.baseLayer);

		const onPointerDown: (
			tilemapLayer: Phaser.Tilemaps.TilemapLayer,
			layoutValues: MapLayout,
			x: number,
			y: number
		) => void = (tilemapLayer, layoutValues, x, y) => {
			const [tileX, tileY, clickedTile] = this.getDataFromClick(x, y, tilemapLayer);
			if (this.activeLayerDropdownElement.value === 'npcs') {
				if (this.selectedLibraryNpcIndex === 0) {
					return;
				}
				this.addNpc(tileX, tileY);
			}
			if (this.activeLayerDropdownElement.value === 'items') {
				if (this.selectedLibraryItemIndex === 0) {
					return;
				}
				this.addItem(tileX, tileY);
			}
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

			this.addToHistory(true);

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

		const onPointerOut: () => void = () => {
			this.isPointerDown = false;
		};

		this.tileLayer.on('pointerdown', (pointer: { downX: number; downY: number }) => {
			onPointerDown(this.tileLayer, this.roomLayout, pointer.downX, pointer.downY);
		});
		this.tileLayer.on('pointermove', (pointer: { position: { x: number; y: number } }) => {
			onPointerMove(this.tileLayer, this.roomLayout, pointer.position.x, pointer.position.y);
		});
		this.tileLayer.on('pointerup', (pointer: { upX: number; upY: number }) => {
			onPointerUp(this.tileLayer, pointer.upX, pointer.upY);
		});
		this.tileLayer.on('pointerout', () => {
			onPointerOut();
		});

		const decorationMap = this.make.tilemap({
			data: this.roomDecorationLayout,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT,
		});
		const decorationTileSet = decorationMap.addTilesetImage(
			`${this.decorationTileSetName}-image`,
			this.decorationTileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.decorationTileLayer = decorationMap.createLayer(
			0,
			decorationTileSet,
			-map.widthInPixels / 2,
			-map.heightInPixels / 2
		);
		if (activeLayerValue === 'decoration') {
			this.decorationTileLayer.setInteractive();
		}
		this.decorationTileLayer.setDepth(DEPTHS.decorationLayer);
		this.decorationTileLayer.on('pointerdown', (pointer: { downX: number; downY: number }) => {
			onPointerDown(
				this.decorationTileLayer,
				this.roomDecorationLayout,
				pointer.downX,
				pointer.downY
			);
		});
		this.decorationTileLayer.on(
			'pointermove',
			(pointer: { position: { x: number; y: number } }) => {
				onPointerMove(
					this.decorationTileLayer,
					this.roomDecorationLayout,
					pointer.position.x,
					pointer.position.y
				);
			}
		);
		this.decorationTileLayer.on('pointerup', (pointer: { upX: number; upY: number }) => {
			onPointerUp(this.decorationTileLayer, pointer.upX, pointer.upY);
		});
		this.decorationTileLayer.on('pointerout', () => {
			onPointerOut();
		});

		const overlayMap = this.make.tilemap({
			data: this.roomOverlayLayout,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_HEIGHT,
		});
		const overlayTileSet = overlayMap.addTilesetImage(
			`${this.overlayTileSetName}-image`,
			this.overlayTileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2
		);
		this.overlayTileLayer = overlayMap.createLayer(
			0,
			overlayTileSet,
			-map.widthInPixels / 2,
			-map.heightInPixels / 2
		);
		if (activeLayerValue === 'overlay') {
			this.overlayTileLayer.setInteractive();
		}
		this.overlayTileLayer.setDepth(DEPTHS.overlayLayer);
		this.overlayTileLayer.on('pointerdown', (pointer: { downX: number; downY: number }) => {
			onPointerDown(this.overlayTileLayer, this.roomOverlayLayout, pointer.downX, pointer.downY);
		});
		this.overlayTileLayer.on('pointermove', (pointer: { position: { x: number; y: number } }) => {
			onPointerMove(
				this.overlayTileLayer,
				this.roomOverlayLayout,
				pointer.position.x,
				pointer.position.y
			);
		});
		this.overlayTileLayer.on('pointerup', (pointer: { upX: number; upY: number }) => {
			onPointerUp(this.overlayTileLayer, pointer.upX, pointer.upY);
		});
		this.overlayTileLayer.on('pointerout', () => {
			onPointerOut();
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

		// Draw NPCs
		(this.npcTokens || []).forEach((token) => {
			token.destroy(true);
		});
		this.npcTokens = [];
		(this.npcs || []).forEach((npcPosition, index) => {
			const npc = spawnNpc(
				this as any,
				npcPosition.type,
				npcPosition.id,
				(npcPosition.x * TILE_WIDTH - map.widthInPixels / 2) / 3,
				(npcPosition.y * TILE_HEIGHT - map.heightInPixels / 2) / 3,
				1
			);
			this.npcTokens.push(npc);
			this.add.existing(npc);
			npc.setAlpha(this.activeLayerDropdownElement.value === 'npcs' ? 1 : 0.7);
			npc.setDepth(DEPTHS.npcLayer);
			npc.setScale(1); // Reset scale from Enemy Token
			if (index === this.selectedNpcTokenIndex) {
				npc.tint = 0xffcccc;
			}
		});
		this.updateNpcTokens();

		// Draw items
		(this.itemTokens || []).forEach((token) => {
			token.destroy(true);
		});
		this.itemTokens = [];
		(this.items || []).forEach((itemPosition, index) => {
			const { x, y, id } = itemPosition;

			const itemData = getItemDataForName(id);
			const itemToken = new WorldItemToken(
				this as any,
				(x * TILE_WIDTH - this.widthInPixels / 2) / 3,
				(y * TILE_HEIGHT - this.heightInPixels / 2) / 3,
				id as UneqippableItem,
				itemData,
				0
			);

			this.itemTokens.push(itemToken);
			this.add.existing(itemToken);
			itemToken.setAlpha(this.activeLayerDropdownElement.value === 'items' ? 1 : 0.7);
			itemToken.setDepth(DEPTHS.itemLayer);
			itemToken.setScale(1); // Reset scale from Item Token
			if (index === this.selectedItemTokenIndex) {
				itemToken.tint = 0xffcccc;
			}
		});
		this.updateItemTokens();
	}

	renderDebugGraphics() {
		// tslint:disable: no-magic-numbers
		const debugGraphics = this.add.graphics().setAlpha(0.75);
		this.tileLayer.renderDebug(debugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
		});
		// tslint:enable
	}

	getBaseScaleForMapEditorHighliting() {
		const activeLayerValue = this.activeLayerDropdownElement.value;

		if (activeLayerValue === 'base') return 1;
		else if (activeLayerValue === 'decoration') return 1;
		else if (activeLayerValue === 'overlay') return 1;
		else if (activeLayerValue === 'npcs') return 2.5;
		else if (activeLayerValue === 'items') return 2.5;
		return 1;
	}

	updateUiForZoomLevel() {
		this.cameras.main.setZoom(this.zoomFactor);
		this.libraryLayer.setScale((1 / this.zoomFactor) * SCALE);
		this.backgroundLibraryLayer.setScale((1 / this.zoomFactor) * SCALE);
		this.mapEditorHighlighting.setScale(
			(1 / this.zoomFactor) * SCALE * this.getBaseScaleForMapEditorHighliting()
		);
		const newWidth = this.cameras.main.width * (1 / this.zoomFactor);
		const newHeight = this.cameras.main.height * (1 / this.zoomFactor);
		const newX = (this.cameras.main.width - newWidth) / 2;
		const newY = (this.cameras.main.height - newHeight) / 2;
		this.libraryLayer.setPosition(newX, newY);
		this.backgroundLibraryLayer.setPosition(newX, newY);
		this.mapEditorHighlighting.x = newX + this.highlightingX * (1 / this.zoomFactor);
		this.mapEditorHighlighting.y = newY + this.highlightingY * (1 / this.zoomFactor);
		this.positionText.setScale(1 / this.zoomFactor);
		this.positionText.setPosition(
			newX + POSITION_TEXT_X_OFFSET * (1 / this.zoomFactor) * SCALE,
			this.cameras.main.height - POSITION_TEXT_Y_OFFSET * (1 / this.zoomFactor) * SCALE - newY
		);

		this.npcLibraryTokens.forEach((token, index) => {
			token.setScale((1 / this.zoomFactor) * SCALE);
			token.setPosition(
				newX + index * 40 * (1 / this.zoomFactor) * SCALE + (index === 0 ? 4 * SCALE : 0),
				newY + (index === 0 ? 4 * SCALE : 0)
			);
		});
		this.itemLibraryTokens.forEach((token, index) => {
			token.setScale((1 / this.zoomFactor) * SCALE * (index === 0 ? 1 : 1.5));
			token.setPosition(
				newX + index * 40 * (1 / this.zoomFactor) * SCALE + (index === 0 ? 4 * SCALE : 4),
				newY + (index === 0 ? 4 * SCALE : 4)
			);
		});
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
		if (
			this.oneKey.isDown ||
			this.twoKey.isDown ||
			this.threeKey.isDown ||
			this.fourKey.isDown ||
			this.fiveKey.isDown
		) {
			let newLayer = 'base';
			if (this.oneKey.isDown) newLayer = 'base';
			else if (this.twoKey.isDown) newLayer = 'decoration';
			else if (this.threeKey.isDown) newLayer = 'overlay';
			else if (this.fourKey.isDown) newLayer = 'npcs';
			else if (this.fiveKey.isDown) newLayer = 'items';

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
		if (this.rKey.isDown && !this.wasUndoDown) {
			this.wasUndoDown = true;
			const historyEntry = this.tilesetHistory.pop();
			if (historyEntry) {
				this.roomLayout = historyEntry.base;
				this.roomDecorationLayout = historyEntry.decoration;
				this.roomOverlayLayout = historyEntry.overlay;
				this.drawRoom();
			}
			if (this.tilesetHistory.length === 0) {
				this.addToHistory(true);
			}
		}
		this.wasUndoDown = this.rKey.isDown;
		this.wasTKeyDown = this.tKey.isDown;

		if (this.zoomIn.isDown && !this.wasZoomInDown) {
			this.wasZoomInDown = true;
			this.zoomFactor = Math.min(SCALE, this.zoomFactor * 2);
			this.updateUiForZoomLevel();
		}
		this.wasZoomInDown = this.zoomIn.isDown;

		if (this.zoomOut.isDown && !this.wasZoomOutDown) {
			this.wasZoomOutDown = true;
			this.zoomFactor = Math.max(MIN_ZOOM_LEVEL * SCALE, this.zoomFactor / 2);
			this.updateUiForZoomLevel();
		}
		this.wasZoomOutDown = this.zoomOut.isDown;

		// tslint:disable no-magic-numbers
		this.tileLayer.forEachTile((tile) => (tile.tint = 0xffffff));
		this.decorationTileLayer.forEachTile((tile) => (tile.tint = 0xffffff));
		this.overlayTileLayer.forEachTile((tile) => (tile.tint = 0xffffff));

		if (this.shiftKey.isDown) {
			const position = this.input.mousePointer.position;
			const [_tileX, _tileY, hoveredTile] = this.getDataFromClick(
				position.x,
				position.y,
				this.tileLayer
			);
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

	getExportData() {
		const roomNameValue = this.roomNameElement.value;

		const tilesetValue = this.tilesetDropdownElement.value;
		const decorationTilesetValue = this.tilesetDecorationDropdownElement.value;
		const overlayTilesetValue = this.tilesetOverlayDropdownElement.value;

		const data = {
			scripts: [],
			...this.fileData,
			npcs: this.npcs,
			items: this.items,
			openings: JSON.stringify(this.fileData.openings || []),
			name: roomNameValue,
			tileset: tilesetValue,
			decorationTileset: decorationTilesetValue,
			overlayTileset: overlayTilesetValue,
			layout: JSON.stringify(this.roomLayout),
			decorations: JSON.stringify(this.roomDecorationLayout),
			overlays: JSON.stringify(this.roomOverlayLayout),
		};
		return data;
	}

	autoSave() {
		const data = this.getExportData();

		if (!data.name) {
			return;
		}

		this.backupDatabase.doc(data.name).set(data);
	}
}
