import { Game } from "phaser";
import NPC from "../worldstate/NPC"

export default class Enemy extends NPC {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, 'enemy')
      scene.add.existing(this)
      scene.physics.add.existing(this)
      this.enemy = 1;
      //this.body.setCircle(10, 10, 12);
      this.setInteractive()
        .on('pointerdown', () => {
            this.health--;
        })
    }
    public update(px: number, py: number) {
        if(this.health <= 0){
            this.destroy();
        }
        const distance = Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));

        if(distance < this.vision){

            const xSpeed = (px-this.x)/(Math.abs(px-this.x)+Math.abs(py-this.y))*this.movementSpeed;
            const ySpeed = (py-this.y)/(Math.abs(px-this.x)+Math.abs(py-this.y))*this.movementSpeed;
            this.setVelocityX(xSpeed);
            this.setVelocityY(ySpeed);
        }
        else {
            this.setVelocityX(0);
            this.setVelocityY(0);
        }
      }
  }