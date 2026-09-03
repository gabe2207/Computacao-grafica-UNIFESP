#include <GL/glut.h>
#include <cstdlib>

const int LARGURA = 800;
const int ALTURA = 600;


// ----------------------------------------------------
// Estrutura para armazenar um ponto
// ----------------------------------------------------
struct Ponto
{
    int x;
    int y;
};


// Pontos usados
Ponto pontos[3];

// Número de cliques realizados
int numeroCliques = 0;

// 'r' = reta
// 't' = triângulo
char modo = 'r';

// Cor inicial azul
float r = 0.0f;
float g = 0.0f;
float b = 1.0f;


// ----------------------------------------------------
// FUNÇÃO 1 - DESENHAR RETA COM BRESENHAM
// ----------------------------------------------------
void desenharReta(int x1, int y1, int x2, int y2)
{
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);

    int sx;

    if (x1 < x2)
        sx = 1;
    else
        sx = -1;

    int sy;

    if (y1 < y2)
        sy = 1;
    else
        sy = -1;

    int erro = dx - dy;

    glBegin(GL_POINTS);

    while (true)
    {
        glVertex2i(x1, y1);

        if (x1 == x2 && y1 == y2)
            break;

        int erro2 = 2 * erro;

        if (erro2 > -dy)
        {
            erro = erro - dy;
            x1 = x1 + sx;
        }

        if (erro2 < dx)
        {
            erro = erro + dx;
            y1 = y1 + sy;
        }
    }

    glEnd();
}


// ----------------------------------------------------
// FUNÇÃO 2 - ALTERAR COR
// ----------------------------------------------------
void mudarCor(unsigned char tecla)
{
    switch (tecla)
    {
        case '0':
            r = 0;
            g = 0;
            b = 0;
            break;

        case '1':
            r = 1;
            g = 0;
            b = 0;
            break;

        case '2':
            r = 0;
            g = 1;
            b = 0;
            break;

        case '3':
            r = 0;
            g = 0;
            b = 1;
            break;

        case '4':
            r = 1;
            g = 1;
            b = 0;
            break;

        case '5':
            r = 1;
            g = 0;
            b = 1;
            break;

        case '6':
            r = 0;
            g = 1;
            b = 1;
            break;

        case '7':
            r = 1;
            g = 0.5;
            b = 0;
            break;

        case '8':
            r = 0.5;
            g = 0;
            b = 1;
            break;

        case '9':
            r = 1;
            g = 1;
            b = 1;
            break;
    }

    glutPostRedisplay();
}


// ----------------------------------------------------
// FUNÇÃO 3 - DESENHAR TRIÂNGULO
// ----------------------------------------------------
void desenharTriangulo(
    Ponto p1,
    Ponto p2,
    Ponto p3)
{
    // Lado 1
    desenharReta(
        p1.x, p1.y,
        p2.x, p2.y
    );

    // Lado 2
    desenharReta(
        p2.x, p2.y,
        p3.x, p3.y
    );

    // Lado 3
    desenharReta(
        p3.x, p3.y,
        p1.x, p1.y
    );
}


// ----------------------------------------------------
// DESENHAR TELA
// ----------------------------------------------------
void display()
{
    // Apaga a figura anterior
    glClear(GL_COLOR_BUFFER_BIT);

    glColor3f(r, g, b);

    if (modo == 'r')
    {
        // Se já temos 2 pontos, desenhamos a reta
        if (numeroCliques >= 2)
        {
            desenharReta(
                pontos[0].x,
                pontos[0].y,

                pontos[1].x,
                pontos[1].y
            );
        }
        else if (numeroCliques == 1)
        {
            // Exibe somente o primeiro pixel enquanto
            // aguarda o segundo clique
            desenharReta(
                pontos[0].x,
                pontos[0].y,
                pontos[0].x,
                pontos[0].y
            );
        }
    }

    else if (modo == 't')
    {
        if (numeroCliques >= 3)
        {
            desenharTriangulo(
                pontos[0],
                pontos[1],
                pontos[2]
            );
        }
        else if (numeroCliques == 2)
        {
            // Enquanto aguarda terceiro vértice,
            // podemos mostrar a primeira aresta
            desenharReta(
                pontos[0].x,
                pontos[0].y,
                pontos[1].x,
                pontos[1].y
            );
        }
        else if (numeroCliques == 1)
        {
            desenharReta(
                pontos[0].x,
                pontos[0].y,
                pontos[0].x,
                pontos[0].y
            );
        }
    }

    glFlush();
}


// ----------------------------------------------------
// MOUSE
// ----------------------------------------------------
void mouse(int botao, int estado, int x, int y)
{
    if (botao == GLUT_LEFT_BUTTON &&
        estado == GLUT_DOWN)
    {
        // Converte coordenada Y do mouse
        y = ALTURA - y;

        if (modo == 'r')
        {
            // Se a reta anterior já foi concluída,
            // começa uma nova.
            if (numeroCliques >= 2)
                numeroCliques = 0;

            pontos[numeroCliques].x = x;
            pontos[numeroCliques].y = y;

            numeroCliques++;
        }

        else if (modo == 't')
        {
            // Se o triângulo anterior terminou,
            // começa outro.
            if (numeroCliques >= 3)
                numeroCliques = 0;

            pontos[numeroCliques].x = x;
            pontos[numeroCliques].y = y;

            numeroCliques++;
        }

        glutPostRedisplay();
    }
}


// ----------------------------------------------------
// TECLADO
// ----------------------------------------------------
void teclado(unsigned char tecla, int x, int y)
{
    // Mudar para modo reta
    if (tecla == 'r' || tecla == 'R')
    {
        modo = 'r';

        // reta inicial (0,0)-(0,0)
        pontos[0].x = 0;
        pontos[0].y = 0;

        pontos[1].x = 0;
        pontos[1].y = 0;

        numeroCliques = 2;
    }

    // Mudar para modo triângulo
    else if (tecla == 't' || tecla == 'T')
    {
        modo = 't';

        numeroCliques = 0;
    }

    // Alteração da cor
    else if (tecla >= '0' && tecla <= '9')
    {
        mudarCor(tecla);
    }

    // ESC encerra
    else if (tecla == 27)
    {
        exit(0);
    }

    glutPostRedisplay();
}


// ----------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------
void inicializar()
{
    // Fundo cinza
    glClearColor(
        0.5,
        0.5,
        0.5,
        1.0
    );

    glPointSize(2.0);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    gluOrtho2D(
        0,
        LARGURA,
        0,
        ALTURA
    );

    // Figura inicial exigida no exercício
    pontos[0].x = 0;
    pontos[0].y = 0;

    pontos[1].x = 0;
    pontos[1].y = 0;

    numeroCliques = 2;
}


// ----------------------------------------------------
// MAIN
// ----------------------------------------------------
int main(int argc, char** argv)
{
    glutInit(&argc, argv);

    glutInitDisplayMode(
        GLUT_SINGLE | GLUT_RGB
    );

    glutInitWindowSize(
        LARGURA,
        ALTURA
    );

    glutCreateWindow(
        "Exercicio 2 - Bresenham"
    );

    inicializar();

    glutDisplayFunc(display);

    glutMouseFunc(mouse);

    glutKeyboardFunc(teclado);

    glutMainLoop();

    return 0;
}