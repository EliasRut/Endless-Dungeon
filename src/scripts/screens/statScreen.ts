import globalState from "../worldstate";
import OverlayScreen from "./overlayScreen";

export default class StatScreen extends OverlayScreen {
  constructor(scene: Phaser.Scene) {
    super(scene, 64, 80, 200, 220);

    const header = new Phaser.GameObjects.BitmapText(scene, 56, 74, 'pixelfont', "Statistics", 16);
    header.setOrigin(0);
    header.setDepth(5);
    this.add(header, true);

    // const lableStat: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Arial', fontSize: '12px', color: '#333' }

    const currentHealth = globalState.playerCharacter.health;
    // const maxHealth = globalState.playerCharacter.maxhealth;
    const currentDamage = globalState.playerCharacter.damage;
    // const currentMovSpeed = globalState.playerCharacter.speed;

    const lableHealth = new Phaser.GameObjects.BitmapText(scene, 54, 114, 'pixelfont', "Health", 10);
    const lableHealthValue = new Phaser.GameObjects.BitmapText(scene, 136, 114, 'pixelfont', `${currentHealth}/120`, 10); 
    lableHealth.setDepth(5);
    lableHealthValue.setDepth(5);
    this.add(lableHealth, true);
    this.add(lableHealthValue, true);

    const lableDamage = new Phaser.GameObjects.BitmapText(scene, 54, 132, 'pixelfont', "Damage", 10);
    const lableDamageValue = new Phaser.GameObjects.BitmapText(scene, 136, 132, 'pixelfont', `${currentDamage}`, 10);
    lableDamage.setDepth(5);
    lableDamageValue.setDepth(5);
    this.add(lableDamage, true);
    this.add(lableDamageValue, true);

    const lableMovSpeed = new Phaser.GameObjects.BitmapText(scene, 54, 150, 'pixelfont', "Speed", 10);
    // const lableMovSpeedValue = new Phaser.GameObjects.Text(scene, 146, 140, 'pixelfont', `${currentMovSpeed}`, 10);
    lableMovSpeed.setDepth(5);
    // lableMovSpeedValue.setDepth(5);
    this.add(lableMovSpeed, true);
    // this.add(lableMovSpeedValue, true);

    // const lableMovSpeed = new Phaser.GameObjects.BitmapText(scene, 54, 150, "Speed", 
    //   lableStat
    // );
  }
}