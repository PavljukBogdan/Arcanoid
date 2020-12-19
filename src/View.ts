import Model, {TGameObject, TGameState} from "./Model";
import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'
import {Bonus, ColorBlock, GameState} from './ColorBlock'
import ViewText from "./ViewText";

export type TGameElements = {
    platform: PIXI.Sprite;
    ball: PIXI.Sprite;
    blocks: PIXI.Sprite[];
    bonusSprite: PIXI.Sprite[];
    scoreText: PIXI.Text[];
    app: PIXI.Application;
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
    private _scoreText: PIXI.Text[] = []; //масив тексту вибитих блоків
    private _platform: PIXI.Sprite = this.createPlatform(); // платформа
    private _ball: PIXI.Sprite = this.createBall(); // кулька

    constructor(element: Element | null, width: number, height: number, model: Model) {
        this._element = element;
        this._width = width;
        this._height = height;
        this._model = model;

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
    public reset(): void {
        const state = this._model.getState();
        this._bonusSprite = [];
        this._blocksSprite = this.createPlayField(state); // створюємо об'єкти ігрового поля
        this._platform = this.createPlatform(); // платформа
        this._ball = this.createBall(); // кулька
        this._scoreText = [];
        this.createTextScoreField();
    }
    // отримуємо ігрові елементи
    public getElementsGame(): TGameElements {
        return {
            platform: this._platform,
            ball: this._ball,
            blocks: this._blocksSprite,
            bonusSprite: this._bonusSprite,
            scoreText: this._scoreText,
            app: this.app
        };
    }

    //------------------- createSprite ---------------------//
    //створюємо блоки ігрового поля
    private createPlayField({playField}: TGameState): PIXI.Sprite[] {
        const blockSprite: PIXI.Sprite[] = [];
        //створюємо беграунд
        this._appGame = this.createElementGame('./assets/BG.jpg', 0,100,560,550,'appGame');
        //створюємо об'єкти рівня
        let blockY = 120;
        for (let y = playField.length - 1; y >= 0; y--) {
            let blockX = 25;
            for (let x = 0; x < playField[y].length; x++) {
                const color: string = ColorBlock[playField[y][x].typeBlock];
                //створюємо бонуси, та заносимо в масив
                blockSprite.push(this.createElementGame(`./assets/${color}.png`,blockX,blockY,30,50, `${color}_block_`+ x + '_' + y));
                this.createBonusBlocks(playField[y][x],blockX,blockY,x,y); // створюємо бонуси
                blockX += 50;
            }
            blockY += 35;
        }
        return blockSprite;
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
        let name = sprite.name.split('_');
        let score: number = Number(name[1]) * 10;
        const style = new PIXI.TextStyle({
            fill: "#212121",
            fontSize: 20,
            stroke: "#fafafa",
            strokeThickness: 2
        });

        const text: PIXI.Text = new PIXI.Text(`+${score}`,style);
        text.x = x;
        text.y = y;
        text.name = sprite.name;
        return text;
    }
    private createTextScoreField(): void {
        for (let i = 0; i < this._blocksSprite.length; i++) {
            const text: PIXI.Text = this.createTextScore(this._blocksSprite[i]); //створюємо текст балів
            this._scoreText.push(text);
        }

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
        this.deleteSprite(block);
    }
    //малюємо ігрове поле
    private renderPlayField(): void {
        this.app.stage.addChild(this._appGame); // малюємо беграунд
        this.renderElementsField(this._blocksSprite); // малюємо блоки
        this.renderBonuses(this._bonusSprite);
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
    private renderBonuses(bonuses: PIXI.Sprite[]): void {
        for (let j = 0; j < bonuses.length; j++) {
            this.app.stage.addChild(bonuses[j]);
            this.alphaSpriteOff(bonuses[j]);
        }
    }
    //малюємо текст балів
    private renderScoreText(text: PIXI.Text): void {
        this.app.stage.addChild(text);
        text.alpha = 0;
    }
    //------------------- alphaSprite ---------------------//
    private alphaSpriteOff(sprite: PIXI.Sprite): void {
        sprite.alpha = 0;
    }
    private alphaSpriteOn(sprite: PIXI.Sprite, bonusSprite: PIXI.Sprite[]): void {
        for (let i = 0; i < bonusSprite.length; i++) {
                const nameBonus = bonusSprite[i].name.split('_');
                const nameBlock = sprite.name.split('_');
                if (nameBonus[nameBonus.length - 1] == nameBlock[nameBlock.length - 1] &&
                    nameBonus[nameBonus.length - 2] == nameBlock[nameBlock.length - 2]) {
                    bonusSprite[i].alpha = 1;
            }
        }
    }
    //------------------- deleteSprite ---------------------//
    private deleteSprite(sprite: PIXI.Sprite): void {
        this.app.stage.removeChild(sprite);
        this.alphaSpriteOn(sprite, this._bonusSprite);

    }
    public deleteBonus(nameBonus: string, bonuses: PIXI.Sprite[]): void {
        for (let i = 0; i < bonuses.length; i++) {
            if (bonuses[i].name == nameBonus) {
                this.app.stage.removeChild(bonuses[i]);
            }
        }
    }
    public deleteAll(): void {
        for (let i = 0; i < this._blocksSprite.length; i++) {
            this.app.stage.removeChild(this._blocksSprite[i]);
        }
        for (let i = 0; i < this._bonusSprite.length; i++) {
            this.app.stage.removeChild(this._bonusSprite[i]);
        }
        this.app.stage.removeChild(this._ball);
        this.app.stage.removeChild(this._platform);
        this.app.stage.removeChild(this._appGame);
    }

    //------------------- renderTWEEN ---------------------//
    //рухаємо текст балів
    public moveTS(text: PIXI.Text[], block: PIXI.Sprite): void {
        let blockName = block.name.split('_');
        for (let i = 0; i < text.length; i++) {
            let textName = this._scoreText[i].name.split('_');
            if (blockName[blockName.length - 1] == textName[textName.length - 1] &&
                blockName[blockName.length - 2] == textName[textName.length - 2]) {
                text[i].alpha = 1;
                this.moveTextScore(text[i]);
            }
        }
    }
    //рухаємо текст вибитих блоків
    private moveTextScore(text: PIXI.Text): void {
        const from = { //від
            y: text.y,
            alpha: 1
        }
        const to = {    //до
            y: text.y - 30,
            alpha: 0
        }
        let tween = new TWEEN.Tween(from);
        tween.to(to,600);
        tween.onUpdate(() => {
            text.y = from.y;
            if (text.y >= to.y) {
                text.alpha = from.alpha;
            }
    });
        tween.start();
    }
}