import Model, {TGameObject, TGameState} from "./Model";
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import {ColorBlock} from './ColorBlock'
import {Bonus} from './ColorBlock'

export type TGameElements = {
    platform: PIXI.Sprite;
    ball: PIXI.Sprite;
    blocks: PIXI.Sprite[];
    bonusSprite: PIXI.Sprite[];
    scoreText: PIXI.Text[];
}

export default class View {

    private _model: Model;

    private _element: Element | null; //дом. елемент
    private readonly _width: number; //ширина ігрового поля
    private readonly _height: number; //висота ігрового поля
    public app: PIXI.Application; //полотно
    private _appGame: PIXI.Sprite; //беграунд
    private _blocksSprite: PIXI.Sprite[] = []; //масив ігрових блоків
    private _bonusSprite: PIXI.Sprite[] = []; //масив  блоків бонусів
    private _scoreText: PIXI.Text[] = [];
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
    // отримуємо ігрові елементи
    public getElementsGame(): TGameElements {
        return {
            platform: this._platform,
            ball: this._ball,
            blocks: this._blocksSprite,
            bonusSprite: this._bonusSprite,
            scoreText: this._scoreText
        };
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
    //створюємо текст балів
    private createTextScore(sprite: PIXI.Sprite): PIXI.Text {
        const x = sprite.x;
        const y = sprite.y;
        const nameSprite = sprite.name;
        const style = new PIXI.TextStyle({
            fill: "#212121",
            fontSize: 20,
            stroke: "#fafafa",
            strokeThickness: 2
        });
        const text: PIXI.Text = new PIXI.Text('+10',style);
        text.x = x;
        text.y = y;
        return text;
    }

    //------------------- renderSprite ---------------------//
    //малюємо ігровий екран
    public renderMainScreen(): void {
        this.renderPlayField(); //малюємо ігрове поле
    }
    //перестаємо малювати блок (може цей метод краже розмістити в моделі?)
    public deleteBlock(block: PIXI.Sprite): void {
        const index = this._blocksSprite.indexOf(block); //отримуємо індекс елемента
        this._blocksSprite.splice(index,1); //видпляємо елемент з масиву
        const text: PIXI.Text = this.createTextScore(block); //створюємо текст балів
        this._scoreText.push(text);
    }
    //малюємо ігрове поле
    private renderPlayField(): void {
        let nameBonuses: string[] = this._model.getState().nameBonuses;
        this.app.stage.addChild(this._appGame); // малюємо беграунд
        this.renderElementsField(this._blocksSprite); // малюємо блоки
        this.renderBonuses(this._bonusSprite, nameBonuses); // малюємо бонуси
        this.app.stage.addChild(this._platform);    // малюємо платформу
        this.app.stage.addChild(this._ball);    // малюємо кульку
    }
    //малюємо елементи, в масиві
    private renderElementsField(blocks: PIXI.Sprite[]): void {
        for (let i = 0; i < blocks.length; i++) {
            this.app.stage.addChild(blocks[i]);
        }
        /////////////////////////////////////////////////////
        for (let i = 0; i < this._scoreText.length; i++) {
            this.renderScoreText(this._scoreText[i]);
        }
    }
    //малюємо елементи, в масиві
    private renderBonuses(bonuses: PIXI.Sprite[], nameBonuses: string[]): void {
        for (let i = 0; i < nameBonuses.length; i++) {
            for (let j = 0; j < bonuses.length; j++) {
                if (bonuses[j].name == nameBonuses[i]) {
                    this.app.stage.addChild(bonuses[j]);
                } else {
                    this.app.stage.removeChild(bonuses[j]);
                }
            }
        }
    }
    //малюємо текст балів
    private renderScoreText(text: PIXI.Text): void {
        this.app.stage.addChild(text);
    }
    //------------------- renderTWEEN ---------------------//
    public moveTS(text: PIXI.Text[]): void {
        for (let i = 0; i < text.length; i++) {
            this.moveTextScore(text[i]);
        }
    }
    //НЕДОГАНЯЮ ДЕ ВИКЛИКАТИ ДЛЯ КОРРЕКТНОЇ РОБОТИ....
    private moveTextScore(text: PIXI.Text): void {
        const from = { //від
            y: text.y,
            alpha: 0
        }
        const to = {    //до
            y: text.y + 10,
            alpha: 1
        }
        // console.log(from.y)
        // console.log(to.y)
        let tween = new TWEEN.Tween(from);
        tween.to(from,1000);
        tween.onUpdate(() => {
            text.y = to.y;
            if (text.y >= to.y) {
                //console.log(1)
                //text.alpha = from.alpha;
                tween.stop();
            }
    });
        tween.start();
    }
}