# computer-graphics
# implementação de computação grafica 
### avaliação 3 computação grafica 


O sombreamento Gouraud ( Gouraud sombreamento em Inglês ) é uma técnica de renderização 3D inventado por Henri Gouraud . Antes limitado ao mundo da computação gráfica , o sombreamento Gouraud agora é usado por todas as placas 3D no mercado.

Esta técnica marca um grande avanço em relação ao sombreamento plano usado anteriormente. Com o sombreamento plano, as facetas dos objetos 3D ainda são muito visíveis. O sombreamento de Gouraud consiste em interpolar linearmente a luminosidade entre os três vértices de um triângulo . Aplicado a cada vértice, este sombreamento mais realista suavizará os ângulos, especialmente porque está na origem de um gradiente de intensidade. Como toda técnica que trabalha com intensidade de luz, é possível combinar o sombreamento de Gouraud com uma textura modulando o valor dos texels .

Ao contrário do sombreamento plano que, como o nome sugere, produz a mesma intensidade de luz para todo o rosto, o sombreamento de Gouraud interpola linearmente a intensidade da luz pixel por pixel na superfície no espaço da tela 2D. O método mais comum é preencher o polígono linha por linha. Sendo a interpolação linear e a superfície considerada plana, a diferença de intensidade de um pixel para outro é constante na mesma face.

A interpolação linear nem sempre é satisfatória, no entanto. Existe um efeito chamado de bandas de Mach , uma ilusão de ótica causada por diferenças de contraste que tendem a acentuar os rostos. O sombreamento de Gouraud também não é capaz de representar corretamente a luz especular . Uma fonte de luz cuja projeção na face está próxima ao centro não pode ser totalmente considerada por este modelo. Como o sombreamento de Gouraud interpola a partir dos vértices, a intensidade no centro dependerá deles, o que é uma aproximação grosseira da realidade.

Por razões estéticas, o sombreamento de Gouraud agora é superado por uma de suas melhorias, o sombreamento de Phong , por um custo muito maior em tempo de computação.