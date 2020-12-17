import Model from "./Model"
import View, {TGameElements} from "./View";
import * as TWEEN from '@tweenjs/tween.js'
import {GameState} from "./ColorBlock";

export default class Controller {

    private _model: Model;
    private _view: View;

    private _moveLeft: boolean = false; // рух ліворуч
    private _moveRight: boolean = false; // рух праворуч
    private _ballOnPlatform: boolean = true; //чи куля на платформі
    private _gameState = GameState.createGame;

    constructor(model: Model, view: View) {
        this._model = model;
        this._view = view;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handKeyUp.bind(this));

        this.startTimer();
    }

    //------------------- gameLoop ---------------------//

    private update(delta: object):void {
        TWEEN.update();
        this._view.renderGameText(this._gameState,this._model.getState());//виводимо текст на екран
        if (this._gameState == GameState.inGame) { //якщо в грі
            const state = this._view.getElementsGame();
            this._view.renderMainScreen();  //малюємо ігрові елементи
            let block: PIXI.Sprite = this.tryClearBlocks(state); //перевіряємо які блоки потрібно видалити
            this.moveElements(state,block); //рухаємо елементи
            this._view.moveTS(state.scoreText); //рухаємо текст рахунку
        }
    }

    private startTimer(): void {
        this._view.app.ticker.add(delta => this.update(delta));
    }

    private restart() {
        this._ballOnPlatform = true;
        this._moveLeft = false;
        this._moveRight = false;
        this._model.reset();
        this._view.reset();
    }

    //------------------- gameEvents ---------------------//
    //рухаємо платформу
    private moveElements(state: TGameElements, block: PIXI.Sprite): void {
        if (this._moveLeft) {
            this._model.moveElementLeft(state.platform); //рухаємо платформу ліворуч
            this._model.checkBoundsPlatform(state,this._ballOnPlatform); //перевіряємо чи не виходить платформа за межі
        } else if (this._moveRight) {
            this._model.moveElementRight(state.platform); //рухаємо платформу праворуч
            this._model.checkBoundsPlatform(state,this._ballOnPlatform); //перевіряємо чи не виходить платформа за межі
        }
        if (this._ballOnPlatform && this._moveLeft) {
            this._model.moveElementLeft(state.ball); //рухаємо кулю ліворуч
        } else if (this._ballOnPlatform && this._moveRight) {
            this._model.moveElementRight(state.ball); //рухаємо кулю праворуч
        }
        if (!this._ballOnPlatform) { //якщо кулька не на платформі
            let speedBall = this._model.getState().speedBall;
            this._gameState = this._model.jumpInPlatform(state); //відбиваємо кулю від платформи
            this._gameState = this._model.realiseBall(state.ball, speedBall); // рухаємо кулю
        }
        this._model.moveBonuses(state);
        this._model.widthPlatform(state.platform, this._model.getState().widthPlatform);
    }
    //видаляємо вибиті блоки
    private tryClearBlocks(state: TGameElements): PIXI.Sprite {
        let block = null;
        let ball = state.ball; //отримуємо кулю
        let blocks = state.blocks; // отримуємо блоки
        for (let i = 0; i < blocks.length; i++) { // проходимось по масиву блоків
            let clearBlocks: boolean = this._model.hasCollisionBlock(ball,blocks[i]); //перевіряємо на колізію блок та кулю
            if (clearBlocks) { //при колізії
                block = blocks[i];
                this._model.checkTheBonus(state,block);
                this._view.deleteBlock(blocks[i]); //видаляємо блок з масиву
            }
        }
        return block;
    }
    //------------------- keyboardEvent ---------------------//
    //слідкуємо за натисканням клавіш
    private handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowUp':
                this._ballOnPlatform = false;
                break;
            case 'Enter':
                let gameState;
                if (this._gameState == GameState.createGame) {
                    gameState = GameState.inGame;
                } else if (this._gameState == GameState.inGame) {
                    gameState = GameState.pauseGame;
                 } else if (this._gameState == GameState.pauseGame) {
                    gameState = GameState.inGame;
                 } else if (this._gameState == GameState.gameOver) {
                    this.restart();
                    gameState = GameState.inGame;
                }
                this._gameState = gameState;
                break;
            case 'ArrowLeft':
                this._moveLeft = true;
                break;
            case 'ArrowRight':
                this._moveRight = true;
                break;
        }
    }
    //слідкуємо за відпусканням клавіш
    private handKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowLeft':
                this._moveLeft = false;
                break;
            case 'ArrowRight':
                this._moveRight = false;
                break;
        }
    }
}