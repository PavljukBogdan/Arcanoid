import * as PIXI from 'pixi.js'
import * as TWEEN from '@tweenjs/tween.js'

export type TGameState = {
    platforms: PIXI.Sprite[];
    balls: PIXI.Sprite[];
    blocks: PIXI.Sprite[];
    blockRemove: PIXI.Sprite[];
    score: number;
};

export default class Model {

    private _platforms: PIXI.Sprite[] = []; //масив платформ
    private _balls: PIXI.Sprite[] = []; // масив м'ячів
    private _blocks: PIXI.Sprite[] = []; // масив блоків
    private _blockRemove: PIXI.Sprite[] = []; //масив блоків, що видаляються
    private _velocityPlatform = 10; //максимальна швидкісь переміщення платформи
    private _velocityBall = 4; //максимальна швидкість м'яча
    private _velocityBallX = this._velocityBall;
    private _velocityBallY = this._velocityBall;
    private _score: number = 0; // рахунок

    constructor() {
        this.createGameField();
    }
    // отримуємо статус гри
    public getState(): TGameState {
        return  {
           platforms: this._platforms,
           balls: this._balls,
           blocks: this._blocks,
            blockRemove: this._blockRemove,
            score: this._score
        }
    }
    // створюємо ігрове поле
    private createGameField(): void {
        this._platforms.push(this.createBlockGame('./assets/Line.png',210,435,14,100, 'platform'));
        this._balls.push(this.createBlockGame('./assets/Bal.png',250,410,25,25, 'ball'));
        this.createLevelOne();

    }
    // створюємо перший рівень
    private createLevelOne(): void {
        let blockY = 50;
        for (let y = 0; y < 4; y++) {
            let blockX = 25;
            for (let x = 0; x < 10; x++) {
                this._blocks.push(this.createBlockGame('./assets/Box.png',blockX,blockY,33,50, 'block_'+ x + '_' + y));
                blockX += 50;
            }
            blockY += 35;
        }
    }

    //створюємо ігровий блок
    private createBlockGame (name: string,x: number, y: number,height: number, width: number, nameBlock: string): PIXI.Sprite {
        const sprite = PIXI.Sprite.from(name);
        sprite.x = x;
        sprite.y = y;
        sprite.height = height;
        sprite.width = width;
        sprite.name = nameBlock;

        return sprite;
    }

    public movePlatformLeft(): void {
        const platform = this._platforms[0];
            platform.x -= this._velocityPlatform;
    }

    public movePlatformRight(): void {
        const platform = this._platforms[0];
        platform.x += this._velocityPlatform;
    }

    public moveBallInPlatformLeft(): void {
        const ball = this._balls[0];
        ball.x -= this._velocityPlatform;
    }

    public moveBallInPlatformRight(): void {
        const ball = this._balls[0];
        ball.x += this._velocityPlatform;
    }

    public realiseBall(): void {
        const ball = this._balls[0];
        ball.x -= this._velocityBallX;
        ball.y -= this._velocityBallY;
        // let tween = new TWEEN.Tween(this._balls[0]);
        // let dx = ball.x - this._velocityBallX;
        // let dy = ball.y - this._velocityBallY;
        // tween.to({x:dx,y:dy},0.1);
        // tween.start();
    }
    //видаляємо блоки що вибили
    public clearBlock(): void {
        for (let i = 0; i < this._blocks.length; i ++) {
            if (this.hasCollision(this._balls[0], this._blocks[i])) { //якщо м'яч доторкнувся до блока
                this.bumpBlockY(); //змінюємо координату м'яча
                this._blockRemove.push(this._blocks[i]); //додаємо блок в масив
                this._blocks.splice(i,1); //видаляємо блок з поля
                this._score += 10; //змінюємо рахунок
            }
        }
    }



    public jumpInPlatform(): void {
        if (this.hasCollision(this._balls[0], this._platforms[0])) {
            if (this.leftSidePlatform(this._balls[0], this._platforms[0])) {
                this.bumpBlockY();
                this.bumpBlockX();
            } else {
                this.bumpBlockY();
            }
        }
    }

    private hasCollision(ball: PIXI.Sprite, block: PIXI.Sprite): boolean {

        const bounds1 = ball.getBounds();
        const bounds2 = block.getBounds();

        return bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y;
    }

    public checkBounds(): boolean {
        const ball = this._balls[0];

        if (ball.x < 0) {
            this.bumpBlockX();
        } else if (ball.x + ball.width > 550) {
            this.bumpBlockX();
        } else if (ball.y < 0) {
            this.bumpBlockY();
        } else if (ball.y + ball.height > 560) {
            //game over
        }
        return false
    }

    private bumpBlockX(): void {
        this._velocityBallX *= -1;
    }

    private bumpBlockY(): void {
        this._velocityBallY *= -1;
    }

    private leftSidePlatform(ball: PIXI.Sprite, platform: PIXI.Sprite): boolean {
        return (ball.x + ball.width / 2) < (platform.x + platform.width / 2);
    }

    private updateScore(): void {

    }
}