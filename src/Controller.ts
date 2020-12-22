import Model, {TGameState} from "./Model"
import View, {TGameElements} from "./View";
import * as TWEEN from '@tweenjs/tween.js'
import {GameState} from "./ColorBlock";
import ViewText from "./ViewText";
import PIXI from "pixi.js";

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
             const stateModel = this._model.getState();
            const stateView = this._view.getElementsGame(); //отримую стан гри
            this._viewText.updateTextScreen(this._model.getState().score, this._model.getState().level); //змінюємо значення тексту
            let block = this.tryClearBlocks(stateView); //перевіряємо які блоки потрібно видалити
             this._model.checkTheBonus(stateView,block); // перевіряємо, чи вибитий бонус
            this.tryStateGame(stateModel,stateView); //рухаємо елементи
        }
         if (this._gameState == GameState.levelPassed) {
             this.levelPassed();
         }
         if (this._gameState == GameState.gameOver) {
             this._view.deleteAll();
             this._viewText.deleteTextScreen(this._view.app);
             this._viewText.addEndScreen();
             this._view.app.ticker.stop();
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

    private levelPassed(): void {
        this._view.deleteAll();
        this._viewText.deleteEndScreen(this._view.app);
        this._viewText.renderNextLevelScreen(this._view.app);
        this._viewText.deleteTextScreen(this._view.app);
        this._viewText.addEndScreen();
        this._view.app.ticker.stop();
    }
    //------------------- gameEvents ---------------------//
    //рухаємо платформу
    private tryStateGame(stateModel: TGameState, stateView: TGameElements): void {
        this.tryStatePlatform(stateView);
        this.tryStateBoll(stateView);
        this.tryStateBonuses(stateModel,stateView);
    }
    //стан бонусів
    private tryStateBonuses(stateModel: TGameState, stateView: TGameElements): void {
        //let moveBonus: boolean = this.tryMoveBonuses(stateModel,stateView);
        if (this.tryMoveBonuses(stateModel,stateView)) {
            const removeBonus: string = this._model.removeBonuses(stateView);
            if (removeBonus) {
                this._view.deleteBonus(removeBonus, this._view.getElementsGame().bonusSprite);
            }
        }
        this._model.widthPlatform(stateView.platform, this._model.getState().widthPlatform);
    }
    //стан кулі на платформі
    private tryStateBoll(stateView: TGameElements): void {
        if (this._ballOnPlatform && this._moveLeft) {
            this._model.moveElementLeft(stateView.ball); //рухаємо кулю ліворуч
        } else if (this._ballOnPlatform && this._moveRight) {
            this._model.moveElementRight(stateView.ball); //рухаємо кулю праворуч
        }
        if (!this._ballOnPlatform) { //якщо кулька не на платформі
            let speedBall = this._model.getState().speedBall;
            let gameState = this._model.realiseBall(stateView.ball, speedBall); // рухаємо кулю
            if (gameState != GameState.gameOver) {
                this._gameState = this._gameState = this._model.jumpInPlatform(stateView); //відбиваємо кулю від платформи
            } else {
                this._gameState = gameState;
            }
        }
    }
    //стан платформи
    private tryStatePlatform(stateView: TGameElements): void {
        if (this._moveLeft) {
            this._model.moveElementLeft(stateView.platform); //рухаємо платформу ліворуч
            this._model.checkBoundsPlatform(stateView,this._ballOnPlatform); //перевіряємо чи не виходить платформа за межі
        } else if (this._moveRight) {
            this._model.moveElementRight(stateView.platform); //рухаємо платформу праворуч
            this._model.checkBoundsPlatform(stateView,this._ballOnPlatform); //перевіряємо чи не виходить платформа за межі
        }
    }
    //рухаємо бонуси
    private tryMoveBonuses(stateModel: TGameState,stateView: TGameElements): boolean {
        let moveBonus = false;
        let nB: string[] = [];
        let bonuses: PIXI.Sprite[] = stateView.bonusSprite;
        let nameBonuses: string[] = stateModel.nameBonuses;
        for (let i = 0; i < nameBonuses.length; i++) {
            for (let j = 0; j < bonuses.length; j++) {
                if (nameBonuses[i] == bonuses[j].name) {
                    nB.push(nameBonuses[i]);
                }
                for (let k = 0; k < nB.length; k++) {
                    if (nB[k] == bonuses[j].name) {
                        moveBonus = true;
                        this._view.gravityBonuses(bonuses[j]);
                    }
                }
            }
        }
        return moveBonus;
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
                    this._view.app.ticker.start();
                    this.restart(); //перезапускаємо
                    this._view.renderMainScreen();  //малюємо ігрові елементи
                    this._viewText.renderTextScreen(this._view.app);
                    //this._viewText.deleteEndScreen(this._view.app); //видаляємо екран закінчення
                    gameState = GameState.inGame;
                } else if (this._gameState == GameState.levelPassed) {
                    this._view.app.ticker.start();
                    this.restart(); //перезапускаємо
                    this._view.renderMainScreen();  //малюємо ігрові елементи
                    this._viewText.renderTextScreen(this._view.app);
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