// import * as PIXI from 'pixi.js'
// // Based somewhat on this article by Spicy Yoghurt
// // URL for further reading: https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
// const app = new PIXI.Application({ backgroundColor: 0x111111 });
// document.body.appendChild(app.view);
//
// // Options for how objects interact
// // Як швидко рухається червоний квадрат
// const movementSpeed = 0.05;
//
// // Сила імпульсного поштовху між двома предметами
// const impulsePower = 5;
//
// // Test For Hit
// // Базова перевірка AABB між двома різними квадратами
// function testForAABB(object1, object2) {
//     const bounds1 = object1.getBounds();
//     const bounds2 = object2.getBounds();
//
//     return bounds1.x < bounds2.x + bounds2.width
//         && bounds1.x + bounds1.width > bounds2.x
//         && bounds1.y < bounds2.y + bounds2.height
//         && bounds1.y + bounds1.height > bounds2.y;
// }
//
// // Обчислює результати зіткнення, дозволяючи нам подати імпульс
// // розсовує предмети
// function collisionResponse(object1, object2) {
//     if (!object1 || !object2) {
//         return new PIXI.Point(0);
//     }
//
//     const vCollision = new PIXI.Point(
//         object2.x - object1.x,
//         object2.y - object1.y,
//     );
//
//     const distance = Math.sqrt(
//         (object2.x - object1.x) * (object2.x - object1.x)
//         + (object2.y - object1.y) * (object2.y - object1.y),
//     );
//
//     const vCollisionNorm = new PIXI.Point(
//         vCollision.x / distance,
//         vCollision.y / distance,
//     );
//
//     const vRelativeVelocity = new PIXI.Point(
//         object1.acceleration.x - object2.acceleration.x,
//         object1.acceleration.y - object2.acceleration.y,
//     );
//
//     const speed = vRelativeVelocity.x * vCollisionNorm.x
//         + vRelativeVelocity.y * vCollisionNorm.y;
//
//     const impulse = impulsePower * speed / (object1.mass + object2.mass);
//
//     return new PIXI.Point(
//         impulse * vCollisionNorm.x,
//         impulse * vCollisionNorm.y,
//     );
// }
//
// // Обчислимо відстань між двома заданими точками
// function distanceBetweenTwoPoints(p1, p2) {
//     const a = p1.x - p2.x;
//     const b = p1.y - p2.y;
//
//     return Math.hypot(a, b);
// }
//
// // Зелений квадрат, про який ми будемо стукати
// const greenSquare = new PIXI.Sprite(PIXI.Texture.WHITE);
// greenSquare.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
// greenSquare.width = 100;
// greenSquare.height = 100;
// // @ts-ignore
// greenSquare.tint = '0#00FF00';
// // @ts-ignore
// greenSquare.acceleration = new PIXI.Point(0);
// // @ts-ignore
// greenSquare.mass = 3;
//
// // Квадрат, яким ви рухаєтесь
// const redSquare = new PIXI.Sprite(PIXI.Texture.WHITE);
// redSquare.position.set(0, 0);
// redSquare.width = 100;
// redSquare.height = 100;
// // @ts-ignore
// redSquare.tint = '0xFF0000';
// // @ts-ignore
// redSquare.acceleration = new PIXI.Point(0);
// // @ts-ignore
// redSquare.mass = 1;
//
// // Слухайте анімоване оновлення
// app.ticker.add((delta) => {
//     // Застосовується дезальсифікація для обох квадратів, виконана за рахунок зменшення
//     // прискорення на 0,01% від прискорення кожної петлі
//     // @ts-ignore
//     redSquare.acceleration.set(redSquare.acceleration.x * 0.99, redSquare.acceleration.y * 0.99);
//     // @ts-ignore
//     greenSquare.acceleration.set(greenSquare.acceleration.x * 0.99, greenSquare.acceleration.y * 0.99);
//
//     const mouseCoords = app.renderer.plugins.interaction.mouse.global;
//
//     // Перевірте, чи колись зелений квадрат не зміщується з екрану
//     // Якщо так, поверніть прискорення назад у цьому напрямку
//     if (greenSquare.x < 0 || greenSquare.x > (app.screen.width - 100)) {
//         greenSquare.acceleration.x = -greenSquare.acceleration.x;
//     }
//
//     if (greenSquare.y < 0 || greenSquare.y > (app.screen.height - 100)) {
//         greenSquare.acceleration.y = -greenSquare.acceleration.y;
//     }
//
//     // Якщо зелений квадрат вискакує з кордону, він вискакує назад у
//     // середній
//     if ((greenSquare.x < -30 || greenSquare.x > (app.screen.width + 30))
//         || greenSquare.y < -30 || greenSquare.y > (app.screen.height + 30)) {
//         greenSquare.position.set((app.screen.width - 100) / 2, (app.screen.height - 100) / 2);
//     }
//
//     // Якщо миша поза екраном, не оновлюйте далі
//     if (app.screen.width > mouseCoords.x || mouseCoords.x > 0
//         || app.screen.height > mouseCoords.y || mouseCoords.y > 0) {
//         // Отримаємо центральну точку Червоного квадрата
//         const redSquareCenterPosition = new PIXI.Point(
//             redSquare.x + (redSquare.width * 0.5),
//             redSquare.y + (redSquare.height * 0.5),
//         );
//
//         // Обчислимо вектор напрямку між вказівником миші та
//         // червоний квадрат
//         const toMouseDirection = new PIXI.Point(
//             mouseCoords.x - redSquareCenterPosition.x,
//             mouseCoords.y - redSquareCenterPosition.y,
//         );
//
//         // Use the above to figure out the angle that direction has
//         const angleToMouse = Math.atan2(
//             toMouseDirection.y,
//             toMouseDirection.x,
//         );
//
//         // Визначте швидкість, якою має рухатися квадрат, як a
//         // функція того, наскільки далеко від вказівника миші знаходиться червоний квадрат
//         const distMouseRedSquare = distanceBetweenTwoPoints(
//             mouseCoords,
//             redSquareCenterPosition,
//         );
//         const redSpeed = distMouseRedSquare * movementSpeed;
//
//         // Обчислити прискорення червоного квадрата
//         redSquare.acceleration.set(
//             Math.cos(angleToMouse) * redSpeed,
//             Math.sin(angleToMouse) * redSpeed,
//         );
//     }
//
//     // Якщо два квадрати стикаються
//     if (testForAABB(greenSquare, redSquare)) {
//         // Обчислити зміни прискорення, які слід зробити між
//         // кожен квадрат в результаті зіткнення
//         const collisionPush = collisionResponse(greenSquare, redSquare);
//         // Встановіть зміни прискорення для обох квадратів
//         redSquare.acceleration.set(
//             (collisionPush.x * greenSquare.mass),
//             (collisionPush.y * greenSquare.mass),
//         );
//         greenSquare.acceleration.set(
//             -(collisionPush.x * redSquare.mass),
//             -(collisionPush.y * redSquare.mass),
//         );
//     }
//
//     greenSquare.x += greenSquare.acceleration.x * delta;
//     greenSquare.y += greenSquare.acceleration.y * delta;
//
//     redSquare.x += redSquare.acceleration.x * delta;
//     redSquare.y += redSquare.acceleration.y * delta;
// });
//
// // Add to stage
// app.stage.addChild(redSquare, greenSquare);