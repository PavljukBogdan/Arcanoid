import * as PIXI from 'pixi.js'
import {ColorBlock} from './ColorBlock'

export type TGameState = {
    score: number;
    GameOver: boolean;
    playField: number[][];
    blockRemove: PIXI.Sprite[];
    levelGame: number;
    scoreText: TPixiObject[];
    levelPassed: boolean;
    removeBonuses: PIXI.Sprite[];
};

export type TPixiObject = {
    score: number;
    x: number;
    y: number;
}

export default class Model {

    private _velocityPlatform = 10; //максимальна швидкісь переміщення платформи
    private _velocityBall = 3; //максимальна швидкість м'яча
    private _velocityBallX = this._velocityBall;
    private _velocityBallY = this._velocityBall;
    private _velocityBonus = 3;
    private _score: number = 0; // рахунок
    private _gameOver: boolean = false;
    private _playField: number[][] = []; //ігрове поле
    private _levelGame: number = 1;
    private _blockRemove: PIXI.Sprite[] = [];//масив блоків для видалення
    private _scoreText: TPixiObject[] = [];
    private _numbersOfBlocksInLevels: number = 0;
    private _levelPassed = false;
    private _scoresBonus: number[] = [];
    private _bonusField: TPixiObject[] = [];
    private _removeBonuses: PIXI.Sprite[] = [];

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
            levelGame: this._levelGame,
            scoreText: this._scoreText,
            levelPassed: this._levelPassed,
            removeBonuses: this._removeBonuses
        }
    }
    public reset(): void {
        this._gameOver = false;
        this._score = 0;
        this._blockRemove = [];
        this._bonusField = [];
        this.createGameField();
        this._levelPassed = false;
        this.createBonus();
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
        const line = 4;
        const column = 10;
        for (let y = 0; y < line; y++) {
            playField[y] = new Array(column).fill(0);
        }
        this._numbersOfBlocksInLevels = line * column;
        return playField;
    }

    private createLevelTwo(): number[][] {
        const playField: number[][] = [];
        const line = 4;
        const column = 10;
        for (let y = 0; y < 4; y++) {
            playField[y] = new Array(10).fill(y);
        }
        this._numbersOfBlocksInLevels = line * column;
        return playField;
    }

    public getBonusField(): TPixiObject[] {
        return this._bonusField;
    }

    public gravityBonuses(bonus: PIXI.Sprite): void {
            bonus.y += this._velocityBonus;
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
    //ловимо бонус
    public catchBonus({platforms, bonuses}): void {
        let removeBonus: PIXI.Sprite[] = [];
        for (let i = 0; i < bonuses.length; i++) {
            if (this.hasCollision(platforms[0],bonuses[i])) {
               removeBonus.push(bonuses[i]);

            } else if (bonuses[i].y > 660) {
                removeBonus.push(bonuses[i]);

            }
        }
        this._removeBonuses = removeBonus;
    }
    //видаляємо блоки що вибили
    public clearBlock({balls, blocks}): void {
        for (let i = 0; i < blocks.length; i ++) {
            if (this.hasCollision(balls[0], blocks[i])) { //якщо м'яч доторкнувся до блока
                this.bumpBlockY(); //змінюємо координату м'яча
                let words = blocks[i].name.split('_');
                let name = words[0];
                this._score += this.scoresGame(name); //змінюємо рахунок
                if (this._score > this._scoresBonus[0]) {
                    let bF: TPixiObject = {
                        score: 0,
                        x: blocks[i].x,
                        y: blocks[i].y
                    }
                    this._bonusField.push(bF);
                    this._scoresBonus.shift();
                }
                this._blockRemove.push(blocks[i]); //додаємо блок в масив
                let sT: TPixiObject = {
                    score: this.scoresGame(name),
                    x: blocks[i].x,
                    y: blocks[i].y
                };
                this._scoreText.push(sT);
                blocks.splice(i,1); //видаляємо блок з поля
            }
        }
    }
    //максимальний рахунок в рівні
    private maxScoreLevel(): number {
        let maxScore: number = 0;
        for (let i = 0; i < this._playField.length; i++) {
            for (let j = 0; j < this._playField[i].length; j++) {
                if (this._playField[i][j] == 0) {
                    maxScore += this.scoresGame('Green');
                } else if (this._playField[i][j] == 1) {
                    maxScore += this.scoresGame('Blue');
                } else if (this._playField[i][j] == 2) {
                    maxScore += this.scoresGame('Yellow');
                } else if (this._playField[i][j] == 3) {
                    maxScore += this.scoresGame('Pink');
                } else if (this._playField[i][j] == 4) {
                    maxScore += this.scoresGame('Violet');
                }
            }
        }
        return maxScore;
    }
    //створюємо бонуси
    private createBonus(): void {
        let mS = this.maxScoreLevel();

        for (let i = 0; i < 8; i++) {
            this._scoresBonus.push(Math.random() * (mS - 50));
        }
        this._scoresBonus.sort(this.compareNumbers);
    }
    private compareNumbers(a, b) {
        return a - b;
    }
    //ціна очків за блок
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
    //зміна рівня
    public levelApp(): void {
        if (this._numbersOfBlocksInLevels == this._blockRemove.length) {
            this._levelPassed = true;
            this._levelGame ++;
            this._numbersOfBlocksInLevels = 0;
        }
    }
    private updateScore(): void {

    }
}