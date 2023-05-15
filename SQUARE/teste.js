const n = 20;
const points = Array.from({length: n}, () => [Math.random() * 500, Math.random() * 500]);

const delaunay = d3.Delaunay.from(points);


const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

context.strokeStyle = "black";
context.beginPath();
delaunay.render(context);
context.stroke();


