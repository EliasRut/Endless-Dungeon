import globalState from "../worldstate";
import OverlayScreen from "./overlayScreen";

export default class StatScreen extends OverlayScreen {
  lableHealthValue: Phaser.GameObjects.BitmapText;
  lableDamageValue: Phaser.GameObjects.BitmapText;
  lableMovSpeedValue: Phaser.GameObjects.BitmapText;


  constructor(scene: Phaser.Scene) {
    super(scene, 64, 80, 200, 220);

    const header = new Phaser.GameObjects.BitmapText(scene, 54, 74, 'pixelfont', "Statistics", 16);
    header.setOrigin(0);
    header.setDepth(5);
    header.setScrollFactor(0);
    this.add(header, true);

    // const lableStat: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Arial', fontSize: '12px', color: '#333' }

    const currentHealth = globalState.playerCharacter.health;
    const maxHealth = globalState.playerCharacter.maxHealth;
    const currentDamage = globalState.playerCharacter.damage;
    const currentMovSpeed = globalState.playerCharacter.movementSpeed;

    const lableHealth = new Phaser.GameObjects.BitmapText(scene, 54, 114, 'pixelfont', "Health", 10);
    this.lableHealthValue = new Phaser.GameObjects.BitmapText(scene, 136, 114, 'pixelfont', `${currentHealth}/${maxHealth}`, 10); 
    lableHealth.setDepth(5);
    lableHealth.setScrollFactor(0);
    this.lableHealthValue.setDepth(5);
    this.lableHealthValue.setScrollFactor(0);
    this.add(lableHealth, true);
    this.add(this.lableHealthValue, true);

    const lableDamage = new Phaser.GameObjects.BitmapText(scene, 54, 132, 'pixelfont', "Damage", 10);
    this.lableDamageValue = new Phaser.GameObjects.BitmapText(scene, 136, 132, 'pixelfont', `${currentDamage}`, 10);
    lableDamage.setDepth(5);
    lableDamage.setScrollFactor(0);
    this.lableDamageValue.setDepth(5);
    this.lableDamageValue.setScrollFactor(0);
    this.add(lableDamage, true);
    this.add(this.lableDamageValue, true);

    const lableMovSpeed = new Phaser.GameObjects.BitmapText(scene, 54, 150, 'pixelfont', "Speed", 10);
    this.lableMovSpeedValue = new Phaser.GameObjects.BitmapText(scene, 136, 150, 'pixelfont', `${currentMovSpeed}`, 10);
    lableMovSpeed.setDepth(5);
    lableMovSpeed.setScrollFactor(0);
    this.lableMovSpeedValue.setDepth(5);
    this.lableMovSpeedValue.setScrollFactor(0);
    this.add(lableMovSpeed, true);
    this.add(this.lableMovSpeedValue, true);

    // const lableMovSpeed = new Phaser.GameObjects.BitmapText(scene, 54, 150, "Speed", 
    //   lableStat
    // );
  }

  update () {
    const player = globalState.playerCharacter;
    this.lableHealthValue.setText(`${player.health}/${player.maxHealth}`);
    this.lableDamageValue.setText(`${player.damage}`);
    this.lableMovSpeedValue.setText(`${player.movementSpeed}`);
  }

}