// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.gl = gl;
        this.program = program;

        this.renderer =
            new Renderer(gl, program);

        // Partes do helicóptero
        this.helicopterBody =
            new HelicopterBody();

        this.helicopterTopShaft =
            new HelicopterTopShaft();

        this.helicopterTail =
            new HelicopterTail();

        this.helicopterPropellers =
            new HelicopterPropellers();

        this.helicopterTailPropeller =
            new HelicopterTailPropeller();


        // ==================================================
        // POSIÇÃO DO HELICÓPTERO
        // ==================================================

        this.x = -0.2;
        this.y = 0.0;

        // Velocidade de deslocamento
        this.speed = 0.015;


        // ==================================================
        // ROTAÇÃO DAS HÉLICES
        // ==================================================

        this.topPropellerAngle = 0.0;
        this.tailPropellerAngle = 0.0;

        this.propellerSpeed = 0.15;


        // ==================================================
        // CONTROLE DO TECLADO
        // ==================================================

        this.keys = {};

        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "ArrowUp" ||
                    event.key === "ArrowDown" ||
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowRight"
                ) {
                    event.preventDefault();
                }

                this.keys[event.key] = true;
            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.key] = false;
            }
        );
    }


    // ==================================================
    // MOVIMENTAÇÃO
    // ==================================================

    updateMovement() {

        if (this.keys["ArrowUp"]) {
            this.y += this.speed;
        }

        if (this.keys["ArrowDown"]) {
            this.y -= this.speed;
        }

        if (this.keys["ArrowLeft"]) {
            this.x -= this.speed;
        }

        if (this.keys["ArrowRight"]) {
            this.x += this.speed;
        }


        // ==================================================
        // LIMITES DA TELA
        // ==================================================

        const minX = -0.9;
        const maxX = 0.2;

        const minY = -0.5;
        const maxY = 0.5;

        this.x = Math.max(
            minX,
            Math.min(maxX, this.x)
        );

        this.y = Math.max(
            minY,
            Math.min(maxY, this.y)
        );
    }


    // ==================================================
    // UPDATE
    // ==================================================

    update() {

        // Atualiza posição pelas setas
        this.updateMovement();


        // ==================================================
        // GIRAR AS HÉLICES CONTINUAMENTE
        // ==================================================

        this.topPropellerAngle +=
            this.propellerSpeed;

        this.tailPropellerAngle +=
            this.propellerSpeed;


        // ==================================================
        // TRANSLAÇÃO DO HELICÓPTERO
        // ==================================================

        const translation =
            m4.translation(
                this.x,
                this.y,
                0
            );


        // ==================================================
        // CORPO
        // ==================================================

        this.helicopterBody.update(
            translation
        );


        // ==================================================
        // HASTE SUPERIOR
        // ==================================================

        this.helicopterTopShaft.update(
            translation
        );


        // ==================================================
        // CAUDA
        // ==================================================

        this.helicopterTail.update(
            translation
        );


        // ==================================================
        // HÉLICE SUPERIOR
        //
        // A hélice está centrada em X = 0 e Z = 0.
        // Portanto pode girar diretamente no eixo Y.
        // ==================================================

        const topRotation =
            m4.yRotation(
                this.topPropellerAngle
            );

        const topTransform =
            m4.multiply(
                translation,
                topRotation
            );

        this.helicopterPropellers.update(
            topTransform
        );


        // ==================================================
        // HÉLICE DA CAUDA
        //
        // Centro aproximado:
        //
        // X = 0.7
        // Y = 0
        //
        // Precisamos:
        //
        // 1 - mover o centro para a origem
        // 2 - rotacionar
        // 3 - devolver para a posição original
        // 4 - aplicar o movimento do helicóptero
        //
        // T(global) * T(centro) * R * T(-centro)
        // ==================================================

        const tailCenterX = 0.7;
        const tailCenterY = 0.0;


        const moveToOrigin =
            m4.translation(
                -tailCenterX,
                -tailCenterY,
                0
            );

        const tailRotation =
            m4.zRotation(
                this.tailPropellerAngle
            );

        const moveBack =
            m4.translation(
                tailCenterX,
                tailCenterY,
                0
            );


        let tailTransform =
            m4.multiply(
                tailRotation,
                moveToOrigin
            );

        tailTransform =
            m4.multiply(
                moveBack,
                tailTransform
            );

        tailTransform =
            m4.multiply(
                translation,
                tailTransform
            );


        this.helicopterTailPropeller.update(
            tailTransform
        );
    }


    // ==================================================
    // DRAW
    // ==================================================

    draw() {

        this.gl.clear(
            this.gl.COLOR_BUFFER_BIT |
            this.gl.DEPTH_BUFFER_BIT
        );

        this.gl.useProgram(
            this.program
        );


        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }


    // ==================================================
    // LOOP
    // ==================================================

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }


    // ==================================================
    // INIT
    // ==================================================

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}