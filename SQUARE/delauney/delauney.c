#include <stdio.h>
#include <stdlib.h>
#include <math.h>


typedef struct point {
  double x;
  double y;
} Point;


typedef struct triangle {
  Point p1;
  Point p2;
  Point p3;
  struct triangle *ab;
  struct triangle *bc;
  struct triangle *ca;
} Triangle;


double area(Point p1, Point p2, Point p3) {
  return fabs((p2.x - p1.x)*(p3.y - p1.y) - (p3.x - p1.x)*(p2.y - p1.y)) / 2.0;
}


int inCircle(Point p, Triangle t) {
  double a = area(t.p1, t.p2, t.p3);
  double a1 = area(p, t.p2, t.p3);
  double a2 = area(t.p1, p, t.p3);
  double a3 = area(t.p1, t.p2, p);
  return (a == a1 + a2 + a3);
}


Triangle *newTriangle(Point *p1, Point *p2, Point *p3) {
    Triangle *t = (Triangle *)malloc(sizeof(Triangle));
    t->p1 = *p1;
    t->p2 = *p2;
    t->p3 = *p3;
    t->ab = t->bc = t->ca = NULL;
    return t;
}

void freeTriangle(Triangle *t) {
  if (t->ab != NULL) freeTriangle(t->ab);
  if (t->bc != NULL) freeTriangle(t->bc);
  if (t->ca != NULL) freeTriangle(t->ca);
  free(t);
}

void divide(Triangle *t, Point p) {
  
  Triangle *ab = newTriangle(&(t->p1), &(t->p2), &p);
  Triangle *bc = newTriangle(&(t->p2), &(t->p3), &p);
  Triangle *ca = newTriangle(&(t->p3), &(t->p1), &p);
  
  t->ab = ab;
  t->bc = bc;
  t->ca = ca;
  
  ab->ca = ca->bc = t->bc;
  ab->bc = bc->ab = t->ab;
  bc->ca = ca->ab = t->ca;
}


void pmim(Point *p, int n) {
  
    Triangle *t = newTriangle(&p[0], &p[1], &p[2]);
    // Adicionar cada ponto um por um
    for (int i = 3; i < n; i++) {
        Point *pi = &p[i];
        Triangle *ab = t;
        
        while (!inCircle(*pi, *ab)) {
            if (area(*pi, ab->p1, ab->p2) > 0) {
                ab = ab->ca;
            } else if (area(*pi, ab->p2, ab->p3) > 0) {
                ab = ab->ab;
            } else if (area(*pi, ab->p3, ab->p1) > 0) {
                ab = ab->bc;
            }
        }
        
        divide(ab, *pi);
        
        Triangle *triList[3] = {ab->ab, ab->bc, ab->ca};
        int triListSize = 3;
        while (triListSize > 0) {
            Triangle *bc = triList[--triListSize];
            if (inCircle(*pi, *bc)) {
                triList[triListSize++] = bc->ab;
                triList[triListSize++] = bc->bc;
                triList[triListSize++] = bc->ca;
            } else {
              
printf("(%f,%f) (%f,%f) (%f,%f)\n", bc->p1.x, bc->p1.y, bc->p2.x, bc->p2.y, bc->p3.x, bc->p3.y);            }
        }
    }
}
