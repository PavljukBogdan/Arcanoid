import * as PIXI from 'pixi.js'
import {ColorBlock} from './ColorBlock'

export type TGameState = {
    score: number;
    GameOver: boolean;
    playField: number[][];
    blockRemove: PIXI.Sprite[];
    levelGame: number;
};

export default class Model {

    private _velocityPlatform = 10; //максимальна швидкісь переміщення платформи
    private _velocityBall = 3; //максимальна швидкість м'яча
    private _velocityBallX = this._velocityBall;
    private _velocityBallY = this._velocityBall;
    private _score: number = 0; // рахунок
    private _gameOver: boolean = false;
    private _playField: number[][] = []; //ігрове поле
    private _levelGame: number = 2;
    private _blockRemove: PIXI.Sprite[] = [];

    constructor() {
        this.reset();
    }
    // отримуємо статус гри
    public getState(): TGameState {
        return  {
            score: this._score,
            GameOver: this._gameOver,
            playField:this._playField,
            blockRemove: this._blockRemove,
            levelGame: this._levelGame
        }
    }
    public reset(): void {
        this._gameOver = false;
        this._score = 0;
        this._blockRemove = [];
        this.createGameField();
    }
    // створюємо ігрове поле
    private createGameField(): number[][] {

        switch (this._levelGame) {
            case 1:
                this._playField = this.createLevelOne();
                break;
            case 2:
                this._playField = this.createLevelTwo();
                break;
            case 3:
                this._playField = this.createLevelOne();
                break;
            case 4:
                this._playField = this.createLevelOne();
                break;
        }
        return this._playField
    }
    // створюємо перший рівень
    private createLevelOne(): number[][] {
        const playField: number[][] = [];
        for (let y = 0; y < 4; y++) {
            playField[y] = new Array(10).fill(0);
        }
        return playField;
    }

    private createLevelTwo(): number[][] {
        const playField: number[][] = [];
        for (let y = 0; y < 4; y++) {
            playField[y] = new Array(10).fill(y);
        }
        return playField;
    }

    public movePlatformLeft(platform: PIXI.Sprite): void {
            platform.x -= this._velocityPlatform;
    }

    public movePlatformRight(platform: PIXI.Sprite): void {
        platform.x += this._velocityPlatform;
    }

    public moveBallInPlatformLeft(ball: PIXI.Sprite): void {
            ball.x -= this._velocityPlatform;
    }

    public moveBallInPlatformRight(ball: PIXI.Sprite): void {
        ball.x += this._velocityPlatform;
    }
    //рух м'яча
    public realiseBall(ball: PIXI.Sprite): void {
        ball.x -= this._velocityBallX;
       //ball.y -= this._velocityBallY;
        ball.y -= this._velocityBallY / 0.5;
    }
    //видаляємо блоки що вибили
    public clearBlock({balls, blocks}): void {
        for (let i = 0; i < blocks.length; i ++) {
            if (this.hasCollision(balls[0], blocks[i])) { //якщо м'яч доторкнувся до блока
                this.bumpBlockY(); //змінюємо координату м'яча
                let words = blocks[i].name.split('_');
                let name = words[0];
                this._score += this.scoresGame(name); //змінюємо рахунок
                console.log(this.scoresGame(name))
                this._blockRemove.push(blocks[i]); //додаємо блок в масив
                blocks.splice(i,1); //видаляємо блок з поля
            }
        }
    }

    private scoresGame(elements: string): number {
        let score: number;
        switch (elements) {
            case 'Green':
                score = 10;
                break;
            case 'Blue':
                score = 20;
                break;
            case 'Yellow':
                score = 30;
                break;
            case 'Pink':
                score = 40
                break;
            case 'Violet':
                score = 50
                break;
        }
        return score;
    }
    //стрибок від платформи
    public jumpInPlatform({balls, platforms}): void {
        if (this.hasCollision(balls[0], platforms[0])) {
            if (this.leftSidePlatform(balls[0], platforms[0])) {
                this.bumpBlockY();
                this.bumpBlockX();
            } else {
                this.bumpBlockY();
            }
        }
    }
    //перевірка на колізії
    private hasCollision(ball: PIXI.Sprite, block: PIXI.Sprite): boolean {

        const bounds1 = ball.getBounds();
        const bounds2 = block.getBounds();

        return bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y;
    }
    //перевірка виходу за межі поля
    public checkBounds({balls}): void {
        const ball = balls[0];
        if (ball.x < 0) {
            this.bumpBlockX();
        } else if (ball.x + ball.width > 550) {
            this.bumpBlockX();
        } else if (ball.y < 100) {
            this.bumpBlockY();
        } else if (ball.y + ball.height > 660) {
                this._gameOver = true;
        }
    }
    //перевірка виходу за межі екрану платформи
    public checkBoundsPlatform({balls, platforms}, ballInPlatform: boolean){
        const platform = platforms[0];
        const ball = balls[0];
        if (platform.x < 0) {
            this.moveBallInPlatformRight(platform);
            if (ballInPlatform)
                this.moveBallInPlatformRight(ball);
        } else if (platform.x + platform.width > 550) {
            this.moveBallInPlatformLeft(platform);
            if (ballInPlatform)
                this.moveBallInPlatformLeft(ball);
        }
    }
    //зміна напрямку по х
    private bumpBlockX(): void {
        this._velocityBallX *= -1;
    }
    //зміна напрямку по у
    private bumpBlockY(): void {
        this._velocityBallY *= -1;
    }
    //яка сторона відбила м'яч
    private leftSidePlatform(ball: PIXI.Sprite, platform: PIXI.Sprite): boolean {
        return (ball.x + ball.width / 2) < (platform.x + platform.width / 2);
    }

    private updateScore(): void {

    }
}