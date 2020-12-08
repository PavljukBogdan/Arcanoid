import * as PIXI from 'pixi.js'
import {Bonus, ColorBlock} from './ColorBlock'


export type TGameObject = {
    typeBlock: number;
    typeBonus: number;
    x: number;
    y: number;
}

export type TGamePlatform = {

}

export type TGameState = {
    playField: TGameObject[][]
}

export default class Model {
    //------------------- constants ---------------------//
    private readonly _columnField: number = 10; //кількість стовпців на полі
    private readonly _lineField: number = 4; //кількість рядків на полі
    //------------------- dataGame ---------------------//
    private _levelGame: number = 1; //рівень гри
    private _playField: TGameObject[][] = this.createGameField(this._levelGame); //грове поле

    constructor() {
        this.reset();
    }
    //------------------- manageStatus ---------------------//
    // отримуємо статус гри
    public getState(): TGameState {
        return {
            playField: this._playField
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
                typeBonus: Math.floor(Math.random() * 3), // створюємо випадковий бонус
                x: Math.floor((Math.random() * this._columnField)), // створюємо випадкову координату х
                y: Math.floor((Math.random() * this._lineField)) // створюємо випадкову координату у
            }
            bonusesField.push(bonus);
        }
        return bonusesField;
    }
}