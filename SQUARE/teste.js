//import { point } from './square.js';
const n = 20;
const point = Array.from({length: n}, () => [Math.random() * 500, Math.random() * 500]);

const delaunay = d3.Delaunay.from(point);


const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

context.strokeStyle = "black";
context.beginPath();
delaunay.render(context);
context.stroke();
/*
fetch('./pontos.txt')
  .then(response => response.text())
  .then(data => {
    // Processar o conteúdo do arquivo pontos.txt
    const points = processPoints(data);

    // Resto do seu código
    const delaunay = d3.Delaunay.from(points);

    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");

    context.strokeStyle = "black";
    context.beginPath();
    delaunay.render(context);
    context.stroke();
  })
  .catch(error => {
    console.log('Erro ao carregar o arquivo pontos.txt:', error);
  });
*/
/*
function processPoints(data) {
    // Quebrar o conteúdo em linhas
    const lines = data.split('\n');
  
    // Processar cada linha para obter as coordenadas x e y
    const points = lines.map(line => {
      const match = line.match(/X: (.*), Y: (.*)/);
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      return [x, y];
    });
  
    return points;
  }
  */
