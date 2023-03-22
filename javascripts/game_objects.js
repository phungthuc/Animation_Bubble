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