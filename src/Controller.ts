import Model from "./Model"
import View from "./View";
import * as TWEEN from '@tweenjs/tween.js'

export default class Controller {

    private _model: Model;
    private _view: View;

    constructor(model: Model, view: View) {
        this._model = model;
        this._view = view;

        this.startTimer();
    }

    private update(delta: object):void {
        this._view.renderMainScreen();
    }

    private startTimer(): void {
        this._view.app.ticker.add(delta => this.update(delta));
    }

}