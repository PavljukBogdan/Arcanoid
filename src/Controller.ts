import Model from "./Model"
import View, {TGameElements} from "./View";
import * as TWEEN from '@tweenjs/tween.js'
import {GameState} from "./ColorBlock";
import ViewText from "./ViewText";

export default class Controller {

    private _model: Model;
    private _view: View;
    private _viewText: ViewText;

    private _moveLeft: boolean = false; // рух ліворуч
    private _moveRight: boolean = false; // рух праворуч
    private _ballOnPlatform: boolean = true; //чи куля на платформі
    private _gameState = GameState.createGame;

    constructor(model: Model, view: View, viewText: ViewText) {
        this._model = model;
        this._view = view;
        this._viewText = viewText;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handKeyUp.bind(this));

        if (this._gameState == GameState.createGame) {
            this._viewText.renderStartScreen(this._view.app);
            this._viewText.renderEndScreen(this._view.app);
        }

        this.startTimer();
    }

    //------------------- gameLoop ---------------------//

    private update(delta: object):void {
        TWEEN.update();
         if (this._gameState == GameState.inGame) { //якщо в грі
            const state = this._view.getElementsGame(); //отримую стан гри
            this._viewText.updateTextScreen(this._model.getState().score, this._model.getState().level); //змінюємо значення тексту
            this.tryClearBlocks(state); //перевіряємо які блоки потрібно видалити
            this.moveElements(state); //рухаємо елементи
        }
         if (this._gameState == GameState.gameOver) {
             this._view.deleteAll();
             this._viewText.addEndScreen(); //поки не придумав, де краще викликати...
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
    private moveElements(state: TGameElements): void {
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
        const dellBonus: string = this._model.moveBonuses(state);
        if (dellBonus) {
            this._view.deleteBonus(dellBonus, this._view.getElementsGame().bonusSprite);
        }
        this._model.widthPlatform(state.platform, this._model.getState().widthPlatform);
    }
    //видаляємо вибиті блоки
    private tryClearBlocks(state: TGameElements): PIXI.Sprite {
        let block = null;
        let ball = state.ball; // отримуємо кулю
        let blocks = state.blocks; // отримуємо блоки
        for (let i = 0; i < blocks.length; i++) { // проходимось по масиву блоків
            let clearBlocks: boolean = this._model.hasCollisionBlock(ball,blocks[i]); // перевіряємо на колізію блок та кулю
            if (clearBlocks) { //при колізії
                block = blocks[i];
                this._view.moveTS(state.scoreText, block); //рухаємо текст рахунку
                this._model.checkTheBonus(state,block); // перевіряємо, чи вибитий бонус
                this._view.deleteBlock(blocks[i]); // видаляємо блок з масиву
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
                    this._view.renderMainScreen();  //малюємо ігрові елементи
                    this._viewText.renderTextScreen(this._view.app); //малюємо ігровий текс
                    gameState = GameState.inGame;
                } else if (this._gameState == GameState.inGame) {
                    this._viewText.renderPauseScreen(this._view.app); //малюємо текс паузи
                    gameState = GameState.pauseGame;
                 } else if (this._gameState == GameState.pauseGame) {
                    this._viewText.deletePauseScreen(this._view.app); //видаляємо текст паузи
                    gameState = GameState.inGame;
                 } else if (this._gameState == GameState.gameOver) {
                    this.restart(); //перезапускаємо
                    this._view.renderMainScreen();  //малюємо ігрові елементи
                    //this._viewText.deleteEndScreen(this._view.app); //видаляємо екран закінчення
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