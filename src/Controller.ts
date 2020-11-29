import Model from "./Model"
import View from "./View";
import * as TWEEN from '@tweenjs/tween.js'

export default class Controller {

    private _model: Model;
    private _view: View;
    private _moveLeft: boolean = false; // прапору руху ліворуч
    private _moveRight: boolean = false; //прапор руху праворуч
    private _ballOnPlatform: boolean = true; // прапор розташування м'яча на платформі
    private _inGame: boolean = false; //прапор стану гри
    private _isPlay: boolean = false; //прапор гри якщо граємо

    constructor(model: Model, view: View) {
        this._model = model;
        this._view = view;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handKeyUp.bind(this));
        this.startTimer();
    }
    //оновлення поля
    private updateView(): void {
        this._view.renderMainScreen();
    }

    private update(delta: object):void {
        const state = this._view.getSprite();
        TWEEN.update();
        if (this._inGame) {
            this._isPlay = true;
            this.updateView(); //оновлюємо поле
            this.moveElements(); //рухаємо елементи
            this._model.clearBlock(state); //очищаємо знищені блоки
            this._model.jumpInPlatform(state); //відштовхуємо м'яч від платформи
            this._model.checkBounds(state); //перевіряємо межі
            this._model.checkBoundsPlatform(state,this._ballOnPlatform);
            this._view.deleteStartScreen();
        }
        if (this._model.getState().GameOver) {
            this._view.renderEndScreen();
            }
    }

    //рух елементів гри
    private moveElements(): void {
        const state = this._view.getSprite();
        //рух платформи ліворуч / праворуч
        if (this._moveLeft) {
            this._model.movePlatformLeft(state.platforms[0]);
        } else if (this._moveRight) {
            this._model.movePlatformRight(state.platforms[0]);
        }
        //рух м'яча з платформою ліворуч / праворуч
        if (this._ballOnPlatform && this._moveLeft) {
            this._model.moveBallInPlatformLeft(state.balls[0]);
        } else if (this._ballOnPlatform && this._moveRight) {
            this._model.moveBallInPlatformRight(state.balls[0]);
        }
        if (!this._ballOnPlatform ) {
            this._model.realiseBall(state.balls[0]);
        }
    }


    private restart(): void {
        this._ballOnPlatform = true;
        this._view.deleteEndScreen();
        this._model.reset();
        this._view.reset();
    }

    private startTimer(): void {
        this._view.app.ticker.add(delta => this.update(delta));
    }
    //виводимо екран паузи
    private updatePauseScreen(): void {
        if (this._isPlay && !this._inGame) {
            this._view.renderPauseScreen();
        } else {
            this._view.deletePauseScreen();
        }
    }
    //слідкуємо за натисканням клавіш
    private handleKeyDown(e: KeyboardEvent): void {

        switch (e.key) {
            case 'ArrowUp':
                this._ballOnPlatform = false;
                break;
            case 'Enter':
                this._inGame = !this._inGame;
                if (!this._model.getState().GameOver) {
                    this.updatePauseScreen();
                } else {
                    this.restart();
                    this._inGame = true;
                }
                break;
            case 'ArrowLeft':
                if (!this._model.getState().GameOver)
                this._moveLeft = true;
                break;
            case 'ArrowRight':
                if (!this._model.getState().GameOver)
                this._moveRight = true;
                break;
        }
    }
    //слідкуємо за відпусканням клавіш
    private handKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowLeft':
                this._moveLeft = false;
                this.updateView();
                break;
            case 'ArrowRight':
                this._moveRight = false;
                this.updateView();
                break;
        }
    }
}