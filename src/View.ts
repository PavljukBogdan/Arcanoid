import * as PIXI from 'pixi.js'
import Model from "./Model"
import * as TWEEN from '@tweenjs/tween.js'
export type TGameSprite = {
    platforms: PIXI.Sprite[];
    balls: PIXI.Sprite[];
    blocks: PIXI.Sprite[];
};

export default class View {

    private _model: Model;

    private _platforms: PIXI.Sprite[] = []; //масив платформ
    private _balls: PIXI.Sprite[] = []; // масив м'ячів
    private _blocks: PIXI.Sprite[] = []; // масив блоків
     //масив блоків, що видаляються
    private _element: Element | null; //дом. елемент
    private readonly _width: number; //ширина ігрового поля
    private readonly _height: number; //висота ігрового поля
    public app: PIXI.Application; //полотно
    private _textScore: PIXI.Text; // текст з рахунком
    private _startText: PIXI.Text; // текст стартового екрану
    private _pauseText: PIXI.Text; // текст паузи
    private _endText: PIXI.Text; //текст закінчення гри


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
        this.init(); //створюємо ігрові о'бєкти
    }

    public getSprite(): TGameSprite {
        return {
            platforms: this._platforms,
            balls: this._balls,
            blocks: this._blocks,
        }
    }
    public reset(): void {
        this.deleteMainScreen();
        this.removeGameElements();
        this._platforms = [];
        this._balls = [];
        this._blocks = [];
        this.deleteMainScreen();
        this.removeGameElements();
        let playField = this._model.getState().playField;
        this.createPlayField(playField);
        this.createPanel();
        this.renderTextScreen();
    }
    //створюємо ігрові об'єкти
    private init(): void {
        this.reset();
        //створюємо ігрове поле
        document.body.appendChild(this.app.view);//додаємо полотно, яке створили
        this.renderStartScreen();
    }
    private removeGameElements() {
        for (let i = 0; i < this._platforms.length; i++) {
            this.app.stage.removeChild(this._platforms[i]);
        }
        for (let i = 0; i < this._blocks.length; i++) {
            this.app.stage.removeChild(this._blocks[i]);
        }
        for (let i = 0; i < this._balls.length; i++) {
            this.app.stage.removeChild(this._balls[i]);
        }
    }
    private createPlayField(playField: number[][]){
        let blockY = 50;
        for (let y = 0; y < playField.length; y++) {
            let blockX = 25;
            for (let x = 0; x < playField[y].length; x++) {
                this._blocks.push(this.createBlockGame('./assets/Box.png',blockX,blockY,30,50, 'block_'+ x + '_' + y));
                blockX += 50;
            }
            blockY += 35;
        }
        this._platforms.push(this.createBlockGame('./assets/Line.png',210,435,14,100, 'platform'));
        this._balls.push(this.createBlockGame('./assets/Bal.png',250,410,25,25, 'ball'));

    }
    //створюємо ігровий блок
    private createBlockGame (name: string,x: number, y: number,height: number, width: number, nameBlock: string): PIXI.Sprite {
        const sprite = PIXI.Sprite.from(name);
        sprite.x = x;
        sprite.y = y;
        sprite.height = height;
        sprite.width = width;
        sprite.name = nameBlock;

        return sprite;
    }
    //малюємо екран закінчення
    public renderEndScreen(): void {
        this.app.stage.addChild(this._endText);
    }
    //видаляємо екран закінчення
    public deleteEndScreen(): void {
        this.app.stage.removeChild(this._endText);
    }
    //малюємо текст гри
    private renderTextScreen(): void {
        this.app.stage.addChild(this._textScore);
    }
    //малюємо екран гри
    public renderMainScreen(): void {
        this.renderPlayField(); //малюємо ігрове поле
        let score: string= this._model.getState().score.toString();
        this._textScore.text = `score ` + score;
    }
    private deleteMainScreen(): void {
        this.app.stage.removeChild(this._textScore);
    }
    //малюємо стартовий напис
    public renderStartScreen(): void {
        this.app.stage.addChild(this._startText);
        const initialY = this._startText.y;
        let tween = new TWEEN.Tween(this._startText);
        tween.to({y: initialY},600);

        // const from = {
        //     y: this._startText.y - 100,
        //     alpha: 0
        // }
        // let tween = new TWEEN.Tween(from)
        // tween.to(from,600);
        // tween.onUpdate(() => {this._startText.y = from.y
        // this._startText.alpha = from.alpha
        // })
        tween.start();
    }
    //видаляємо стартовий напис
    public deleteStartScreen(): void {
        this.app.stage.removeChild(this._startText);
    }
    //малюємо напис паузи
    public renderPauseScreen(): void {
        this.app.stage.addChild(this._pauseText);
    }
    //видаляємо напис паузи
    public deletePauseScreen(): void {
        this.app.stage.removeChild(this._pauseText);
    }
    //створюємо текстові панелі
    private createPanel(): void {
        const style = new PIXI.TextStyle({
            fill: "#212121",
            fontSize: 30,
            stroke: "#fafafa",
            strokeThickness: 5
        });
        this._textScore = new PIXI.Text('score 0',style);
        this._startText = new PIXI.Text('Press Enter to start',style);
        this._startText.x = 120;
        this._startText.y = 250;

        this._pauseText = new PIXI.Text('Press Enter to continue',style);
        this._pauseText.x = 120;
        this._pauseText.y = 250;

        this._endText = new PIXI.Text('Press Enter to restart',style);
        this._endText.x = 120;
        this._endText.y = 250;
    }
    //малюємо ігрове поле
    private renderPlayField(): void {
        //малюємо платформу
        for (let i = 0; i < this._platforms.length; i++) {
            this.app.stage.addChild(this._platforms[i]);
        }
        //малюємо м'ячі
        for (let i = 0; i < this._balls.length; i++) {
            this.app.stage.addChild(this._balls[i]);
        }
        //малюємо блоки
        for (let i = 0; i < this._blocks.length; i++) {

                this.app.stage.addChild(this._blocks[i]);
        }
        const blockRemove = this._model.getState().blockRemove;
        if (blockRemove.length > 0) {
            for (let i = 0; i < blockRemove.length; i++) {
                this.app.stage.removeChild(blockRemove[i]);
            }
        }
    }
}