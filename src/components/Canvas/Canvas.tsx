import { useEffect, useRef, useState } from "react";

import { Ball } from "../../utils/types";

import "./Canvas.css";

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ballsRef = useRef<Ball[]>([]);

    const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
    const [isAddingBall, setIsAddingBall] = useState(false);
    const [newBallParams, setNewBallParams] = useState({ color: "black", size: 30 });

    const addNewBall = () => {
        const nextId = ballsRef.current.length + 1;
        const newBall = new Ball(
            nextId,
            Math.random() * (canvasRef.current?.width ?? 800),
            Math.random() * (canvasRef.current?.height ?? 600),
            newBallParams.size,
            newBallParams.color
        );
        ballsRef.current.push(newBall);
        setIsAddingBall(false);
    };

    useEffect(() => {
        if (isAddingBall) {
            document.body.style.backgroundColor = "rgb(195, 192, 192)";
        } else {
            document.body.style.backgroundColor = "";
        }

        return () => {
            document.body.style.backgroundColor = "";
        };
    }, [isAddingBall]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        ballsRef.current = [
            new Ball(1, 500, 200, 30, "red", 4, 6),
            new Ball(2, 300, 100, 40, "blue", 5),
            new Ball(2, 300, 100, 15, "green", 0, 5),
        ];

        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let draggedBall: Ball | null = null;

        const handleMouseDown = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            draggedBall = ballsRef.current.find((ball) => ball.isPointInside(x, y)) || null;
            if (draggedBall) {
                isDragging = true;
                dragStartX = x;
                dragStartY = y;
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDragging || !draggedBall) return;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            draggedBall.x = x;
            draggedBall.y = y;
        };

        const handleMouseUp = (event: MouseEvent) => {
            if (!isDragging || !draggedBall) return;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const dx = x - dragStartX;
            const dy = y - dragStartY;

            draggedBall.dx = dx * 0.1;
            draggedBall.dy = dy * 0.1;

            isDragging = false;
            draggedBall = null;
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        const checkCollisions = () => {
            for (let i = 0; i < ballsRef.current.length; i++) {
                for (let j = i + 1; j < ballsRef.current.length; j++) {
                    const ball1 = ballsRef.current[i];
                    const ball2 = ballsRef.current[j];
                    const dx = ball1.x - ball2.x;
                    const dy = ball1.y - ball2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < ball1.radius + ball2.radius) {
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);

                        ball1.x += cos * (ball1.radius + ball2.radius - distance + 1);
                        ball1.y += sin * (ball1.radius + ball2.radius - distance + 1);

                        [ball1.dx, ball2.dx] = [ball2.dx, ball1.dx];
                        [ball1.dy, ball2.dy] = [ball2.dy, ball1.dy];
                    }
                }
            }
        };

        const render = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            checkCollisions();

            ballsRef.current.forEach((ball) => {
                ball.draw(context);
                ball.update(context);
            });

            requestAnimationFrame(render);
        };

        render();

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleCanvasClick = (event: MouseEvent) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedBall = ballsRef.current.find((ball) => ball.isPointInside(x, y));
        setSelectedBall(clickedBall || null);
    };

    const changeBallColor = (color: string) => {
        if (selectedBall) {
            selectedBall.color = color;
            setSelectedBall(null);
        }
    };

    return (
        <div className="canvas-container">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={(e) => handleCanvasClick(e.nativeEvent)}
            />
            <button onClick={() => setIsAddingBall(true)}>Добавить шар</button>

            {selectedBall && (
                <div className="ball-color-picker">
                    <label htmlFor="ballColorPicker">Цвет: </label>
                    <input
                        id="ballColorPicker"
                        type="color"
                        value={selectedBall.color}
                        onChange={(e) => {
                            if (selectedBall) {
                                changeBallColor(e.target.value);
                            }
                        }}
                    />
                </div>
            )}

            {isAddingBall && (
                <div className="add-ball-popup">
                    <div>
                        <label>Цвет: </label>
                        <input
                            type="color"
                            value={newBallParams.color}
                            onChange={(e) =>
                                setNewBallParams({ ...newBallParams, color: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label>Размер: </label>
                        <input
                            type="number"
                            value={newBallParams.size}
                            onChange={(e) =>
                                setNewBallParams({
                                    ...newBallParams,
                                    size: parseInt(e.target.value, 10) || 30,
                                })
                            }
                        />
                    </div>
                    <div>
                        <button onClick={addNewBall}>OK</button>
                        <button onClick={() => setIsAddingBall(false)}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Canvas;
