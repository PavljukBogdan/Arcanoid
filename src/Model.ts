import * as PIXI from 'pixi.js'
import {Bonus, GameState} from './ColorBlock'
import {TGameElements} from "./View";


export type TGameObject = {
    typeBlock: number;
    typeBonus: number;
    x: number;
    y: number;
}

export type TGamePlatform = {

}

export type TGameState = {
    playField: TGameObject[][],
    widthPlatform: number,
    speedBall: number,
    nameBonuses: string[],
    score: number,
    level: number
}

export default class Model {
    //------------------- constants ---------------------//
    private readonly COLUMN_FIELD: number = 10; //кількість стовпців на полі
    private readonly LINE_FIELD: number = 4; //кількість рядків на полі
    private _velocityPlatform: number = 10; //швидкість платформи
    private _velocityBall: number = 3; //швидкість кулі
    private _velocityBallX: number = this._velocityBall;
    private _velocityBallY: number = this._velocityBall;
    //------------------- dataGame ---------------------//
    private _score: number = 0; // рахунок
    private _levelGame: number = 2; //рівень гри
    private _playField: TGameObject[][] = []; //грове поле
    private _nameBonuses: string [] = [];   //імена бонусів
    private _widthPlatform: number = 100; //довжина платформи
    private _speedBall: number = 1; //швидкість кулі
    private _numberOfBlocks: number = 0; //кількість блоків в рівні
    private _numberOfKnockedOutBlocks: number = 0;

    constructor() {
        this.reset();
    }
    //------------------- manageStatus ---------------------//
    // отримуємо статус гри
    public getState(): TGameState {
        return {
            playField: this._playField,
            widthPlatform: this._widthPlatform,
            speedBall: this._speedBall,
            nameBonuses: this._nameBonuses,
            score: this._score,
            level: this._levelGame
        }
    }
    //перезапус гри
    public reset(): void {
       this._playField = this.createGameField(this._levelGame); // створюємо заново ігрове поле
        this._nameBonuses = [];
        this._speedBall = 1;
        this._widthPlatform =100;
        this._nameBonuses = [];
        this._score = 0;
        this._velocityBall = 3; //швидкість кулі
        this._velocityBallX = this._velocityBall;
        this._velocityBallY = this._velocityBall;
    }

    //------------------- createObject ---------------------//
    //створюємо ігрове поле
    private createGameField(level: number): TGameObject[][] {

        let playField: TGameObject[][] = [];

        switch (level) {
            case 1: // перший рівень
                playField = this.crateLevel([0,0,0,0]);
                break;
            case 2: // другий рівень
                playField = this.crateLevel([0,1,2,3]);
                break;
            case 3:
                playField = this.crateLevel([0,1,2,3]);
                break;
            case 4:
                playField = this.crateLevel([0,1,2,3]);
                break;
        }
        return playField;
    }
    //створюємо рівень
    private crateLevel(typeBlock: number[]): TGameObject[][] {

        const bonusField: TGameObject[] = this.createBonusField(); //створюємо бонуси
        const playField: TGameObject[][] = [];

        for (let y = 0; y < this.LINE_FIELD; y++) {
            playField[y] = [];
            for (let x = 0; x < this.COLUMN_FIELD; x++) {
                this._numberOfBlocks += 1;
                let gameElement: TGameObject = { // створюємо ігровий об'єкт
                    typeBlock: typeBlock[y], // створюємо конкретний тип блока
                    typeBonus: -1, //за замовчуванням бонус відсутній,
                    x: x, // координата х
                    y: y // координата у
                };
                for (let i = 0; i < bonusField.length; i++) {
                    if (gameElement.x == bonusField[i].x && // якщо х бонусу співпадає з х ігрового елементу, та
                        gameElement.y == bonusField[i].y) { //  якщо н бонусу співпадає з у ігрового елементу, та
                        gameElement.typeBonus = bonusField[i].typeBonus; // додаємо тип бонусу до елементу
                    }
                }
                playField[y].push(gameElement);
            }
        }
        return playField;
    }
    //створюємо поле бонусів
    private createBonusField(): TGameObject[] {
        const bonusesField: TGameObject[] = []; //масив з бонусами
        for (let i = 0; i < 8; i++) { // створюємо 8 бонусів
            const bonus: TGameObject = {
                typeBlock: -1, //нічого не створюємо
                typeBonus: Math.floor(Math.random() * 4), // створюємо випадковий бонус
                x: Math.floor((Math.random() * this.COLUMN_FIELD)), // створюємо випадкову координату х
                y: Math.floor((Math.random() * this.LINE_FIELD)) // створюємо випадкову координату у
            }
            bonusesField.push(bonus);
        }
        return bonusesField;
    }
    //зміна ширини платформи
    public widthPlatform(platform: PIXI.Sprite, width: number): void {
        platform.width = width;
    }
    //ціна вибитого блоку
    public scoresGame(elements: string): number {
        let score: number;
        switch (elements) {
            case '1':
                score = 10;
                break;
            case '2':
                score = 20;
                break;
            case '3':
                score = 30;
                break;
            case '4':
                score = 40
                break;
            case '5':
                score = 50
                break;
        }
        return score;
    }
    //------------------- movementOfElements ---------------------//
    //рух елемента ліворуч
    public moveElementLeft(element: PIXI.Sprite): void {
        element.x -= this._velocityPlatform;
    }
    //рух елемента праворуч
    public moveElementRight(element: PIXI.Sprite): void {
        element.x += this._velocityPlatform;
    }
    //стрибок від платформи
    public jumpInPlatform({platform, ball}: TGameElements): GameState {
        const gameState = this.levelApp();
        if (this.hasCollision(ball, platform)) {
            if (this.leftSidePlatform(ball,platform)) {
                this.bumpBlockY();
                if (this._velocityBallX < 0) {
                    this.bumpBlockX();
                }
            } else {
                this.bumpBlockY();
                if (this._velocityBallX > 0) {
                    this.bumpBlockX();
                }
            }
        }
        return gameState;
    }
    // зміна напрямку по х
    private bumpBlockX(): void {
        this._velocityBallX *= -1;
    }
    // зміна напрямку по у
    private bumpBlockY(): void {
        this._velocityBallY *= -1;
    }
    //рух кулі
    public realiseBall(ball: PIXI.Sprite, velocity: number): GameState {
            ball.x -= (this._velocityBallX) * velocity;
            ball.y -= (this._velocityBallY / 0.5) * velocity;
            return this.checkBounds(ball);
    }
    //------------------- deleteElements ---------------------//
    //видаляємо бонуси
    public removeBonuses(state:TGameElements): string {
        const bonuses: PIXI.Sprite[] = state.bonusSprite;
        const platform: PIXI.Sprite = state.platform;
        let bonusName: string = '';
        for (let i = 0; i < this._nameBonuses.length; i++) {
            for (let j = 0; j < bonuses.length; j++) {
                if (this._nameBonuses[i] == bonuses[j].name) {
                    let deleteBonus = this.catchBonus(bonuses[j], platform);
                    if (deleteBonus) {
                        bonusName = bonuses[j].name;
                    }
                }
            }
            return bonusName;
        }
    }
    //видаляємо блоки
    public hasCollisionBlock(ball: PIXI.Sprite, block): boolean {
        let clear: boolean = false;
        if (this.hasCollision(ball, block)) {
            let words = block.name.split('_');
            let name = words[1];
            this._score += this.scoresGame(name); //змінюємо рахунок
            clear = true;
            this._numberOfKnockedOutBlocks += 1;
            this.bumpBlockY();
        }
        return clear;
    }
    //активуємо бонус
    private activeBonus(bonus: PIXI.Sprite): void {
        let name = bonus.name.split('_')
        let activeBonus: string[] = [];

        if (activeBonus[activeBonus.length - 1] == name[0]) {
            this._score += 100;
        }
        activeBonus.splice(bonus[0]);

        if (name[0] == Bonus[0]) {
            this._widthPlatform = 50;
            this._speedBall = 1;
        } else if (name[0] == Bonus[1]) {
            this._widthPlatform = 150;
            this._speedBall = 1;
        } else if (name[0] == Bonus[2]) {
            this._widthPlatform = 100;
            this._speedBall = 1.5;
        } else if (name[0] == Bonus[3]) {
            this._widthPlatform = 100;
            this._speedBall = 0.75;
        }
    }
    //------------------- checksOfElements ---------------------//
    //перевірка виходу за межі екрану платформи
    public checkBoundsPlatform({ball, platform}: TGameElements, ballInPlatform: boolean): void {
        if (platform.x < 0) {
            this.moveElementRight(platform);
            if (ballInPlatform)
                this.moveElementRight(ball);
        } else if (platform.x + platform.width > 550) {
            this.moveElementLeft(platform);
            if (ballInPlatform)
                this.moveElementLeft(ball);
        }
    }
    //перевірка на колізії
    private hasCollision(elementOne: PIXI.Sprite, elementTwo: PIXI.Sprite): boolean {

        const bounds1 = elementOne.getBounds();
        const bounds2 = elementTwo.getBounds();

        return bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y;
    }
    //перевірка виходу кулі за межі поля
    private checkBounds(ball: PIXI.Sprite): GameState {
        if (ball.x < 0 || (ball.x + ball.width) > 550) {
            this.bumpBlockX();
        }
        if (ball.y < 100) {
            this.bumpBlockY();
        }
        if ((ball.y) > 660) {
            this._numberOfKnockedOutBlocks = 0;
            this._numberOfBlocks = 0;
            return GameState.gameOver;
        }
        return GameState.inGame
    }
    //перевіряємо, чи вибитий бонус
    public checkTheBonus(state: TGameElements, block: PIXI.Sprite): boolean {
        let bonuses = state.bonusSprite;
        if (block != null) {
            for (let i = 0; i < bonuses.length; i++) {
                if (block.x == bonuses[i].x &&
                    block.y == bonuses[i].y) {
                    this._nameBonuses.push(bonuses[i].name);
                    return true;
                }
            }
        }
    }
    //яка сторона відбила кулю
    private leftSidePlatform(ball: PIXI.Sprite, platform: PIXI.Sprite): boolean {
        return (ball.x + ball.width / 2) < (platform.x + platform.width / 2);
    }
    //зміна кута кулі
    //ловимо бонус
    private catchBonus(bonus: PIXI.Sprite, platform: PIXI.Sprite): boolean {
        let deleteBonusSprite = false;
        if ((bonus.y + bonus.height) > 660) {
            let index = this._nameBonuses.indexOf(bonus.name);
            this._nameBonuses.splice(index,1);
            deleteBonusSprite = true;
        } else if(this.hasCollision(bonus, platform)) {
            this.activeBonus(bonus);
            deleteBonusSprite = true;
        }
        return deleteBonusSprite;
    }
    public levelApp(): GameState {
        let gameState: GameState = GameState.inGame;
        if (this._numberOfKnockedOutBlocks != 0 && this._numberOfBlocks == this._numberOfKnockedOutBlocks) {
            this._levelGame += 1;
            gameState = GameState.levelPassed;
            this._numberOfKnockedOutBlocks = 0;
        }
        return GameState.inGame;
    }
 }