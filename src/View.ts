import Model, {TGameObject, TGameState} from "./Model";
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import {ColorBlock} from './ColorBlock'
import {Bonus} from './ColorBlock'

export default class View {

    private _model: Model;

    private _element: Element | null; //дом. елемент
    private readonly _width: number; //ширина ігрового поля
    private readonly _height: number; //висота ігрового поля
    public app: PIXI.Application; //полотно
    private _appGame: PIXI.Sprite; //беграунд
    private _blocksSprite: PIXI.Sprite[] = []; //масив ігрових блоків
    private _bonusSprite: PIXI.Sprite[] = []; //масив  блоків бонусів
    private _platform: PIXI.Sprite = this.createPlatform(); // платформа
    private _ball: PIXI.Sprite = this.createBall(); // кулька

    constructor(element: Element | null, width: number, height: number, model: Model) {
        this._element = element;
        this._width = width;
        this._height = height;
        this._model = model
        this.app = new PIXI.Application({
            width: this._width, //ширина ігрового полотна
            height: this._height, //висота ігрового полотна
            backgroundColor: 0x111111, // колір полотна
            resolution: window.devicePixelRatio || 1,
        });
        this.init();

    }

    //------------------- manageStatus ---------------------//
    private init(): void {
        //створюємо ігрове поле
        document.body.appendChild(this.app.view);//додаємо полотно, яке створили
        this.reset();
    }
    //перезапуск
    private reset(): void {
        const state = this._model.getState();
        this.createPlayField(state); // створюємо об'єкти ігрового поля
    }

    //------------------- createSprite ---------------------//
    //створюємо блоки ігрового поля
    private createPlayField({playField}: TGameState) {
        //створюємо беграунд
        this._appGame = this.createElementGame('./assets/BG.jpg', 0,100,560,550,'appGame');
        //створюємо об'єкти рівня
        let blockY = 120;
        for (let y = playField.length - 1; y >= 0; y--) {
            let blockX = 25;
            for (let x = 0; x < playField[y].length; x++) {
                const color: string = ColorBlock[playField[y][x].typeBlock];
                //створюємо бонуси, та заносимо в масив
                this._blocksSprite.push(this.createElementGame(`./assets/${color}.png`,blockX,blockY,30,50, `${color}_block_`+ x + '_' + y));
                this.createBonusBlocks(playField[y][x],blockX,blockY,x,y); // створюємо бонуси
                blockX += 50;
            }
            blockY += 35;
        }
    }
    //створюємо бонуси
    private createBonusBlocks(bonus: TGameObject, blockX,blockY,x,y): void {
        if (bonus.typeBonus != -1) {
            const name: string = Bonus[bonus.typeBonus];
            this._bonusSprite.push(this.createElementGame(`./assets/${name}.png`,blockX,blockY,30,50, `${name}_block_`+ x + '_' + y));
        }
    }
    //створюємо платформу
    private createPlatform(): PIXI.Sprite {
        let widthPlatform = 100;
        return this.createElementGame('./assets/Line-1.png',210,585,14,widthPlatform, 'platform');
    }
    //створюємо кульку
    private createBall(): PIXI.Sprite {
        return this.createElementGame('./assets/Ball.png',250,560,25,25, 'ball');
    }
    //створюємо ігровий блок
    private createElementGame (name: string,x: number, y: number,height: number, width: number, nameBlock: string): PIXI.Sprite {
        const sprite = PIXI.Sprite.from(name);
        sprite.x = x;
        sprite.y = y;
        sprite.height = height;
        sprite.width = width;
        sprite.name = nameBlock;
        return sprite;
    }

    //------------------- renderSprite ---------------------//
    //малюємо ігровий екран
    public renderMainScreen(): void {
        this.renderPlayField(); //малюємо ігрове поле
    }
    //малюєио ігрове поле
    private renderPlayField(): void {
        this.app.stage.addChild(this._appGame); // малюємо беграунд
        this.renderElementsField(this._blocksSprite); // малюємо блоки
        this.renderElementsField(this._bonusSprite);    // малюємо бонуси
        this.app.stage.addChild(this._platform);    // малюємо платформу
        this.app.stage.addChild(this._ball);    // малюємо кульку
    }
    //малюємо елементи, в масиві
    private renderElementsField(blocks: PIXI.Sprite[]): void {
        for (let i = 0; i < blocks.length; i++) {
            this.app.stage.addChild(blocks[i]);
        }
    }


}