import { Game } from "phaser";
import { Facings, facingToSpriteNameMap, VISITED_TILE_TINT } from "../helpers/constants";
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
import Weapon from "./weapon";
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';

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

  public checkLoS(player: PlayerCharacter) {
    // Instead of ray tracing we're using the players line of sight calculation, which tints the
    // tile the enemy stands on.
    const tile = this.getOccupiedTile();
    return tile && tile.tint !== VISITED_TILE_TINT && tile.tint > 0;
    // var ray = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
    // var tiles = this.scene.tileLayer.getTilesWithinShape(ray);



    // for (let i = 0; i < tiles.length - 1; i++) {
    //   if (tiles[i].canCollide === true) {
    //     break;
    //   }
    //   if (i === tiles.length - 2) {
    //     // console.log("check lose true");
    //     return true;
    //   }
    // }
    // // console.log("check los false");
    // return false;
  }

  dropItem(player: PlayerCharacter, scene: MainScene) {
    if(this.scene === undefined) { 
      // TODO find out when this happens
      return;
    }
    const sc = scene;
    const rndItem = Math.floor(Math.random() * 63); // todo calculate from tileset
    const length = sc.weapon.push(new Weapon(sc, this.x, this.y, rndItem));
    sc.weapon[length-1].setDepth(1);
  }

  private getOccupiedTile() {
    if (this.body) {
      const x = Math.round(this.body.x / TILE_WIDTH);
      const y = Math.round(this.body.y / TILE_HEIGHT);
      return this.scene.tileLayer.getTileAt(x, y);
    };
    return null;
  }

  //update from main Scene
  public update(time: number) {
    const tile = this.getOccupiedTile();
    if (tile) {
      this.tint = tile.tint;
      this.setVisible(tile.tint !== VISITED_TILE_TINT)
    }
  };

  //destroy the enemy
  destroy() {
    super.destroy();
  }

  //attack our hero
  abstract attack(time: number);
}