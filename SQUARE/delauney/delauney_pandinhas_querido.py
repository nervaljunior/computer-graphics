import matplotlib.pyplot as plt
import numpy as np

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Triangle:
    def __init__(self, p1, p2, p3):
        self.p1 = p1
        self.p2 = p2
        self.p3 = p3
        self.ab = None
        self.bc = None
        self.ca = None

def area(p1, p2, p3):
    return abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2.0

def inCircle(p, t):
    a = area(t.p1, t.p2, t.p3)
    a1 = area(p, t.p2, t.p3)
    a2 = area(t.p1, p, t.p3)
    a3 = area(t.p1, t.p2, p)
    return (a == a1 + a2 + a3)

def newTriangle(p1, p2, p3):
    t = Triangle(p1, p2, p3)
    t.ab = t.bc = t.ca = None
    return t

def divide(t, p):
    ab = newTriangle(t.p1, t.p2, p)
    bc = newTriangle(t.p2, t.p3, p)
    ca = newTriangle(t.p3, t.p1, p)
    t.ab = ab
    t.bc = bc
    t.ca = ca
    ab.ca = ca.bc = t.bc
    ab.bc = bc.ab = t.ab
    bc.ca = ca.ab = t.ca

def delaunay(points):
    t = newTriangle(points[0], points[1], points[2])
    for i in range(3, len(points)):
        pi = points[i]
        ab = t
        while not inCircle(pi, ab):
            if area(pi, ab.p1, ab.p2) > 0:
                ab = ab.ca
            elif area(pi, ab.p2, ab.p3) > 0:
                ab = ab.ab
            elif area(pi, ab.p3, ab.p1) > 0:
                ab = ab.bc
        divide(ab, pi)

    triangles = []
    stack = [t]
    while len(stack) > 0:
        t = stack.pop()
        if t.ab not in triangles:
            stack.append(t.ab)
        if t.bc not in triangles:
            stack.append(t.bc)
        if t.ca not in triangles:
            stack.append(t.ca)
        triangles.append(t)

    return triangles

def plotDelaunay(points, triangles):
    fig = plt.figure(figsize=(8,8))
    ax = fig.add_subplot(111)
    ax.triplot([p.x for p in points], [p.y for p in points], [[p1, p2, p3] for (p1, p2, p3) in [(points.index(t.p1), points.index(t.p2), points.index(t.p3)) for t in triangles]])
    ax.plot([p.x for p in points], [p.y for p in points], 'o')
    plt.show()
