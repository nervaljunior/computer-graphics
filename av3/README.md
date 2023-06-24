# computer-graphics
# implementação de computação grafica 
### avaliação 3 computação grafica 


O sombreamento Gouraud ( Gouraud sombreamento em Inglês ) é uma técnica de renderização 3D inventado por Henri Gouraud . Antes limitado ao mundo da computação gráfica , o sombreamento Gouraud agora é usado por todas as placas 3D no mercado.

Esta técnica marca um grande avanço em relação ao sombreamento plano usado anteriormente. Com o sombreamento plano, as facetas dos objetos 3D ainda são muito visíveis. O sombreamento de Gouraud consiste em interpolar linearmente a luminosidade entre os três vértices de um triângulo . Aplicado a cada vértice, este sombreamento mais realista suavizará os ângulos, especialmente porque está na origem de um gradiente de intensidade. Como toda técnica que trabalha com intensidade de luz, é possível combinar o sombreamento de Gouraud com uma textura modulando o valor dos texels .

Ao contrário do sombreamento plano que, como o nome sugere, produz a mesma intensidade de luz para todo o rosto, o sombreamento de Gouraud interpola linearmente a intensidade da luz pixel por pixel na superfície no espaço da tela 2D. O método mais comum é preencher o polígono linha por linha. Sendo a interpolação linear e a superfície considerada plana, a diferença de intensidade de um pixel para outro é constante na mesma face.

A interpolação linear nem sempre é satisfatória, no entanto. Existe um efeito chamado de bandas de Mach , uma ilusão de ótica causada por diferenças de contraste que tendem a acentuar os rostos. O sombreamento de Gouraud também não é capaz de representar corretamente a luz especular . Uma fonte de luz cuja projeção na face está próxima ao centro não pode ser totalmente considerada por este modelo. Como o sombreamento de Gouraud interpola a partir dos vértices, a intensidade no centro dependerá deles, o que é uma aproximação grosseira da realidade.

Por razões estéticas, o sombreamento de Gouraud agora é superado por uma de suas melhorias, o sombreamento de Phong , por um custo muito maior em tempo de computação.

# Gouraud-Shading-and-Phong-Shading #

Neste projeto implementei Gouraud Shading e Phong Shading no Phong Reflection Model.
## Introduction: ##
Antes de falar sobre Gouraud Shading e Phong Shading, precisamos primeiro conhecer o modelo de reflexão. O modelo de reflexão "padrão" em computação gráfica que compromete entre resultados aceitáveis ​​e custo de processamento é o modelo Phong. O modelo Phong descreve a interação da luz com uma superfície, em termos das propriedades da superfície e da natureza da luz incidente. O modelo de reflexão é o fator básico na aparência de um objeto sombreado tridimensional. Ele permite que uma projeção de tela bidimensional de um objeto pareça real. O modelo Phong refletiu a luz em termos de um componente difuso e especular junto com um termo ambiente. A intensidade de um ponto em uma superfície é considerada a combinação linear desses três componentes.

**(1) Diffuse Reflection:**

![Imagem do WhatsApp de 2023-06-24 à(s) 14 47 55](https://github.com/nervaljunior/computer-graphics/assets/108685222/1c350160-253e-4e00-be31-0fcfd0939f89)


**(2) Ambient Light:**

![Imagem do WhatsApp de 2023-06-24 à(s) 14 47 39](https://github.com/nervaljunior/computer-graphics/assets/108685222/0b9a2721-f4cc-4b7f-b714-fcb11ec2567e)


**(3)Specular Reflection:**

![Imagem do WhatsApp de 2023-06-24 à(s) 15 31 19](https://github.com/nervaljunior/computer-graphics/assets/108685222/01c3f9d4-6a46-40cc-aa50-40be707122b2)


**(4)Put all together:**

![Imagem do WhatsApp de 2023-06-24 à(s) 14 47 27](https://github.com/nervaljunior/computer-graphics/assets/108685222/ad7d01af-e930-4a45-8810-a64386961417)

Depois de conhecer o modelo Phong, vamos agora falar sobre a diferença entre Gouraud Shading e Phong Shading. O método Gouraud Shading aplica o modelo Phong em um subconjunto de pontos da superfície e interpola a intensidade dos pontos restantes na superfície. No caso de uma malha poligonal, o modelo de iluminação é geralmente aplicado em cada vértice e as cores no interior dos triângulos são linearmente interpoladas a partir desses valores de vértice durante a rasterização do polígono.

Ao contrário do sombreamento Gouraud, que interpola cores em polígonos, no sombreamento Phong um vetor normal é linearmente interpolado através da superfície do polígono a partir dos vértices normais do polígono. A superfície normal é interpolada e normalizada em cada pixel e então usada em um modelo de reflexão, por exemplo, o modelo de reflexão Phong, para obter a cor final do pixel. O sombreamento Phong é computacionalmente mais caro do que o sombreamento Gouraud, pois o modelo de reflexão deve ser calculado em cada pixel em vez de em cada vértice.

## Detalhes do implemento: ##

O sombreamento Gouraud (também conhecido como Smooth Shading) é um cálculo de cor por vértice. Isso significa que o vertex shader deve determinar uma cor para cada vértice e passar a cor como uma variável de saída para o fragment shader. Uma vez que esta cor é passada para o sombreador de fragmento como uma variável variável, ela é interpolada entre os fragmentos, dando assim um sombreamento suave. Aqui está uma ilustração do Sombreamento Gouraud:

![Imagem do WhatsApp de 2023-06-24 à(s) 14 46 52](https://github.com/nervaljunior/computer-graphics/assets/108685222/516538f6-7504-4875-8fbf-991498c7e0c1)

The Gouraud Shading vertex shader:

    out vec3 vertex_color;
	void main(){
	vec3 v = vec3(gl_ModelViewMatrix * gl_Vertex);
   	vec3 N = normalize(gl_NormalMatrix * gl_Normal);
   
   	vec3 L = normalize(gl_LightSource[0].position.xyz - v);   
   	vec3 E = normalize(-v);       // we are in Eye Coordinates, so EyePos is (0,0,0)  
   	vec3 R = normalize(-reflect(L,N));  
 
   	//calculate Ambient Term:  
   	vec4 Iamb = gl_FrontLightProduct[0].ambient;    

   	//calculate Diffuse Term:  
   	vec4 Idiff = gl_FrontLightProduct[0].diffuse * max(dot(N,L), 0.0);    
   
   	// calculate Specular Term:
   	vec4 Ispec = gl_FrontLightProduct[0].specular 
                * pow(max(dot(R,E),0.0),0.3*gl_FrontMaterial.shininess);
 
   	vertex_color = gl_FrontLightModelProduct.sceneColor + Iamb + Idiff + Ispec; 
   
   	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	}
The fragment shader:
    
	in vec3 vertex_color;   

	void main (void)  
	{    
  	 gl_FragColor = vertex_color;   
	}

Em contraste, o sombreamento Phong é um cálculo de cor por fragmento. O sombreador de vértice fornece os dados normais e de posição como variáveis ​​de saída para o sombreador de fragmento. O fragment shader então interpola essas variáveis ​​e calcula a cor. Aqui está uma ilustração do Phong Shading:

![Imagem do WhatsApp de 2023-06-24 à(s) 14 47 06](https://github.com/nervaljunior/computer-graphics/assets/108685222/3aad57cf-8def-453a-a002-999b9553baa1)


The Phong Shading vertex shader:

	varying vec3 N;
	varying vec3 v;

	void main(void)
	{

   	v = vec3(gl_ModelViewMatrix * gl_Vertex);       
  	N = normalize(gl_NormalMatrix * gl_Normal);

   	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	}

The Phong Shading fragment shader:

	varying vec3 N;
	varying vec3 v;    

	void main (void)  
	{  
   	vec3 L = normalize(gl_LightSource[0].position.xyz - v);   
   	vec3 E = normalize(-v);       // we are in Eye Coordinates, so EyePos is (0,0,0)  
   	vec3 R = normalize(-reflect(L,N));  
 
   	//calculate Ambient Term:  
   	vec4 Iamb = gl_FrontLightProduct[0].ambient;    

   	//calculate Diffuse Term:  
   	vec4 Idiff = gl_FrontLightProduct[0].diffuse * max(dot(N,L), 0.0);    
   
   	// calculate Specular Term:
   	vec4 Ispec = gl_FrontLightProduct[0].specular 
                * pow(max(dot(R,E),0.0),0.3*gl_FrontMaterial.shininess);

   	// write Total Color:  
   	gl_FragColor = gl_FrontLightModelProduct.sceneColor + Iamb + Idiff + Ispec;   
	}

##  display: ##

Gouraud Shading:


Phong Shading:



