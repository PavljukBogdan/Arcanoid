import Model from "./Model"
import View from "./View";
import * as TWEEN from '@tweenjs/tween.js'

export default class Controller {

    private _model: Model;
    private _view: View;
    private _moveLeft: boolean = false;
    private _moveRight: boolean = false;
    private _ballOnPlatform: boolean = true;
    private _inGame = false;

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
        this.updateView();
        this.moveElements();
        this._model.clearBlock();
        this._model.jumpInPlatform();
        this._model.checkBounds();
        TWEEN.update();
    }

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

        if (this._ballOnPlatform === false) {
            this._model.realiseBall();
        }
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