let myCanvas;
let context;
let secondsPassed = 0;
let oldPassed = 0;
let gameObjects;
let vCollision;
let vCollisionNorm;
let distance;
let vRelativeVelocity;
let speed;
const g = 9.81;
let canvasWidth = 850;
let canvasHeight = 500;

// Set a restitution, a lower value will lose more energy when colliding
let restitusion = 0.90;

window.onload = init;

function init() {
    myCanvas = document.getElementById('myCanvas');
    context = myCanvas.getContext('2d');
    creatGameObjects();

    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
    secondsPassed = (timeStamp - oldPassed) / 1000;
    oldPassed = timeStamp;

    fps = Math.round(1 / secondsPassed);

    for(let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(secondsPassed);
    }

    detectCollisions();
    detectEdgeCollisions();

    clearCanvas();

    for(let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
    }

    requestAnimationFrame(gameLoop);
}

class gameObject {
    constructor(context, x, y, vx, vy) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

         // Set default width and height
         this.isColliding = false;
         this.restitution = 1;
    }
}

class Circle extends gameObject {
    constructor(context, x, y, vx, vy, mass, radius) {
        super(context, x, y, vx, vy);
        this.mass = mass;
        this.radius = radius;
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = this.isColliding? '#FF0000': '#00FF00';
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fill();

        context.font = '22px Arial';
        context.fillStyle = 'black';
        context.fillText("FPS: " + fps, 10, 30);

        // Draw heading vector
        // this.context.beginPath();
        // this.context.moveTo(this.x, this.y);
        // this.context.lineTo(this.x + this.vx, this.y + this.vy);
        // this.context.stroke();
        
    }

    update(secondsPassed) {
        // Apply acceleration
        this.vy += g * this.mass * secondsPassed;

        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);
        // Convert to degrees
        let degrees = 180 * radians / Math.PI;

    }
}

function creatGameObjects() {
    gameObjects = [
        new Circle(context, 250, 50, 0, 500, 10, 10),
        new Circle(context, 250, 300, 0, -500, 20, 20),
        new Circle(context, 150, 0, 50, 1000, 10, 10),
        new Circle(context, 250, 150, 50, 50, 30, 30),
        new Circle(context, 350, 75, -50, 50, 10, 10),
        new Circle(context, 300, 300, 50, -50, 10, 10),
        new Circle(context, 10, 300, 50, -50, 10, 10),
        new Circle(context, 300, 10, 50, -50, 10, 10),
        new Circle(context, 50, 300, 50, -50, 10, 10),
        new Circle(context, 260, 50, 0, 500, 10, 10),
        new Circle(context, 250, 200, 0, -500, 20, 20),
        new Circle(context, 150, 0, 40, 100, 10, 10),
        new Circle(context, 250, 110, 50, 50, 30, 30),
        new Circle(context, 10, 95, -50, 50, 10, 10),
        new Circle(context, 40, 300, 50, -50, 10, 10),
        new Circle(context, 10, 50, 50, -50, 10, 10)
    ];
}

function clearCanvas() {
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
}

function detectCollisions() {
    let obj1, obj2;

    for(let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].isColliding = false;
    }

    for(let i = 0; i < gameObjects.length; i++) {
        obj1 = gameObjects[i];
        for(let j = i + 1;j < gameObjects.length; j++) {
            obj2 = gameObjects[j];
            if(circleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius)){
                obj1.isColliding = true;
                obj2.isColliding = true;

                //vector va cham
                vCollision = {
                    x: obj2.x - obj1.x,
                    y: obj2.y - obj1.y
                };
                //khang cach
                distance = Math.sqrt((obj1.x - obj2.x) * (obj1.x - obj2.x) + (obj1.y - obj2.y) * (obj1.y - obj2.y));
                //vector chuan hoa
                vCollisionNorm = {
                    x: vCollision.x / distance,
                    y: vCollision.y / distance
                };
                //vector van toc tuong doi
                vRelativeVelocity = {
                    x: obj1.vx - obj2.vx,
                    y: obj1.vy - obj2.vy
                };
                //toc do
                speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                
                if(speed < 0) {
                    break;
                }
                //tinh impulse (luc day)
                let impulse = 2 * speed / (obj1.mass + obj2.mass);
                obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
                obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
                obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
                obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);

            }
        }
    }
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {
    let squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);//don't use Math.sqrt help increse process speed
    return squareDistance <= (r1 + r2) * (r1 + r2);
}

function detectEdgeCollisions() {
    let obj;
    for(let i = 0; i < gameObjects.length; i++) {
        obj = gameObjects[i];

        //check for left and right
        if(obj.x < obj.radius) {
            obj.vx = Math.abs(obj.vx) * restitusion;
            obj.x = obj.radius;
        }else if(obj.x > (canvasWidth - obj.radius)) {
            obj.vx = - (Math.abs(obj.vx)) * restitusion;
            obj.x = (canvasWidth - obj.radius);
        }
        //check for bottom and top
        if(obj.y < obj.radius) {
            obj.vy = Math.abs(obj.vy) * restitusion;
            obj.y = obj.radius;
        }else if(obj.y > (canvasHeight - obj.radius)) {
            obj.vy = - (Math.abs(obj.vy)) * restitusion;
            obj.y = (canvasHeight - obj.radius)
        }
    }
}