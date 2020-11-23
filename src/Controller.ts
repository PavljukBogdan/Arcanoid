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
    private isPlay: boolean = false; //прапор гри якщо граємо

    constructor(model: Model, view: View) {
        this._model = model;
        this._view = view;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handKeyUp.bind(this));
        this.startTimer();
    }
    //оновлення поля
    private updateView(): void {
        const state = this._model.getState();
        this._view.renderMainScreen(state);
    }

    private update(delta: object):void {
        if (this._inGame) {
            this.isPlay = true;
            this.updateView(); //оновлюємо поле
            this.moveElements(); //рухаємо елементи
            this._model.clearBlock(); //очищаємо знищені блоки
            this._model.jumpInPlatform(); //відштовхуємо м'яч від платформи
            this._model.checkBounds(); //перевіряємо межі
            TWEEN.update();
            this._view.deleteStartScreen();
        } else if(!this._inGame && !this.isPlay) {
            this._view.renderStartScreen();
        }

        if (this.isPlay && !this._inGame) {
            this._view.renderPauseScreen();
        } else {
                this._view.deletePauseScreen();
        }

        if (this._model.getState().GameOver) {
            this._view.renderEndScreen();
            this._view.app.ticker.stop();
            this._inGame = false;
        }
    }
    //рух елементів гри
    private moveElements(): void {
        //рух платформи ліворуч / праворуч
        if (this._moveLeft) {
            this._model.movePlatformLeft();
        } else if (this._moveRight) {
            this._model.movePlatformRight();
        }
        //рух м'яча з платформою ліворуч / праворуч
        if (this._ballOnPlatform && this._moveLeft) {
            this._model.moveBallInPlatformLeft();
        } else if (this._ballOnPlatform && this._moveRight) {
            this._model.moveBallInPlatformRight();
        }
        if (!this._ballOnPlatform ) {
            this._model.realiseBall();
        }
    }

    private restart(): void {
        this._view.deleteEndScreen();
        this._model.reset();
    }

    private startTimer(): void {
        this._view.app.ticker.add(delta => this.update(delta));
    }
    //слідкуємо за натисканням клавіш
    private handleKeyDown(e: KeyboardEvent): void {
        console.log(e.key);
        switch (e.key) {
            case 'ArrowUp':
                this._ballOnPlatform = false;
                break;
            case 'Enter':
                this._inGame = !this._inGame;
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
                this.updateView();
                break;
            case 'ArrowRight':
                this._moveRight = false;
                this.updateView();
                break;
        }
    }
}