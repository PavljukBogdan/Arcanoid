import * as PIXI from 'pixi.js'
import Model from "./Model"
import * as TWEEN from '@tweenjs/tween.js'

export default class View {

    private _model: Model;

    private _element: Element | null; //дом. елемент
    private readonly _width: number; //ширина ігрового поля
    private readonly _height: number; //висота ігрового поля
    public app: PIXI.Application; //полотно
    private _textScore: PIXI.Text;


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
        this.app.stage.addChild(this._textScore);

    }

    public renderMainScreen(state) {
        this.renderPlayField(state);
        let score: string= this._model.getState().score.toString();
        this._textScore.text = score;
    }

    private createPanel(): void {
        const style = new PIXI.TextStyle({
            fill: "#212121",
            fontSize: 30,
            stroke: "#fafafa",
            strokeThickness: 5
        });

        this._textScore = new PIXI.Text('0',style);
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