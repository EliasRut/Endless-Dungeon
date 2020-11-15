import ItemToken from "../objects/itemToken";
import MainScene from "../scenes/mainScene";
import globalState from '../worldstate/index';

export default class Inventory {
    public itemOffsetX = 0;
    public itemOffsetY = 0;
    public xBoxes = 8; //starts left
    public yBoxes = 10; //starts top
    public bag: integer[][];
    public head;
    public necklace;
    public mainhand;
    public offhand;
    public chest;
    public leftRing;
    public rightRing;
    public belt;
    public gloves;
    public boots;
    constructor() {
        this.bag = [];
        for (let x = 0; x < this.xBoxes; x++) {  
            this.bag[x] = [];                                  
            for (let y = 0; y < this.yBoxes; y++) {
                this.bag[x][y] = 0;
            }
        }
    }

    public sortIntoInventory(item: ItemToken){
        for (let x = 0; x < this.xBoxes; x++) {
            for (let y = 0; y < this.yBoxes; y++) {
                if(this.bag[x][y] === 0){
                    item.itemLocation = x+(y*this.xBoxes) + 1;
                    this.bag[x][y] = 1;
                    //place into actual inventory, box size 16
                    item.x = this.itemOffsetX+436+(16*x);
                    item.y = this.itemOffsetY+112+(16*y);    
                    return true;
                }
            }
        }
        return false;
    }
    public equip(item: ItemToken){        
        if(this.mainhand != undefined){
            this.unequip(this.mainhand)
        }
        item.stateObject.equip(globalState.playerCharacter)
        item.x = this.itemOffsetX+290;
        item.y = this.itemOffsetY+163;
        let freeBag = item.itemLocation -1;
        this.bag[freeBag % this.xBoxes][Math.floor(freeBag/this.xBoxes)] = 0;
        item.itemLocation = 81
        this.mainhand = item;
    }
    public unequip(item: ItemToken){
        item.stateObject.unequip(globalState.playerCharacter)
        this.sortIntoInventory(item)
        this.mainhand = undefined;
    }
}