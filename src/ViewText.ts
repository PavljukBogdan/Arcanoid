import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js'

export default class ViewText {

    private _textScore: PIXI.Text; // текст з рахунком
    private _textLevel: PIXI.Text; // текст рівня
    private _startText: PIXI.Text; // текст стартового екрану
    private _pauseText: PIXI.Text; // текст паузи
    private _endText: PIXI.Text; //текст закінчення гри
    private _nextLevelText: PIXI.Text; //текст наступного рівня

    constructor() {
        this.init();
    }

    private init(): void {
        this.reset();
    }

    public reset(): void {
        this.createPanel();
    }


    //------------------- createText ---------------------//

    //створюємо текстові панелі
    private createPanel(): void {
        const basicStyle = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 30,
            fontWeight: "bold",
            stroke: "#b9bbbb",
            strokeThickness: 5
        });
        const minorStyle = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 20,
            fontWeight: "bold",
            stroke: "#b9bbbb",
            strokeThickness: 3
        });
        //текст з рахунком
        this._textScore = new PIXI.Text('1',minorStyle);
        this._textScore.x = 200;
        this._textScore.y = 10;
        //текст з рівнем
        this._textLevel = new PIXI.Text('2',minorStyle);
        this._textLevel.x = 200;
        this._textLevel.y = 50;
        //стартовий текст
        this._startText = new PIXI.Text('Press Enter to start',basicStyle);
        this._startText.x = 120;
        this._startText.y = 300;
        //текст паузи
        this._pauseText = new PIXI.Text('Press Enter to continue',basicStyle);
        this._pauseText.x = 120;
        this._pauseText.y = 300;
        //текс програшу
        this._endText = new PIXI.Text('Press Enter to restart',basicStyle);
        this._endText.x = 120;
        this._endText.y = 300;
        this._nextLevelText = new PIXI.Text('Press Enter to next level', basicStyle);
        this._nextLevelText.x = 120;
        this._nextLevelText.y = 300;
    }
    //анімація тексту
    private textAnimation(text: PIXI.Text): void {
        const from = {
            y: text.y - 200,
            alpha: 0
        }
        const to = {
            y: text.y,
            alpha: 1
        }
        let tween = new TWEEN.Tween(from)
        tween.to(to,1600);
        tween.onUpdate(() => {
            text.y = from.y
            text.alpha = from.alpha
        });
        tween.start();
    }
    //------------------- renderText ---------------------//
    //малюємо стартовий напис
    public renderStartScreen(app: PIXI.Application): void {
        app.stage.addChild(this._startText);
        //this.textAnimation(this._startText);
    }
    //малюємо напис паузи
    public renderPauseScreen(app: PIXI.Application): void {
        app.stage.addChild(this._pauseText);
        //this.textAnimation(this._pauseText);
    }
    //малюємо текст гри
    public renderTextScreen(app: PIXI.Application, score: number, level: number): void {
        this._textScore.text = `score - ${score.toString()}`;
        this._textLevel.text = `level - ${level.toString()}`;
        app.stage.addChild(this._textScore);
        app.stage.addChild(this._textLevel);
    }
    //малюємо екран закінчення
    public renderEndScreen(app: PIXI.Application): void {
        app.stage.addChild(this._endText);
    }
    //малюємо текст наступного рівня
    public renderNextLevelScreen(app: PIXI.Application): void {
        app.stage.addChild(this._nextLevelText);
    }
}