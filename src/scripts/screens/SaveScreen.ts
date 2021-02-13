import { UiDepths } from '../helpers/constants';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

export default class DialogScreen extends OverlayScreen {
	dialogText: Phaser.GameObjects.BitmapText;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 40, 320, 570, 80);

		this.dialogText = new Phaser.GameObjects.BitmapText(
			scene, 24, 308, 'pixelfont', '', 12);
		this.dialogText.setOrigin(0, 0);
		this.dialogText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.dialogText.setScrollFactor(0);
		this.add(this.dialogText, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);

	}

	save() {
		let jsonData: string = '{';
		jsonData += '"playerCharacter": ['      + JSON.stringify(globalState.playerCharacter) +'],\n';
		jsonData += '"gameTime": '              + `${globalState.gameTime}\n`;
		jsonData += '"npcs": ['                 + JSON.stringify(globalState.npcs) +'],\n';
		jsonData += '"dungeon": ['              + JSON.stringify(globalState.dungeon) +'],\n';
		jsonData += '"availableRooms": ['       + JSON.stringify(globalState.availableRooms) +'],\n';
		jsonData += '"availableTilesets": ['    + JSON.stringify(globalState.availableTilesets) +'],\n';
		jsonData += '"currentLevel": ['         + JSON.stringify(globalState.currentLevel) +'],\n';
		jsonData += '"roomAssignment": ['       + JSON.stringify(globalState.roomAssignment) +'],\n';
		jsonData += '"inventory": ['            + JSON.stringify(globalState.inventory) +']';
		jsonData += '}';

		this.download(jsonData, 'json.txt', 'text/plain');
	}

	download(content: string, fileName: string, contentType: string) {
		const a = document.createElement("a");
		const file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}
}
