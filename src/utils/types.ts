export class Ball {
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
    dx: number;
    dy: number;

    constructor(
        id: number,
        x: number,
        y: number,
        radius: number,
        color: string,
        dx: number = 0,
        dy: number = 0
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update(context: CanvasRenderingContext2D) {
        this.x += this.dx;
        this.y += this.dy;

        if (
            (this.x + this.radius > context.canvas.width && this.dx > 0) ||
            (this.x - this.radius < 0 && this.dx < 0)
        ) {
            this.dx *= -0.6;
        }
        if (
            (this.y + this.radius > context.canvas.height && this.dy > 0) ||
            (this.y - this.radius < 0 && this.dy < 0)
        ) {
            this.dy *= -0.6;
        }
    }

    isPointInside(x: number, y: number): boolean {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance < this.radius;
    }
}
