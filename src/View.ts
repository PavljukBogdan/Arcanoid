import * as PIXI from 'pixi.js'
import Model from "./Model"
import * as TWEEN from '@tweenjs/tween.js'

export default class View {

    private _model: Model;

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
        this.init(); //створюємо ігрові о'бєкти
    }
    //створюємо ігрові об'єкти
    private init(): void {
        //створюємо ігрове поле
        this.app = new PIXI.Application({
            width: this._width, //ширина ігрового полотна
            height: this._height, //висота ігрового полотна
            backgroundColor: 0x111111, // колір полотна
            resolution: window.devicePixelRatio || 1,
        });
        document.body.appendChild(this.app.view);//додаємо полотно, яке створили
        this.createPanel();
        this.renderTextScreen();
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
    public renderMainScreen(state) {
        this.renderPlayField(state); //малюємо ігрове поле
        let score: string= this._model.getState().score.toString();
        this._textScore.text = `score ` + score;
    }
    //малюємо стартовий напис
    public renderStartScreen(): void {
        this.app.stage.addChild(this._startText);
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
    private renderPlayField({platforms, balls, blocks, blockRemove}) {
        //малюємо платформу
        for (let i = 0; i < platforms.length; i++) {
            this.app.stage.addChild(platforms[i]);
        }
        //малюємо м'ячі
        for (let i = 0; i < balls.length; i++) {
            this.app.stage.addChild(balls[i]);
        }
        //малюємо блоки
        for (let i = 0; i < blocks.length; i++) {

                this.app.stage.addChild(blocks[i]);
        }
        if (blockRemove.length > 0) {
            for (let i = 0; i < blockRemove.length; i++) {
                this.app.stage.removeChild(blockRemove[i]);
            }
        }
    }
}