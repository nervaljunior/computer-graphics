import math

def delaunay_triangulation(P):
    # Passo 1: Criar um triângulo inicial que contém todos os pontos
    xmin, ymin = float('inf'), float('inf')
    xmax, ymax = float('-inf'), float('-inf')
    for p in P:
        if p[0] < xmin:
            xmin = p[0]
        if p[0] > xmax:
            xmax = p[0]
        if p[1] < ymin:
            ymin = p[1]
        if p[1] > ymax:
            ymax = p[1]
    dx = xmax - xmin
    dy = ymax - ymin
    dmax = max(dx, dy)
    xmid = (xmin + xmax) / 2
    ymid = (ymin + ymax) / 2
    p1 = (xmid - 2 * dmax, ymid - dmax)
    p2 = (xmid, ymid + 2 * dmax)
    p3 = (xmid + 2 * dmax, ymid - dmax)
    T = [(p1, p2, p3)]

    # Passo 2: Adicionar cada ponto um por um
    for pi in P:
        edges = []
        # Passo 3: Encontrar o triângulo que contém o ponto pi
        for t in T:
            if point_in_triangle(pi, t):
                # Passo 4: Verificar a condição de Delaunay para cada triângulo ao redor de pi
                for i, edge in enumerate(edges):
                    tk, e = edge
                    if circum_circle_contains_point(pi, tk):
                        # Remova Tk de T
                        del T[T.index(tk)]
                        # Adicione as novas arestas formadas por Tk e pi a uma lista L
                        edges.pop(i)
                        edges.extend([(t, (e[1], pi)), (tk, (pi, e[0]))])
                edges.extend([(t, (t[0], pi)), (t, (t[1], pi)), (t, (t[2], pi))])
        # Passo 5: Adicionar novos triângulos à triangulação
        for e in edges:
            T.append((e[0][0], e[0][1], e[1]))
        # Passo 6: Limpar a lista de arestas
        edges.clear()

    # Passo 7: Remover triângulos do triângulo inicial
    i = 0
    while i < len(T):
        t = T[i]
        if any(p in t for p in [p1, p2, p3]):
            del T[i]
        else:
            i += 1

    return T


def point_in_triangle(p, t):

    a, b, c = t
    denom = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if denom == 0:
        return False

    alpha = ((b[1] - c[1]) * (p[0] - c[0]) + (c[0] - b[0]) * (p[1] - c[1])) / denom
    beta = ((c[1] - a[1]) * (p[0] - c[0]) + (a[0] - c[0]) * (p[1] - c[1])) / denom
    gamma = 1 - alpha - beta

    return alpha >= 0 and beta >= 0 and gamma >= 0

