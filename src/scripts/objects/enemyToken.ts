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
import { TILE_WIDTH, TILE_HEIGHT, DUNGEON_WIDTH, DUNGEON_HEIGHT } from '../helpers/generateDungeon';

export default abstract class EnemyToken extends CharacterToken {
  fireballEffect: FireBallEffect | undefined;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  scene: MainScene;
  tokenName: string;
  attackRange: number;
  attackedAt: number = -Infinity;
  lastUpdate: number = -Infinity;
  aggroLinger: number = 5000;
  aggro: boolean = false;
  target: Phaser.Geom.Point;

  constructor(scene: MainScene, x: number, y: number, tokenName: string) {
    super(scene, x, y, tokenName);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.stateObject = new Enemy(tokenName, 10, 10, 35);
    this.body.setCircle(10, 10, 12);
    this.tokenName = tokenName;
    this.target = new Phaser.Geom.Point(0, 0);

  }

  public getDistance(px: number, py: number) {
    const x = this.x - px;
    const y = this.y - py;
    return Math.hypot(x, y);
    //return Math.sqrt(x * x + y * y);
  }

  public checkLoS() {
    // Instead of ray tracing we're using the players line of sight calculation, which tints the
    // tile the enemy stands on.
    const tile = this.getOccupiedTile();
    return tile && tile.tint !== VISITED_TILE_TINT && tile.tint > 0;
    // const player = globalState.playerCharacter;
    // const ray = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);

    // for(let x = 0; x < 128; x++){
    //   for(let y = 0; y < 128; y++){
    //     const tile = this.scene.tileLayer.getTileAt(x, y, true);
    //     const tileToRect = new Phaser.Geom.Rectangle(tile.x, tile.y, tile.width, tile.height);
    //     if(this.scene.isBlockingTile[x][y]){
    //       if(Phaser.Geom.Intersects.LineToRectangle(ray, tile)){
    //         console.log("intersect false");
    //         return false;
    //       }
    //       }
    //   }
    // }
    // console.log("check los true");
    // return true;

    // const tiles = this.scene.tileLayer.getTilesWithinShape(ray);
    // for (let i = 0; i < tiles.length - 1; i++) {
    //   if (tiles[i].canCollide === true) {
    //     break;
    //   }
    //   if (i === tiles.length - 2) {
    //     console.log("check los true");
    //     return true;
    //   }
    // }
    // console.log("check los false");
    // return false;
  }

  dropItem() {
    if(this.scene === undefined) {
      // TODO find out when this happens
      return;
    }
    const rndItem = Math.floor(Math.random() * 63); // todo calculate from tileset
    const length = this.scene.weapon.push(new Weapon(this.scene, this.x, this.y, rndItem));
    this.scene.weapon[length-1].setDepth(1);
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

    //set aggro boolean, use a linger time for aggro
    if (this.lastUpdate <= time) {
      const player = globalState.playerCharacter;
      const distance = this.getDistance(player.x, player.y);
      if (distance < this.stateObject.vision && this.checkLoS()) {
        this.aggro = true;
        this.lastUpdate = time;
        this.target.x = player.x;
        this.target.y = player.y;
        console.log("aggro'd");
      }
      else if(this.aggro
        && this.lastUpdate + this.aggroLinger < time){
        console.log("lost aggro");
        this.aggro = false;
      }
    }
  };

  //destroy the enemy
  destroy() {
    super.destroy();
  }

  //attack our hero
  abstract attack(time: number);
}