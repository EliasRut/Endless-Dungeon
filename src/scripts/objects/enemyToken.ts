import { Game } from "phaser";
import { Facings, facingToSpriteNameMap } from "../helpers/constants";
import NPC from "../worldstate/NPC"
import Player from "../worldstate/PlayerCharacter"
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import CharacterToken from './characterToken';
import Enemy from "../worldstate/Enemy";
import FireBallEffect from '../objects/fireBallEffect';
import globalState from "../worldstate";
import PlayerCharacterToken from '../objects/playerCharacterToken'
import MainScene from "../scenes/mainScene";
import { AbilityType } from "../abilities/abilityData";
import PlayerCharacter from "../worldstate/PlayerCharacter";

export default abstract class EnemyToken extends CharacterToken {
  fireballEffect: FireBallEffect | undefined;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  scene: MainScene;
  tokenName: string;
  proximity: number;
  attackedAt: number = -Infinity;

  constructor(scene: MainScene, x: number, y: number, tokenName: string) {
    super(scene, x, y, tokenName);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.stateObject = new Enemy(tokenName, 10, 10, 35);
    this.body.setCircle(10, 10, 12);
    this.tokenName = tokenName;

  }

  public getDistance(player: PlayerCharacter) {
    const px = player.x;
    const py = player.y;
    return Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));
  }

  healthCheck() {
    //check death
    if (this.stateObject.health <= 0){
        console.log("dying enemy")
        this.destroy();
        return;
    }
  }

  //update from main Scene
  public abstract update(time: number,);

  //destroy the enemy
  destroy() {
    super.destroy();
  }

  //attack our hero
  abstract attack(time: number);
}