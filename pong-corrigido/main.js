const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
// --------------------------------------------------

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


// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

let ultimoTempo;
function drawScene(tempo){
    const dt = ultimoTempo === undefined ? 0 : Math.min((tempo - ultimoTempo) / 1000, 0.05);
    ultimoTempo = tempo;
    // Pequenos passos evitam atravessar uma barra entre dois quadros.
    const passos = Math.max(1, Math.ceil(dt / (1 / 240)));
    for (let i = 0; i < passos; i++) atualizaAnimacao(dt / passos);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
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

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
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

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
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

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

// Coordenadas WebGL: x e y variam de -1 a 1; y positivo fica acima.
const RAIO = 0.05;
const MEIA_ALTURA = 0.2;
const MEIA_LARGURA = 0.05;
const VELOCIDADE_BARRA = 1.2;
let tyBE = 0, tyBD = 0;
let txBola = 0, tyBola = 0;
let vx = 0.65, vy = 0.35; // unidades por segundo
let pontosEsquerda = 0, pontosDireita = 0;
let esperaSaque = 0.8;
const teclas = new Set();
const controles = ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'];

window.addEventListener('keydown', (event) => {
    if (controles.includes(event.code)) {
        event.preventDefault();
        teclas.add(event.code);
    }
});
window.addEventListener('keyup', (event) => {
    if (controles.includes(event.code)) event.preventDefault();
    teclas.delete(event.code);
});
window.addEventListener('blur', () => teclas.clear());
document.addEventListener('visibilitychange', () => {
    teclas.clear();
    ultimoTempo = undefined;
});

function limitarBarra(y) {
    return Math.max(-1 + MEIA_ALTURA, Math.min(1 - MEIA_ALTURA, y));
}

function reiniciarBola(direcao) {
    txBola = 0;
    tyBola = 0;
    tyBE = 0;
    tyBD = 0;
    vx = direcao * 0.65;
    vy = (Math.random() < 0.5 ? -1 : 1) * 0.35;
    esperaSaque = 0.8;
    document.getElementById('placar').textContent = pontosEsquerda + ' × ' + pontosDireita;
    atualizarMatrizes();
}

// Colisão círculo/retângulo: considera o raio e os cantos da barra.
function rebateNaBarra(x, y, direcao) {
    if (vx * direcao >= 0) return;
    const pertoX = Math.max(x - MEIA_LARGURA, Math.min(x + MEIA_LARGURA, txBola));
    const pertoY = Math.max(y - MEIA_ALTURA, Math.min(y + MEIA_ALTURA, tyBola));
    if ((txBola - pertoX) ** 2 + (tyBola - pertoY) ** 2 > RAIO ** 2) return;
    txBola = x + direcao * (MEIA_LARGURA + RAIO);
    const impacto = Math.max(-1, Math.min(1, (tyBola - y) / MEIA_ALTURA));
    const angulo = impacto * Math.PI / 3;
    const velocidade = Math.min(1.6, Math.hypot(vx, vy) * 1.04);
    vx = direcao * velocidade * Math.cos(angulo);
    vy = velocidade * Math.sin(angulo);
}

function atualizarMatrizes() {
    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);
    MbolaCentro = m3.translation(txBola, tyBola);
}

function atualizaAnimacao(dt) {
    tyBE = limitarBarra(tyBE + (Number(teclas.has('KeyW')) - Number(teclas.has('KeyS'))) * VELOCIDADE_BARRA * dt);
    tyBD = limitarBarra(tyBD + (Number(teclas.has('ArrowUp')) - Number(teclas.has('ArrowDown'))) * VELOCIDADE_BARRA * dt);
    if (esperaSaque > 0) {
        esperaSaque = Math.max(0, esperaSaque - dt);
        atualizarMatrizes();
        return;
    }
    txBola += vx * dt;
    tyBola += vy * dt;
    // Teto e chão rebatem; laterais valem gol.
    if (tyBola + RAIO >= 1 && vy > 0) {
        tyBola = 1 - RAIO;
        vy = -vy;
    } else if (tyBola - RAIO <= -1 && vy < 0) {
        tyBola = -1 + RAIO;
        vy = -vy;
    }
    rebateNaBarra(-0.9, tyBE, 1);
    rebateNaBarra(0.9, tyBD, -1);
    if (txBola - RAIO >= 1) {
        pontosEsquerda++;
        reiniciarBola(1);
    } else if (txBola + RAIO <= -1) {
        pontosDireita++;
        reiniciarBola(-1);
    }
    atualizarMatrizes();
}

document.getElementById('reiniciar').addEventListener('click', () => {
    pontosEsquerda = 0;
    pontosDireita = 0;
    teclas.clear();
    reiniciarBola(Math.random() < 0.5 ? -1 : 1);
});

requestAnimationFrame(drawScene);
