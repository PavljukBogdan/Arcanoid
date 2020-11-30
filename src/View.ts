import * as PIXI from 'pixi.js'
import Model from "./Model"
import * as TWEEN from '@tweenjs/tween.js'
import {ColorBlock} from './ColorBlock'
import {TScoreText} from "./Model"
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
    private _textLevel: PIXI.Text; // текст рівня
    private _startText: PIXI.Text; // текст стартового екрану
    private _pauseText: PIXI.Text; // текст паузи
    private _endText: PIXI.Text; //текст закінчення гри
    private _scoresText: PIXI.Text[] = [];
    private _appGame: PIXI.Sprite;
    private _nextLevelText: PIXI.Text;


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
    //перезапуск
    public reset(): void {
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
    // створюємо текст випадаючого рахунку
    private createTextScore(scoreText: TScoreText[]): void {
        const style = new PIXI.TextStyle({
            fill: "#212121",
            fontSize: 20,
            stroke: "#fafafa",
            strokeThickness: 2
        });

        for (let i = 0; i < scoreText.length; i++) {
            let sT = new PIXI.Text(scoreText[i].score.toString(),style);
            sT.x = scoreText[i].x;
            sT.y = scoreText[i].y;
            sT.name = i.toString();
            this._scoresText.push(sT);
            // this._scoresText[i] = new PIXI.Text(scoreText[i].score.toString(),style);
            // this._scoresText[i].x = scoreText[i].x;
            // this._scoresText[i].y = scoreText[i].y;
            // this._scoresText[i].name = i.toString();
        }
    }
    // рухаємо текст випадаючого рахунку
    private moveTextScore(scoresText: PIXI.Text[]): void {
        let sT;
        for (let i = 0; i < scoresText.length; i++) {
            sT = scoresText[i];
        }
        const from = {
            y: sT.y,
            alpha: 0
        }
        const to = {
            y: sT.y + 50,
            alpha: 1
        }
        let tween = new TWEEN.Tween(from)
        tween.to(to,600);
        tween.onUpdate(() => {
            sT.y = from.y
            sT.alpha = from.alpha
            // if (sT.y == to.y) {
            //     this.removeTextScore(this._scoresText, sT);
            //     tween.stop();
            // }
        });
        // tween.onComplete(()=> {
        //     this.removeTextScore(this._scoresText,sT);
        // });
        tween.start();
    }
    //видаляємо текст випадаючого рахунку
    private removeTextScore(scoresText: PIXI.Text[], sT: PIXI.Text): void {
        for (let i = 0; i < scoresText.length; i++) {
            if (scoresText[i].name === sT.name) {
                this.app.stage.removeChild(scoresText[i]);
            }
        }

    }
    //видаляємо ігрові об'єкти
    private removeGameElements(): void {
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
    //створюємо ігрові об'єкти
    private createPlayField(playField: number[][]): void {
        this._appGame = this.createBlockGame('./assets/Bg.png', 0,100,560,550,'appGame');
        let blockY = 120;
        for (let y = playField.length - 1; y >= 0; y--) {
            let blockX = 25;
            for (let x = 0; x < playField[y].length; x++) {
                let color: string = ColorBlock[playField[y][x]];
                this._blocks.push(this.createBlockGame(`./assets/${color}.png`,blockX,blockY,30,50, `${color}_block_`+ x + '_' + y));
                blockX += 50;
            }
            blockY += 35;
        }
        this._platforms.push(this.createBlockGame('./assets/Line.png',210,585,14,100, 'platform'));
        this.createBall();
    }
    private createBall(): void {
        this._balls.push(this.createBlockGame('./assets/Ball.png',250,560,25,25, 'ball'));
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
        this.app.stage.addChild(this._textLevel);
    }
    //малюємо екран гри
    public renderMainScreen(): void {
        this.renderPlayField(); //малюємо ігрове поле
        let score: string = this._model.getState().score.toString();
        this._textScore.text = `score - ${score}`;
        let level: string = this._model.getState().levelGame.toString();
        this._textLevel.text = `level - ${level}`;
    }
    //видаляємо текст ігрового поля
    private deleteMainScreen(): void {
        this.app.stage.removeChild(this._textScore);
        this.app.stage.removeChild(this._textLevel);
    }
    //малюємо стартовий напис
    public renderStartScreen(): void {
        this.app.stage.addChild(this._startText);
        this.textAnimation(this._startText);
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
    //видаляємо стартовий напис
    public deleteStartScreen(): void {
        this.app.stage.removeChild(this._startText);
    }
    public renderNextLevelScreen(): void {
        this.app.stage.addChild(this._nextLevelText);
    }
    public deleteNextLevelScreen(): void {
        this.app.stage.removeChild(this._nextLevelText);
    }
    //малюємо напис паузи
    public renderPauseScreen(): void {
        this.app.stage.addChild(this._pauseText);
        this.textAnimation(this._pauseText);
    }
    //видаляємо напис паузи
    public deletePauseScreen(): void {
        this.app.stage.removeChild(this._pauseText);
    }
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
        this._textScore = new PIXI.Text('',minorStyle);
        this._textScore.x = 200;
        this._textScore.y = 5;
        //текст з рівнем
        this._textLevel = new PIXI.Text('',minorStyle);
        this._textLevel.x = 200;
        this._textLevel.y = 40;
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
    //малюємо ігрове поле
    private renderPlayField(): void {
        this.app.stage.addChild(this._appGame);
        //малюємо платформу
        for (let i = 0; i < this._platforms.length; i++) {
            this.app.stage.addChild(this._platforms[i]);
        }
        this.renderBalls();
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
        // this.createTextScore(this._model.getState().scoreText);
        // this.renderScoreText();
    }
    public renderScoreText(): void {
        for (let i = 0; i < this._scoresText.length; i++) {
            if (this._scoresText[i].y != (this._scoresText[i].y + 50)) {
                this.app.stage.addChild(this._scoresText[i]);
                this.moveTextScore(this._scoresText);
            } else {
                this.app.stage.removeChild(this._scoresText[i]);
            }
        }
    }
    //малюємо м'ячі
    private renderBalls(): void {
        for (let i = 0; i < this._balls.length; i++) {
            this.app.stage.addChild(this._balls[i]);
        }
    }
}