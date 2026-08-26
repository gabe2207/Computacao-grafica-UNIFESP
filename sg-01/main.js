```javascript
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// ==================================================
// 1. SHADERS
// ==================================================

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}

`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// ==================================================
// 2. COMPILAR SHADERS
// ==================================================

function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
    }

    return shader;
}

const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// ==================================================
// 3. PROGRAMA
// ==================================================

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
        gl.getProgramInfoLog(program)
    );
}

gl.useProgram(program);


// ==================================================
// 4. POSIÇÕES DOS ATRIBUTOS
// ==================================================

const positionLocation =
    gl.getAttribLocation(program, "aPosition");

const colorLocation =
    gl.getAttribLocation(program, "aColor");


// ==================================================
// 5. FUNÇÃO PARA DESENHAR UMA FORMA
// ==================================================

function drawShape(vertices, colors, mode) {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );


    const colorBuffer = gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(colorLocation);

    gl.vertexAttribPointer(
        colorLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    gl.drawArrays(
        mode,
        0,
        vertices.length / 2
    );
}


// ==================================================
// 6. RETÂNGULO
// ==================================================

function rectangle(x1, y1, x2, y2, color) {

    const vertices = [
        x1, y1,
        x2, y1,
        x2, y2,

        x1, y1,
        x2, y2,
        x1, y2
    ];

    const colors = [];

    for (let i = 0; i < 6; i++) {
        colors.push(
            color[0],
            color[1],
            color[2]
        );
    }

    drawShape(
        vertices,
        colors,
        gl.TRIANGLES
    );
}


// ==================================================
// 7. TRIÂNGULO
// ==================================================

function triangle(
    x1, y1,
    x2, y2,
    x3, y3,
    color
) {

    const vertices = [
        x1, y1,
        x2, y2,
        x3, y3
    ];

    const colors = [];

    for (let i = 0; i < 3; i++) {
        colors.push(
            color[0],
            color[1],
            color[2]
        );
    }

    drawShape(
        vertices,
        colors,
        gl.TRIANGLES
    );
}


// ==================================================
// 8. CÍRCULO
// ==================================================

function circle(
    cx,
    cy,
    radius,
    color
) {

    const vertices = [];

    const colors = [];

    const segments = 40;

    for (let i = 0; i < segments; i++) {

        const a1 =
            (i / segments) * Math.PI * 2;

        const a2 =
            ((i + 1) / segments) * Math.PI * 2;

        vertices.push(
            cx,
            cy,

            cx + Math.cos(a1) * radius,
            cy + Math.sin(a1) * radius,

            cx + Math.cos(a2) * radius,
            cy + Math.sin(a2) * radius
        );

        for (let j = 0; j < 3; j++) {

            colors.push(
                color[0],
                color[1],
                color[2]
            );
        }
    }

    drawShape(
        vertices,
        colors,
        gl.TRIANGLES
    );
}


// ==================================================
// 9. FLOR
// ==================================================

function drawFlower() {

    // Título visual: Flor no lado esquerdo

    // Caule
    rectangle(
        -0.78,
        -0.80,
        -0.73,
        -0.05,
        [0.1, 0.7, 0.2]
    );

    // Folha esquerda
    triangle(
        -0.76, -0.45,
        -0.90, -0.35,
        -0.76, -0.30,
        [0.1, 0.6, 0.15]
    );

    // Folha direita
    triangle(
        -0.75, -0.58,
        -0.60, -0.48,
        -0.75, -0.43,
        [0.1, 0.6, 0.15]
    );


    // Pétalas

    circle(
        -0.73,
        0.18,
        0.16,
        [1.0, 0.2, 0.5]
    );

    circle(
        -0.55,
        0.18,
        0.16,
        [1.0, 0.3, 0.6]
    );

    circle(
        -0.64,
        0.35,
        0.16,
        [1.0, 0.2, 0.5]
    );

    circle(
        -0.64,
        0.01,
        0.16,
        [1.0, 0.3, 0.6]
    );

    circle(
        -0.80,
        0.31,
        0.15,
        [1.0, 0.2, 0.5]
    );

    circle(
        -0.48,
        0.31,
        0.15,
        [1.0, 0.3, 0.6]
    );


    // Miolo
    circle(
        -0.64,
        0.18,
        0.10,
        [1.0, 0.85, 0.0]
    );
}


// ==================================================
// 10. ROBÔ
// ==================================================

function drawRobot() {

    // Cabeça
    rectangle(
        -0.25,
        0.35,
        0.25,
        0.70,
        [0.45, 0.48, 0.52]
    );

    // Antena
    rectangle(
        -0.02,
        0.70,
        0.02,
        0.83,
        [0.4, 0.4, 0.4]
    );

    circle(
        0,
        0.86,
        0.04,
        [1.0, 0.1, 0.1]
    );


    // Olho esquerdo
    circle(
        -0.12,
        0.53,
        0.05,
        [0.0, 0.8, 1.0]
    );

    // Olho direito
    circle(
        0.12,
        0.53,
        0.05,
        [0.0, 0.8, 1.0]
    );


    // Boca
    rectangle(
        -0.12,
        0.40,
        0.12,
        0.44,
        [0.1, 0.1, 0.1]
    );


    // Corpo
    rectangle(
        -0.30,
        -0.30,
        0.30,
        0.35,
        [0.25, 0.35, 0.45]
    );


    // Botões
    circle(
        -0.10,
        0.18,
        0.035,
        [1.0, 0.0, 0.0]
    );

    circle(
        0,
        0.18,
        0.035,
        [0.0, 1.0, 0.0]
    );

    circle(
        0.10,
        0.18,
        0.035,
        [0.0, 0.5, 1.0]
    );


    // Braço esquerdo
    rectangle(
        -0.43,
        -0.20,
        -0.30,
        0.25,
        [0.45, 0.48, 0.52]
    );

    // Braço direito
    rectangle(
        0.30,
        -0.20,
        0.43,
        0.25,
        [0.45, 0.48, 0.52]
    );


    // Mão esquerda
    circle(
        -0.37,
        -0.25,
        0.07,
        [0.55, 0.58, 0.62]
    );

    // Mão direita
    circle(
        0.37,
        -0.25,
        0.07,
        [0.55, 0.58, 0.62]
    );


    // Perna esquerda
    rectangle(
        -0.22,
        -0.65,
        -0.05,
        -0.30,
        [0.35, 0.38, 0.42]
    );

    // Perna direita
    rectangle(
        0.05,
        -0.65,
        0.22,
        -0.30,
        [0.35, 0.38, 0.42]
    );


    // Pés
    rectangle(
        -0.25,
        -0.72,
        -0.02,
        -0.64,
        [0.2, 0.2, 0.22]
    );

    rectangle(
        0.02,
        -0.72,
        0.25,
        -0.64,
        [0.2, 0.2, 0.22]
    );
}


// ==================================================
// 11. CARRO
// ==================================================

function drawCar() {

    // Parte inferior da carroceria
    rectangle(
        0.45,
        -0.70,
        0.90,
        -0.35,
        [0.9, 0.1, 0.1]
    );


    // Parte superior / teto
    triangle(
        0.52, -0.35,
        0.65, -0.10,
        0.82, -0.10,
        [0.95, 0.15, 0.15]
    );

    triangle(
        0.65, -0.10,
        0.82, -0.10,
        0.88, -0.35,
        [0.95, 0.15, 0.15]
    );


    // Janela esquerda
    triangle(
        0.65, -0.30,
        0.69, -0.15,
        0.75, -0.15,
        [0.2, 0.6, 0.9]
    );


    // Janela direita
    triangle(
        0.76, -0.15,
        0.82, -0.15,
        0.85, -0.30,
        [0.2, 0.6, 0.9]
    );


    // Para-choque
    rectangle(
        0.43,
        -0.68,
        0.48,
        -0.55,
        [0.7, 0.7, 0.7]
    );

    rectangle(
        0.87,
        -0.68,
        0.92,
        -0.55,
        [0.7, 0.7, 0.7]
    );


    // Rodas
    circle(
        0.55,
        -0.70,
        0.11,
        [0.05, 0.05, 0.05]
    );

    circle(
        0.80,
        -0.70,
        0.11,
        [0.05, 0.05, 0.05]
    );


    // Miolo das rodas
    circle(
        0.55,
        -0.70,
        0.05,
        [0.65, 0.65, 0.65]
    );

    circle(
        0.80,
        -0.70,
        0.05,
        [0.65, 0.65, 0.65]
    );


    // Farol
    circle(
        0.89,
        -0.48,
        0.035,
        [1.0, 1.0, 0.3]
    );
}


// ==================================================
// 12. LIMPAR TELA
// ==================================================

gl.clearColor(
    0.08,
    0.08,
    0.12,
    1.0
);

gl.clear(
    gl.COLOR_BUFFER_BIT
);


// ==================================================
// 13. DESENHAR OS TRÊS OBJETOS
// ==================================================

drawFlower();

drawRobot();

drawCar();
```
