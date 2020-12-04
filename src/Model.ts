import * as PIXI from 'pixi.js'
import {Bonus, ColorBlock} from './ColorBlock'

export type TGameState = {
    score: number;
    GameOver: boolean;
    playField: number[][];
    blockRemove: PIXI.Sprite[];
    levelGame: number;
    scoreText: TPixiObject[];
    levelPassed: boolean;
    bonusField: TPixiObject[];
    removeBonuses: PIXI.Sprite[];
    widthPlatform: number;
    speedOn: boolean;
};

export type TPixiObject = {
    number: number;
    x: number;
    y: number;
}

export default class Model {

    private _velocityPlatform = 10; //максимальна швидкісь переміщення платформи
    private _velocityBall = 3; //максимальна швидкість м'яча
    private _velocityBallX = this._velocityBall;
    private _velocityBallY = this._velocityBall;
    private _velocityBonus = 0.05;
    private _score: number = 0; // рахунок
    private _gameOver: boolean = false;
    private _playField: number[][] = []; //ігрове поле
    private _levelGame: number = 1;
    private _blockRemove: PIXI.Sprite[] = [];//масив блоків для видалення
    private _scoreText: TPixiObject[] = [];
    private _numbersOfBlocksInLevels: number = 0;
    private _levelPassed = false;
    private _bonusField: TPixiObject[] = [];
    private _removeBonuses: PIXI.Sprite[] = [];
    private _actBonus: string = null;
    private _catchBonuses: string[] = [];
    private _widthPlatform: number = 100;
    private _speedOn: boolean = false;
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
            bonusField: this._bonusField,
            removeBonuses: this._removeBonuses,
            widthPlatform: this._widthPlatform,
            speedOn: this._speedOn
        }
    }
    public reset(): void {
        this._gameOver = false;
        this._score = 0;
        this._blockRemove = [];
        this._bonusField = this.createBonusField();
        this.createGameField();
        this._levelPassed = false;
        this._widthPlatform = 100;
        this._velocityBall = 3;
        this._speedOn = false;
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
    //створюємо другий рівень
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
    //рух бонусів
    public moveBonuses({bonuses, nameBonus}): void {
        for (let i = 0; i < bonuses.length; i++) {
            for (let j = 0; j < nameBonus.length; j++) {
                if (bonuses[i].name == nameBonus[j]) {
                    this.gravityBonuses(bonuses[i]);
                }
            }
        }
    }
    //гравітація бонусів
    private gravityBonuses(bonus: PIXI.Sprite): void {
            bonus.y += this._velocityBonus;
    }
    //рух платформи ліфоруч
    public movePlatformLeft(platform: PIXI.Sprite): void {
            platform.x -= this._velocityPlatform;
    }
    //рух платформи праворуч
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
    public realiseBall(ball: PIXI.Sprite, speedOn: boolean): void {
        if (!speedOn) {
            ball.x -= this._velocityBallX;
            //ball.y -= this._velocityBallY;
            ball.y -= this._velocityBallY / 0.5;
        } else {
            ball.x -= this._velocityBallX * 1.5;
            //ball.y -= this._velocityBallY;
            ball.y -= (this._velocityBallY / 0.5) * 1.5;
        }
    }
    //ловимо бонус
    public catchBonus({platforms, bonuses}): void {
        let removeBonus: PIXI.Sprite[] = [];
        let actB: string = '';
        for (let i = 0; i < bonuses.length; i++) {
            if (this.hasCollision(platforms[0],bonuses[i])) {
               removeBonus.push(bonuses[i]);
                actB = bonuses[i].name.split('_');
                this._actBonus = actB[0];
                this.activeBonus(actB[0]);
            } else if (bonuses[i].y > 660) {
                removeBonus.push(bonuses[i]);
            }
        }
        this._removeBonuses = removeBonus;
    }
    //виконуємо умову бонусу
    private activeBonus(bonus: string): void {
        this._catchBonuses.push(bonus);
        if (this._catchBonuses[this._catchBonuses.length - 1] == this._actBonus) {
            this._score += 100;
        }

        if (this._actBonus == Bonus[0]) {
            this._widthPlatform = 50;
            this._speedOn = false;
        } else if (this._actBonus == Bonus[1]) {
            this._widthPlatform = 150;
            this._speedOn = false;
        } else if (this._actBonus == Bonus[2]) {
            this._widthPlatform = 100;
            this._speedOn = true;
        }
    }
    //видаляємо блоки що вибили
    public clearBlock({balls, blocks}): void {
        for (let i = 0; i < blocks.length; i ++) {
            if (this.hasCollision(balls[0], blocks[i])) { //якщо м'яч доторкнувся до блока
                this.bumpBlockY(); //змінюємо координату м'яча
                let words = blocks[i].name.split('_');
                let name = words[0];
                this._score += this.scoresGame(name); //змінюємо рахунок
                this._blockRemove.push(blocks[i]); //додаємо блок в масив
                blocks.splice(i,1); //видаляємо блок з поля
            }
        }
    }
    //створюємо поле бонусів
    private createBonusField(): TPixiObject[] {
        let x: TPixiObject[] = [];
        for (let i = 0; i < 8; i++) {
            let a: TPixiObject = {
                number : Math.floor(Math.random() * 3),
                x: Math.floor((Math.random() * 10)),
                y: Math.floor((Math.random() * 4))
            };
            x[i] = a;
        }
        return x;
    }
    //створюємо поле балів
    public createScoreText(blocks: PIXI.Sprite[]): TPixiObject[] {
        let scoresText: TPixiObject[] = [];
        let score: number = 0;
        for (let i = 0; i < blocks.length; i++) {
            let words = blocks[i].name.split('_');
            let name = words[0];
             score = this.scoresGame(name);
            let obj: TPixiObject = {
                number: score,
                x: blocks[i].x,
                y: blocks[i].y
            }
            scoresText.push(obj);
        }
        return scoresText;
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
        if (this._numbersOfBlocksInLevels == this._blockRemove.length) { //якщо кількість вибитих блокі вірний кількості блоків
            this._levelPassed = true;   // рівень закінчений
            this._levelGame ++;     //збільшуємо рівень
            this._numbersOfBlocksInLevels = 0;  // оновлюємо кількість вибитих блоків
        }
    }
    private updateScore(): void {

    }
}