import * as PIXI from 'pixi.js'
import {Bonus, ColorBlock} from './ColorBlock'
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
    nameBonuses: string[]
}

export default class Model {
    //------------------- constants ---------------------//
    private readonly _columnField: number = 10; //кількість стовпців на полі
    private readonly _lineField: number = 4; //кількість рядків на полі
    private _velocityPlatform: number = 10; //швидкість платформи
    private _velocityBall: number = 3; //швидкість кулі
    private _velocityBallX: number = this._velocityBall;
    private _velocityBallY: number = this._velocityBall;
    private readonly _velocityBonus = 3;
    //------------------- dataGame ---------------------//
    private _levelGame: number = 2; //рівень гри
    private _playField: TGameObject[][] = this.createGameField(this._levelGame); //грове поле
    private _nameBonuses: string [] = [];
    private _widthPlatform: number = 100;
    private _speedBall: number = 1;

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
            nameBonuses: this._nameBonuses
        }
    }
    //перезапус гри
    private reset(): void {
       this._playField = this.createGameField(this._levelGame); // створюємо заново ігрове поле
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
                break;
            case 4:
                break;
        }
        return playField;
    }
    //створюємо рівень
    private crateLevel(typeBlock: number[]): TGameObject[][] {

        const bonusField: TGameObject[] = this.createBonusField(); //створюємо бонуси
        const playField: TGameObject[][] = [];

        for (let y = 0; y < this._lineField; y++) {
            playField[y] = [];
            for (let x = 0; x < this._columnField; x++) {
                let gameElement: TGameObject = { // створюємо ігровий об'єкт
                    typeBlock: typeBlock[y], // створюємо конкретний тип блока
                    typeBonus: -1, //за замовчуванням бонус відсутній
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
                x: Math.floor((Math.random() * this._columnField)), // створюємо випадкову координату х
                y: Math.floor((Math.random() * this._lineField)) // створюємо випадкову координату у
            }
            bonusesField.push(bonus);
        }
        return bonusesField;
    }

    public widthPlatform(platform: PIXI.Sprite, width: number): void {
        platform.width = width;
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
    public jumpInPlatform({platform, ball}: TGameElements): void {
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
    public realiseBall(ball: PIXI.Sprite, velocity: number): void {
            ball.x -= (this._velocityBallX) * velocity;
            //ball.y -= this._velocityBallY;
            ball.y -= (this._velocityBallY / 0.5) * velocity;
            this.checkBounds(ball);
    }
    //рух бонусів
    private gravityBonuses(bonus: PIXI.Sprite): void {
            bonus.y += this._velocityBonus;
    }
    //запускаємо гравітацію бонусів
    public moveBonuses(state: TGameElements): void {
        const bonuses = state.bonusSprite;
        const platform = state.platform;
        for (let i = 0; i < this._nameBonuses.length; i++) {
            for (let j = 0; j < bonuses.length; j++) {
                if (this._nameBonuses[i] == bonuses[j].name) {
                    this.gravityBonuses(bonuses[j]);
                    this.catchBonus(bonuses[j], platform);
                }
            }
        }
    }
    //------------------- deleteElements ---------------------//
    //видаляємо блоки
    public hasCollisionBlock(ball: PIXI.Sprite, block): boolean {
        let clear: boolean = false;
        if (this.hasCollision(ball, block)) {
            clear = true;
            this.bumpBlockY();
        }
        return clear;
    }
    //активуємо бонус
    private activeBonus(bonus: PIXI.Sprite): void {
        let name = bonus.name.split('_')
        let activeBonus: string[] = [];

        if (activeBonus[activeBonus.length - 1] == name[0]) {
            // збільшуємо рахунок
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
    private checkBounds(ball: PIXI.Sprite) {
        if (ball.x < 0 || (ball.x + ball.width) > 550) {
            this.bumpBlockX();
        }
        if (ball.y < 100 || (ball.y + ball.height) > 660) {
            this.bumpBlockY();
        }
    }
    //перевіряємо, чи вибитий бонус
    public checkTheBonus(state: TGameElements, block: PIXI.Sprite): void {
        const bonuses = state.bonusSprite;
        if (block != null)
            for (let i = 0; i < bonuses.length; i++) {
                if (block.x == bonuses[i].x &&
                    block.y == bonuses[i].y) {
                    this._nameBonuses.push(bonuses[i].name);
                }
            }
    }
    //яка сторона відбила кулю
    private leftSidePlatform(ball: PIXI.Sprite, platform: PIXI.Sprite): boolean {
        return (ball.x + ball.width / 2) < (platform.x + platform.width / 2);
    }
    //ловимо бонус
    private catchBonus(bonus: PIXI.Sprite, platform: PIXI.Sprite): void {
        if ((bonus.y + bonus.height) > 660) {
            let index = this._nameBonuses.indexOf(bonus.name);
            this._nameBonuses.splice(index,1);
        } else if(this.hasCollision(bonus, platform)) {
            this.activeBonus(bonus);
        }
    }
 }