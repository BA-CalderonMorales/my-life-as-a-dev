import json
import math
import os
import random
import uuid


class ExcalidrawGenerator:
    def __init__(self):
        self.elements = []
        self.font_family = (
            1  # 1: Virgil (Hand-drawn), 2: Helvetica (Normal), 3: Cascadia (Code)
        )
        self.roughness = 1  # 0: Architect, 1: Artist, 2: Cartoonist
        self.stroke_width = 1

    def add_rect(
        self, id, x, y, w, h, label, bg_color="transparent", stroke_color="#1e1e1e"
    ):
        # Rectangle
        rect = {
            "type": "rectangle",
            "version": 1,
            "versionNonce": random.randint(0, 1000000),
            "isDeleted": False,
            "id": id,
            "fillStyle": "hachure",
            "strokeWidth": self.stroke_width,
            "strokeStyle": "solid",
            "roughness": self.roughness,
            "opacity": 100,
            "angle": 0,
            "x": x,
            "y": y,
            "strokeColor": stroke_color,
            "backgroundColor": bg_color,
            "width": w,
            "height": h,
            "seed": random.randint(0, 1000000),
            "groupIds": [],
            "roundness": {"type": 3},
            "boundElements": [],
        }
        self.elements.append(rect)

        # Text Label
        text_id = f"{id}-text"
        font_size = 20
        # Rough estimation of text width/height
        text_w = len(label) * 10
        text_h = 25
        text_x = x + (w - text_w) / 2
        text_y = y + (h - text_h) / 2

        text = {
            "type": "text",
            "version": 1,
            "versionNonce": random.randint(0, 1000000),
            "isDeleted": False,
            "id": text_id,
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "angle": 0,
            "x": text_x,
            "y": text_y,
            "strokeColor": stroke_color,
            "backgroundColor": "transparent",
            "width": text_w,
            "height": text_h,
            "seed": random.randint(0, 1000000),
            "groupIds": [],
            "fontSize": font_size,
            "fontFamily": self.font_family,
            "text": label,
            "baseline": 18,
            "textAlign": "center",
            "verticalAlign": "middle",
            "containerId": id,
            "originalText": label,
        }
        self.elements.append(text)

        # Bind text to rect
        rect["boundElements"].append({"id": text_id, "type": "text"})

        return rect

    def _is_point_like(self, el):
        return el.get("width", 0) <= 1 and el.get("height", 0) <= 1

    def _center(self, el):
        if self._is_point_like(el):
            return el["x"], el["y"]
        return el["x"] + el["width"] / 2, el["y"] + el["height"] / 2

    def _rect_edge_intersection(self, src_center, dst_center, rect):
        if self._is_point_like(rect):
            return rect["x"], rect["y"]

        cx = rect["x"] + rect["width"] / 2
        cy = rect["y"] + rect["height"] / 2
        dx = dst_center[0] - src_center[0]
        dy = dst_center[1] - src_center[1]

        if abs(dx) < 1e-9 and abs(dy) < 1e-9:
            return cx, cy

        half_w = max(rect["width"] / 2, 1e-9)
        half_h = max(rect["height"] / 2, 1e-9)

        scale = 1.0 / max(abs(dx) / half_w, abs(dy) / half_h)
        return cx + dx * scale, cy + dy * scale

    def _element_exists(self, element_id):
        return any(el.get("id") == element_id for el in self.elements)

    def add_arrow(self, start_id, end_id, start_el, end_el):
        start_center = self._center(start_el)
        end_center = self._center(end_el)

        start_x, start_y = self._rect_edge_intersection(start_center, end_center, start_el)
        end_x, end_y = self._rect_edge_intersection(end_center, start_center, end_el)

        if math.hypot(end_x - start_x, end_y - start_y) < 2:
            end_x += 2
            end_y += 2

        arrow_id = str(uuid.uuid4())

        arrow = {
            "type": "arrow",
            "version": 1,
            "versionNonce": random.randint(0, 1000000),
            "isDeleted": False,
            "id": arrow_id,
            "fillStyle": "hachure",
            "strokeWidth": self.stroke_width,
            "strokeStyle": "solid",
            "roughness": self.roughness,
            "opacity": 100,
            "angle": 0,
            "x": start_x,
            "y": start_y,
            "strokeColor": "#1e1e1e",
            "backgroundColor": "transparent",
            "width": abs(end_x - start_x),
            "height": abs(end_y - start_y),
            "seed": random.randint(0, 1000000),
            "groupIds": [],
            "roundness": {"type": 2},
            "boundElements": [],
            "points": [[0, 0], [end_x - start_x, end_y - start_y]],
        }

        if self._element_exists(start_id):
            arrow["startBinding"] = {"elementId": start_id, "focus": 0, "gap": 4}
        if self._element_exists(end_id):
            arrow["endBinding"] = {"elementId": end_id, "focus": 0, "gap": 4}

        self.elements.append(arrow)
        return arrow

    def save(self, filename):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        data = {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {"viewBackgroundColor": "#ffffff", "gridSize": 20},
            "files": {},
        }
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)


def generate_docs_architecture():
    gen = ExcalidrawGenerator()

    # Nodes
    # A[Zensical]
    a = gen.add_rect("A", 400, 300, 120, 60, "Zensical", bg_color="#e0ffff")

    # B[Material Theme] - Below A
    b = gen.add_rect("B", 400, 450, 160, 60, "Material Theme")

    # C[Custom Plugins] - Right of A
    c = gen.add_rect("C", 650, 300, 160, 60, "Custom Plugins", bg_color="#fff0f5")

    # D[AI Integration] - Right/Up of C
    d = gen.add_rect("D", 900, 200, 140, 60, "AI Integration")

    # E[Versioning] - Right/Down of C
    e = gen.add_rect("E", 900, 400, 120, 60, "Versioning")

    # F[GitHub Actions] - Left of A
    f = gen.add_rect("F", 150, 300, 160, 60, "GitHub Actions", bg_color="#f0fff0")

    # G[Automated Deployment] - Left/Up of F
    g = gen.add_rect("G", -50, 200, 180, 60, "Auto Deployment")

    # H[Testing] - Left/Down of F
    h = gen.add_rect("H", -50, 400, 120, 60, "Testing")

    # Edges
    gen.add_arrow("A", "B", a, b)
    gen.add_arrow("A", "C", a, c)
    gen.add_arrow("C", "D", c, d)
    gen.add_arrow("C", "E", c, e)
    gen.add_arrow("A", "F", a, f)
    gen.add_arrow("F", "G", f, g)
    gen.add_arrow("F", "H", f, h)

    gen.save("docs/assets/images/diagrams/docs-as-code-architecture.excalidraw")


def generate_immersive_architecture():
    gen = ExcalidrawGenerator()

    # A[React]
    a = gen.add_rect("A", 400, 100, 100, 50, "React", bg_color="#e0ffff")

    # B[Three.js]
    b = gen.add_rect("B", 600, 100, 100, 50, "Three.js")

    # C[React Three Fiber]
    c = gen.add_rect("C", 500, 200, 160, 50, "React Three Fiber")

    # D[3D Rendering]
    d = gen.add_rect("D", 750, 200, 120, 50, "3D Rendering")

    # E[React Integration]
    e = gen.add_rect("E", 500, 300, 160, 50, "React Integration")

    # F[Vite]
    f = gen.add_rect("F", 200, 100, 100, 50, "Vite", bg_color="#f0fff0")

    # G[Build Tooling]
    g = gen.add_rect("G", 50, 200, 120, 50, "Build Tooling")

    # H[Hot Module Replacement]
    h = gen.add_rect("H", 250, 200, 180, 50, "HMR")

    # Edges
    gen.add_arrow("A", "B", a, b)
    gen.add_arrow("A", "C", a, c)
    gen.add_arrow("B", "D", b, d)
    gen.add_arrow("C", "E", c, e)
    gen.add_arrow("A", "F", a, f)
    gen.add_arrow("F", "G", f, g)
    gen.add_arrow("F", "H", f, h)

    gen.save("docs/assets/images/diagrams/immersive-awe-canvas-architecture.excalidraw")


def generate_shadow_scroll_architecture():
    gen = ExcalidrawGenerator()

    # A[React]
    a = gen.add_rect("A", 400, 100, 100, 50, "React", bg_color="#e0ffff")

    # B[Canvas API]
    b = gen.add_rect("B", 600, 100, 120, 50, "Canvas API")

    # C[Custom Hooks]
    c = gen.add_rect("C", 400, 200, 140, 50, "Custom Hooks")

    # D[Particle System]
    d = gen.add_rect("D", 600, 200, 140, 50, "Particle System")

    # E[State Management]
    e = gen.add_rect("E", 400, 300, 160, 50, "State Management")

    # F[Vite]
    f = gen.add_rect("F", 200, 100, 100, 50, "Vite", bg_color="#f0fff0")

    # G[Build Tooling]
    g = gen.add_rect("G", 50, 200, 120, 50, "Build Tooling")

    # H[Hot Module Replacement]
    h = gen.add_rect("H", 250, 200, 180, 50, "HMR")

    # Edges
    gen.add_arrow("A", "B", a, b)
    gen.add_arrow("A", "C", a, c)
    gen.add_arrow("B", "D", b, d)
    gen.add_arrow("C", "E", c, e)
    gen.add_arrow("A", "F", a, f)
    gen.add_arrow("F", "G", f, g)
    gen.add_arrow("F", "H", f, h)

    gen.save("docs/assets/images/diagrams/system-design/interview-framework.excalidraw")


def generate_ds_linear():
    """Generates the Linear Data Structures diagram."""
    gen = ExcalidrawGenerator()

    # Title
    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "LINEAR STRUCTURES",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Array Visualization
    # [ 1 | 2 | 3 | 4 | 5 ]
    start_x = 100
    y = 80
    cell_w = 60

    gen.add_rect(
        "ArrLabel",
        20,
        y + 10,
        80,
        30,
        "Array:",
        bg_color="transparent",
        stroke_color="transparent",
    )

    arr_rects = []
    for i in range(5):
        rect = gen.add_rect(
            f"A{i}",
            start_x + (i * cell_w),
            y,
            cell_w,
            50,
            str(i + 1),
            bg_color="#e7f5ff",
            stroke_color="#1971c2",
        )
        arr_rects.append(rect)

    # Access pointers (simulated with arrows/rects)
    # P1 -> A0
    gen.add_rect(
        "P1",
        start_x + 30,
        y + 80,
        1,
        1,
        "",
        stroke_color="transparent",
    )
    gen.add_arrow(
        "P1",
        "A0",
        {"x": start_x + 30, "y": y + 80, "width": 0, "height": 0},
        arr_rects[0],
    )
    gen.add_rect(
        "L1",
        start_x,
        y + 90,
        60,
        40,
        "O(1)\nAccess",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # P2 -> A4
    gen.add_rect(
        "P2",
        start_x + (4 * cell_w) + 30,
        y + 80,
        1,
        1,
        "",
        stroke_color="transparent",
    )
    gen.add_arrow(
        "P2",
        "A4",
        {"x": start_x + (4 * cell_w) + 30, "y": y + 80, "width": 0, "height": 0},
        arr_rects[4],
    )
    gen.add_rect(
        "L2",
        start_x + (4 * cell_w),
        y + 90,
        60,
        40,
        "O(1)\nAccess",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Linked List Visualization
    # [1]->[2]->[3]->[4]->[5]->null
    y = 200
    gen.add_rect(
        "ListLabel",
        20,
        y + 15,
        80,
        30,
        "Linked:",
        bg_color="transparent",
        stroke_color="transparent",
    )

    nodes = []
    for i in range(5):
        rect = gen.add_rect(
            f"N{i}",
            start_x + (i * 100),
            y,
            60,
            50,
            str(i + 1),
            bg_color="#e6fcf5",
            stroke_color="#0ca678",
        )
        nodes.append(rect)

    # Null node
    null_node = gen.add_rect(
        "Null",
        start_x + 500,
        y + 10,
        50,
        30,
        "null",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Arrows
    for i in range(len(nodes) - 1):
        gen.add_arrow(f"N{i}", f"N{i + 1}", nodes[i], nodes[i + 1])
    gen.add_arrow(f"N4", "Null", nodes[4], null_node)

    # Head pointer
    gen.add_rect(
        "HeadPtr",
        start_x + 30,
        y + 80,
        1,
        1,
        "",
        stroke_color="transparent",
    )
    gen.add_arrow(
        "Head",
        "N0",
        {"x": start_x + 30, "y": y + 80, "width": 0, "height": 0},
        nodes[0],
    )
    gen.add_rect(
        "HeadLabel",
        start_x,
        y + 90,
        60,
        20,
        "Head",
        bg_color="transparent",
        stroke_color="transparent",
    )

    gen.save("docs/assets/images/diagrams/data-structures/linear.excalidraw")


def generate_ds_hash_collision():
    """Generates the Hash Table Collision diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "HASH TABLE COLLISIONS (Chaining)",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Keys
    k1 = gen.add_rect(
        "K1", 50, 80, 100, 40, '"apple"', bg_color="#f8f9fa", stroke_color="#adb5bd"
    )
    k2 = gen.add_rect(
        "K2", 50, 140, 100, 40, '"banana"', bg_color="#f8f9fa", stroke_color="#adb5bd"
    )
    k3 = gen.add_rect(
        "K3", 50, 200, 100, 40, '"grape"', bg_color="#f8f9fa", stroke_color="#adb5bd"
    )

    # Hash Function Box
    hash_box = gen.add_rect(
        "Hash",
        200,
        60,
        120,
        200,
        "Hash\nFunction\n(key % 5)",
        bg_color="#e7f5ff",
        stroke_color="#1971c2",
    )

    # Buckets
    buckets_x = 400
    bucket_rects = []
    for i in range(5):
        rect = gen.add_rect(
            f"Idx{i}",
            buckets_x,
            60 + (i * 50),
            40,
            40,
            str(i),
            bg_color="#f1f3f5",
            stroke_color="#dee2e6",
        )
        bucket_rects.append(rect)

    # Values (Chained)
    # 1 -> banana
    v1 = gen.add_rect(
        "V1",
        buckets_x + 80,
        110,
        140,
        40,
        '("banana", 5)',
        bg_color="#e6fcf5",
        stroke_color="#0ca678",
    )
    gen.add_arrow("Idx1", "V1", bucket_rects[1], v1)

    # 3 -> apple -> grape
    v3a = gen.add_rect(
        "V3a",
        buckets_x + 80,
        210,
        140,
        40,
        '("apple", 2)',
        bg_color="#e6fcf5",
        stroke_color="#0ca678",
    )
    gen.add_arrow("Idx3", "V3a", bucket_rects[3], v3a)

    v3b = gen.add_rect(
        "V3b",
        buckets_x + 260,
        210,
        140,
        40,
        '("grape", 8)',
        bg_color="#ffe3e3",
        stroke_color="#e03131",
    )  # Collision color
    gen.add_arrow("V3a", "V3b", v3a, v3b)

    # Flow Arrows
    gen.add_arrow("K1", "Hash", k1, hash_box)
    gen.add_arrow("K2", "Hash", k2, hash_box)
    gen.add_arrow("K3", "Hash", k3, hash_box)

    gen.add_arrow("Hash", "Idx1", hash_box, bucket_rects[1])
    gen.add_arrow("Hash", "Idx3", hash_box, bucket_rects[3])

    gen.save("docs/assets/images/diagrams/data-structures/hash-collision.excalidraw")


def generate_ds_trees():
    """Generates the Tree Structures comparison diagram."""
    gen = ExcalidrawGenerator()

    # BST
    gen.add_rect(
        "BSTTitle",
        150,
        0,
        200,
        30,
        "Binary Search Tree",
        bg_color="transparent",
        stroke_color="transparent",
    )
    gen.add_rect(
        "BSTRule",
        150,
        30,
        200,
        20,
        "Left < Parent < Right",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # BST Nodes
    bst_nodes = {
        "8": (250, 80),
        "3": (150, 150),
        "10": (350, 150),
        "1": (100, 220),
        "6": (200, 220),
        "14": (400, 220),
        "4": (170, 290),
        "7": (230, 290),
        "13": (370, 290),
    }

    bst_rects = {}
    for val, (x, y) in bst_nodes.items():
        bst_rects[val] = gen.add_rect(
            f"B{val}",
            x,
            y,
            40,
            40,
            val,
            bg_color="#e7f5ff",
            stroke_color="#1971c2",
        )

    # BST Edges (Manual)
    edges = [
        ("8", "3"),
        ("8", "10"),
        ("3", "1"),
        ("3", "6"),
        ("10", "14"),
        ("6", "4"),
        ("6", "7"),
        ("14", "13"),
    ]
    for p, c in edges:
        gen.add_arrow(f"B{p}", f"B{c}", bst_rects[p], bst_rects[c])

    # Heap
    offset_x = 500
    gen.add_rect(
        "HeapTitle",
        offset_x + 150,
        0,
        200,
        30,
        "Min Heap",
        bg_color="transparent",
        stroke_color="transparent",
    )
    gen.add_rect(
        "HeapRule",
        offset_x + 150,
        30,
        200,
        20,
        "Parent ≤ Children",
        bg_color="transparent",
        stroke_color="transparent",
    )

    heap_nodes = {
        "1": (offset_x + 250, 80),
        "3": (offset_x + 150, 150),
        "2": (offset_x + 350, 150),
        "5": (offset_x + 100, 220),
        "4": (offset_x + 200, 220),
        "7": (offset_x + 300, 220),
        "6": (offset_x + 400, 220),
    }

    heap_rects = {}
    for val, (x, y) in heap_nodes.items():
        heap_rects[val] = gen.add_rect(
            f"H{val}",
            x,
            y,
            40,
            40,
            val,
            bg_color="#fff9db",
            stroke_color="#f59f00",
        )

    # Heap Edges
    h_edges = [
        ("1", "3"),
        ("1", "2"),
        ("3", "5"),
        ("3", "4"),
        ("2", "7"),
        ("2", "6"),
    ]
    for p, c in h_edges:
        gen.add_arrow(f"H{p}", f"H{c}", heap_rects[p], heap_rects[c])

    gen.save("docs/assets/images/diagrams/data-structures/trees.excalidraw")


def generate_ds_graphs():
    """Generates the Graph Representations diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "GRAPH REPRESENTATIONS",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Graph Visual
    # A -- B
    # |    |
    # C -- D

    gx, gy = 50, 100
    g_nodes = {
        "A": (gx, gy),
        "B": (gx + 100, gy),
        "C": (gx, gy + 100),
        "D": (gx + 100, gy + 100),
    }

    g_rects = {}
    for val, (x, y) in g_nodes.items():
        g_rects[val] = gen.add_rect(
            f"G{val}",
            x,
            y,
            40,
            40,
            val,
            bg_color="#e6fcf5",
            stroke_color="#0ca678",
        )

    # Edges
    g_edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")]
    for u, v in g_edges:
        gen.add_arrow(f"G{u}", f"G{v}", g_rects[u], g_rects[v])

    gen.add_rect(
        "GLabel",
        gx + 20,
        gy + 150,
        100,
        30,
        "Graph",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Adjacency List
    lx, ly = 300, 100
    gen.add_rect(
        "LLabel",
        lx + 50,
        ly - 30,
        150,
        30,
        "Adjacency List",
        bg_color="transparent",
        stroke_color="transparent",
    )

    adj_list = [
        ("A", "[B, C]"),
        ("B", "[A, D]"),
        ("C", "[A, D]"),
        ("D", "[B, C]"),
    ]

    for i, (node, neighbors) in enumerate(adj_list):
        gen.add_rect(
            f"L{node}",
            lx,
            ly + (i * 40),
            40,
            40,
            node,
            bg_color="#f1f3f5",
            stroke_color="#adb5bd",
        )
        gen.add_rect(
            f"Ln{node}",
            lx + 50,
            ly + (i * 40),
            120,
            40,
            neighbors,
            bg_color="#ffffff",
            stroke_color="#adb5bd",
        )

    # Adjacency Matrix
    mx, my = 550, 100
    gen.add_rect(
        "MLabel",
        mx + 70,
        my - 30,
        150,
        30,
        "Adjacency Matrix",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Matrix Header
    cols = [" ", "A", "B", "C", "D"]
    for i, col in enumerate(cols):
        gen.add_rect(
            f"MH{i}",
            mx + (i * 30),
            my,
            30,
            30,
            col,
            bg_color="#f8f9fa",
            stroke_color="#e9ecef",
        )

    matrix = [
        ["A", 0, 1, 1, 0],
        ["B", 1, 0, 0, 1],
        ["C", 1, 0, 0, 1],
        ["D", 0, 1, 1, 0],
    ]

    for r, row in enumerate(matrix):
        # Row Header
        gen.add_rect(
            f"MR{r}",
            mx,
            my + 30 + (r * 30),
            30,
            30,
            str(row[0]),
            bg_color="#f8f9fa",
            stroke_color="#e9ecef",
        )
        # Cells
        for c, val in enumerate(row[1:]):
            bg = "#e6fcf5" if val == 1 else "#ffffff"
            gen.add_rect(
                f"M{r}{c}",
                mx + 30 + (c * 30),
                my + 30 + (r * 30),
                30,
                30,
                str(val),
                bg_color=bg,
                stroke_color="#dee2e6",
            )

    gen.save("docs/assets/images/diagrams/data-structures/graphs.excalidraw")


def generate_ds_decision_tree():
    """Generates the Data Structure Decision Guide diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "DATA STRUCTURE DECISION GUIDE",
        bg_color="transparent",
        stroke_color="transparent",
    )

    decisions = [
        ("Fast lookups by key?", "HASH TABLE"),
        ("Sorted order needed?", "BST / SORTED ARRAY"),
        ("Min/Max quickly?", "HEAP"),
        ("String prefix match?", "TRIE"),
        ("LIFO (Stack)?", "STACK"),
        ("FIFO (Queue)?", "QUEUE"),
        ("Relationships?", "GRAPH"),
    ]

    start_y = 60

    for i, (q, ans) in enumerate(decisions):
        y = start_y + (i * 70)

        # Question
        gen.add_rect(
            f"Q{i}",
            50,
            y,
            300,
            40,
            q,
            bg_color="#e7f5ff",
            stroke_color="#1971c2",
        )

        # Arrow
        gen.add_rect(
            f"Arr{i}",
            350,
            y + 20,
            1,
            1,
            "",
            stroke_color="transparent",
        )
        gen.add_rect(
            f"ArrEnd{i}",
            450,
            y + 20,
            1,
            1,
            "",
            stroke_color="transparent",
        )
        # Placeholder arrow logic, assuming simple straight arrow

        # Answer
        ans_rect = gen.add_rect(
            f"A{i}",
            450,
            y,
            300,
            40,
            ans,
            bg_color="#e6fcf5",
            stroke_color="#0ca678",
        )

        # Draw arrow from Question to Answer
        # Since I don't have the rect object for Q easily (didn't store it),
        # I'll just use coordinates for the arrow manually which my generator supports
        # But wait, my generator's add_arrow expects elements.
        # I'll modify the loop to store the Q rect.
        pass  # Reworking loop below

    # Reworked loop for Decision Tree
    gen = ExcalidrawGenerator()  # Reset
    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "DATA STRUCTURE DECISION GUIDE",
        bg_color="transparent",
        stroke_color="transparent",
    )

    for i, (q, ans) in enumerate(decisions):
        y = start_y + (i * 70)
        q_rect = gen.add_rect(
            f"Q{i}", 50, y, 300, 40, q, bg_color="#e7f5ff", stroke_color="#1971c2"
        )
        a_rect = gen.add_rect(
            f"A{i}", 450, y, 300, 40, ans, bg_color="#e6fcf5", stroke_color="#0ca678"
        )
        gen.add_arrow(f"Q{i}", f"A{i}", q_rect, a_rect)

    gen.save("docs/assets/images/diagrams/data-structures/decision-guide.excalidraw")


def generate_backtracking_tree():
    """Generates the Backtracking Decision Tree diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        800,
        40,
        "BACKTRACKING DECISION TREE (Subsets of [1, 2, 3])",
        bg_color="transparent",
        stroke_color="transparent",
    )

    # Levels
    # Level 0: []
    root = gen.add_rect(
        "Root", 400, 80, 60, 40, "[]", bg_color="#e7f5ff", stroke_color="#1971c2"
    )

    # Level 1: [1], []
    l1_left = gen.add_rect(
        "L1L", 200, 180, 60, 40, "[1]", bg_color="#e6fcf5", stroke_color="#0ca678"
    )
    l1_right = gen.add_rect(
        "L1R", 600, 180, 60, 40, "[]", bg_color="#fff0f5", stroke_color="#e64980"
    )

    gen.add_arrow("Root", "L1L", root, l1_left)
    gen.add_arrow("Root", "L1R", root, l1_right)

    # Labels for edges
    gen.add_rect("Lbl1", 250, 130, 80, 20, "include 1", stroke_color="transparent")
    gen.add_rect("Lbl2", 470, 130, 80, 20, "exclude 1", stroke_color="transparent")

    # Level 2
    # From [1]: [1,2], [1]
    l2_ll = gen.add_rect(
        "L2LL", 100, 280, 60, 40, "[1,2]", bg_color="#e6fcf5", stroke_color="#0ca678"
    )
    l2_lr = gen.add_rect(
        "L2LR", 300, 280, 60, 40, "[1]", bg_color="#fff0f5", stroke_color="#e64980"
    )

    gen.add_arrow("L1L", "L2LL", l1_left, l2_ll)
    gen.add_arrow("L1L", "L2LR", l1_left, l2_lr)

    # From []: [2], []
    l2_rl = gen.add_rect(
        "L2RL", 500, 280, 60, 40, "[2]", bg_color="#e6fcf5", stroke_color="#0ca678"
    )
    l2_rr = gen.add_rect(
        "L2RR", 700, 280, 60, 40, "[]", bg_color="#fff0f5", stroke_color="#e64980"
    )

    gen.add_arrow("L1R", "L2RL", l1_right, l2_rl)
    gen.add_arrow("L1R", "L2RR", l1_right, l2_rr)

    # Level 3 (Leaves)
    leaves = [
        ("[1,2,3]", 50),
        ("[1,2]", 150),
        ("[1,3]", 250),
        ("[1]", 350),
        ("[2,3]", 450),
        ("[2]", 550),
        ("[3]", 650),
        ("[]", 750),
    ]

    parents = [l2_ll, l2_ll, l2_lr, l2_lr, l2_rl, l2_rl, l2_rr, l2_rr]

    for i, (label, x) in enumerate(leaves):
        leaf = gen.add_rect(f"Leaf{i}", x, 380, 80, 40, label)
        gen.add_arrow(f"P{i}", f"Leaf{i}", parents[i], leaf)

    # Cycle explanation
    gen.add_rect(
        "Cycle",
        200,
        450,
        400,
        40,
        "CHOOSE → EXPLORE → UNCHOOSE",
        bg_color="#f8f9fa",
        stroke_color="#adb5bd",
    )

    gen.save("docs/assets/images/diagrams/algorithms/backtracking-tree.excalidraw")


def generate_backtracking_template():
    """Generates the Backtracking Template diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        600,
        40,
        "BACKTRACKING TEMPLATE",
        bg_color="transparent",
        stroke_color="transparent",
    )

    steps = [
        ("1. BASE CASE", "If solution is complete, save it and return"),
        ("2. ITERATE CHOICES", "For each valid choice at current position:"),
        ("3. CHOOSE", "Add choice to current solution"),
        ("4. EXPLORE", "Recursively call with updated state"),
        ("5. UNCHOOSE", "Remove choice (restore state)"),
        ("6. PRUNE (Optional)", "Skip invalid paths early"),
    ]

    for i, (step, desc) in enumerate(steps):
        y = 60 + (i * 90)

        # Step Box
        gen.add_rect(
            f"Step{i}", 50, y, 200, 50, step, bg_color="#e7f5ff", stroke_color="#1971c2"
        )

        # Description Box (connected)
        gen.add_rect(
            f"Desc{i}",
            300,
            y,
            350,
            50,
            desc,
            bg_color="#f8f9fa",
            stroke_color="#dee2e6",
        )

        # Arrow connecting them
        gen.add_arrow(
            f"Step{i}",
            f"Desc{i}",
            {"x": 250, "y": y + 25, "width": 0, "height": 0},
            {"x": 300, "y": y + 25, "width": 350, "height": 50},
        )

        # Down arrow to next step (except last)
        if i < len(steps) - 1:
            gen.add_arrow(
                f"Down{i}",
                f"Step{i + 1}",
                {"x": 150, "y": y + 50, "width": 0, "height": 0},
                {"x": 150, "y": y + 90, "width": 200, "height": 50},
            )

    gen.save("docs/assets/images/diagrams/algorithms/backtracking-template.excalidraw")


def generate_backtracking_walkthrough():
    """Generates the Subsets walkthrough tree diagram."""
    gen = ExcalidrawGenerator()

    gen.add_rect(
        "Title",
        0,
        0,
        980,
        40,
        "SUBSETS WALKTHROUGH (nums = [1,2,3])",
        bg_color="transparent",
        stroke_color="transparent",
    )

    root = gen.add_rect("N0", 430, 70, 140, 44, "backtrack(0, [])", bg_color="#e7f5ff", stroke_color="#1971c2")
    n1 = gen.add_rect("N1", 180, 190, 160, 44, "backtrack(1, [1])", bg_color="#e6fcf5", stroke_color="#0ca678")
    n2 = gen.add_rect("N2", 430, 190, 160, 44, "backtrack(2, [2])", bg_color="#e6fcf5", stroke_color="#0ca678")
    n3 = gen.add_rect("N3", 680, 190, 160, 44, "backtrack(3, [3])", bg_color="#e6fcf5", stroke_color="#0ca678")

    gen.add_arrow("N0", "N1", root, n1)
    gen.add_arrow("N0", "N2", root, n2)
    gen.add_arrow("N0", "N3", root, n3)

    n11 = gen.add_rect("N11", 70, 315, 170, 44, "backtrack(2, [1,2])", bg_color="#fff4e6", stroke_color="#f08c00")
    n12 = gen.add_rect("N12", 290, 315, 170, 44, "backtrack(3, [1,3])", bg_color="#fff4e6", stroke_color="#f08c00")
    n21 = gen.add_rect("N21", 430, 315, 170, 44, "backtrack(3, [2,3])", bg_color="#fff4e6", stroke_color="#f08c00")
    n111 = gen.add_rect("N111", 70, 440, 190, 44, "backtrack(3, [1,2,3])", bg_color="#ffe3e3", stroke_color="#c92a2a")

    gen.add_arrow("N1", "N11", n1, n11)
    gen.add_arrow("N1", "N12", n1, n12)
    gen.add_arrow("N2", "N21", n2, n21)
    gen.add_arrow("N11", "N111", n11, n111)

    gen.add_rect(
        "Note",
        610,
        320,
        320,
        160,
        "Each node appends current subset\nto result.\n\nDFS order:\n[] → [1] → [1,2] → [1,2,3] → [1,3]\n→ [2] → [2,3] → [3]",
        bg_color="#f8f9fa",
        stroke_color="#adb5bd",
    )

    gen.save("docs/assets/images/diagrams/algorithms/backtracking-subsets-walkthrough.excalidraw")


def generate_algorithms_selection_guide():
    """Generates the algorithms pattern selection guide."""
    gen = ExcalidrawGenerator()

    gen.add_rect("Title", 0, 0, 1000, 40, "WHICH PATTERN SHOULD I USE?", bg_color="transparent", stroke_color="transparent")

    prompts = [
        '"Find contiguous subarray/substring..."',
        '"Find pair/triplet in sorted array..."',
        '"Detect cycle or find middle..."',
        '"How many ways..." / "Minimum/Maximum..."',
        '"Generate all combinations/permutations..."',
        '"Find minimum/maximum that satisfies..."',
        '"Find k largest/smallest..."',
        '"Next greater/smaller element..."',
        '"Shortest path" / "Connected components..."',
        '"Prefix matching" / "Autocomplete..."',
    ]
    patterns = [
        "SLIDING WINDOW",
        "TWO POINTERS",
        "FAST & SLOW POINTERS",
        "DYNAMIC PROGRAMMING",
        "BACKTRACKING",
        "BINARY SEARCH ON ANSWER",
        "HEAP / PRIORITY QUEUE",
        "MONOTONIC STACK",
        "GRAPH TRAVERSAL (BFS/DFS)",
        "TRIE",
    ]

    for i, (prompt, pattern) in enumerate(zip(prompts, patterns)):
        y = 60 + i * 70
        q = gen.add_rect(f"Q{i}", 30, y, 420, 42, prompt, bg_color="#f8f9fa", stroke_color="#868e96")
        p = gen.add_rect(f"P{i}", 610, y, 340, 42, pattern, bg_color="#e7f5ff", stroke_color="#1971c2")
        gen.add_arrow(f"Q{i}", f"P{i}", q, p)

    gen.save("docs/assets/images/diagrams/algorithms/pattern-selection-guide.excalidraw")


def generate_sliding_window_visual_explanation():
    """Generates fixed/variable sliding window visual explanation."""
    gen = ExcalidrawGenerator()

    gen.add_rect("Title", 0, 0, 1100, 40, "SLIDING WINDOW VISUAL EXPLANATION", bg_color="transparent", stroke_color="transparent")

    gen.add_rect("FixedHdr", 30, 60, 320, 36, "FIXED-SIZE WINDOW (k=3)", bg_color="#e7f5ff", stroke_color="#1971c2")
    arr = gen.add_rect("Arr", 30, 112, 700, 54, "[1 | 3 | 2 | 6 | -1 | 4 | 1 | 8 | 2]", bg_color="#f8f9fa", stroke_color="#adb5bd")

    w1 = gen.add_rect("W1", 40, 196, 220, 42, "Window 1: [1,3,2], sum=6", bg_color="#e6fcf5", stroke_color="#0ca678")
    w2 = gen.add_rect("W2", 280, 196, 230, 42, "Window 2: [3,2,6], sum=11", bg_color="#fff4e6", stroke_color="#f08c00")
    w3 = gen.add_rect("W3", 530, 196, 220, 42, "Window 3: [2,6,-1], sum=7", bg_color="#ffe3e3", stroke_color="#c92a2a")

    gen.add_arrow("Arr", "W1", arr, w1)
    gen.add_arrow("W1", "W2", w1, w2)
    gen.add_arrow("W2", "W3", w2, w3)

    gen.add_rect("VarHdr", 30, 290, 360, 36, "VARIABLE-SIZE WINDOW", bg_color="#e7f5ff", stroke_color="#1971c2")
    steps = [
        'Step 1: "a" → len=1',
        'Step 2: "ab" → len=2',
        'Step 3: "abc" → len=3 (max)',
        'Step 4: "abca" duplicate → contract to "bca"',
        'Step 5: "bcab" duplicate → contract to "cab"',
    ]

    prev = None
    for i, s in enumerate(steps):
        box = gen.add_rect(f"VS{i}", 30 + i * 210, 345, 200, 52, s, bg_color="#f8f9fa", stroke_color="#adb5bd")
        if prev is not None:
            gen.add_arrow(f"VS{i-1}", f"VS{i}", prev, box)
        prev = box

    gen.save("docs/assets/images/diagrams/algorithms/sliding-window-visual.excalidraw")


def generate_sliding_window_core_approach():
    """Generates sliding window core approach algorithm flow."""
    gen = ExcalidrawGenerator()

    gen.add_rect("Title", 0, 0, 820, 40, "SLIDING WINDOW ALGORITHM", bg_color="transparent", stroke_color="transparent")

    blocks = [
        ("S1", "1. INITIALIZE", "left=0, result, window_state", 300, 70),
        ("S2", "2. EXPAND", "Add arr[right]", 300, 165),
        ("S3", "3. CONTRACT", "While invalid: remove arr[left], left++", 300, 260),
        ("S4", "4. UPDATE RESULT", "result = best(result, window)", 300, 355),
        ("S5", "5. RETURN", "Return final result", 300, 450),
    ]

    rects = {}
    for node_id, title, desc, x, y in blocks:
        rects[node_id] = gen.add_rect(node_id, x, y, 260, 62, f"{title}\n{desc}", bg_color="#e7f5ff", stroke_color="#1971c2")

    gen.add_arrow("S1", "S2", rects["S1"], rects["S2"])
    gen.add_arrow("S2", "S3", rects["S2"], rects["S3"])
    gen.add_arrow("S3", "S4", rects["S3"], rects["S4"])
    gen.add_arrow("S4", "S5", rects["S4"], rects["S5"])
    gen.add_arrow("S3", "S2", rects["S3"], rects["S2"])

    gen.add_rect("LoopNote", 585, 255, 210, 70, "Repeat EXPAND/CONTRACT\nuntil right reaches end", bg_color="#f8f9fa", stroke_color="#adb5bd")

    gen.save("docs/assets/images/diagrams/algorithms/sliding-window-core-approach.excalidraw")


def generate_two_pointers_visual_explanation():
    """Generates two pointers visual explanation for core variations."""
    gen = ExcalidrawGenerator()

    gen.add_rect("Title", 0, 0, 1120, 40, "TWO POINTERS VISUAL EXPLANATION", bg_color="transparent", stroke_color="transparent")

    a1 = gen.add_rect("A1", 30, 70, 330, 40, "OPPOSITE ENDS", bg_color="#e7f5ff", stroke_color="#1971c2")
    a1d = gen.add_rect("A1D", 30, 120, 500, 62, "[1,2,3,4,6,8,9], target=10\nleft=1, right=9 → sum=10", bg_color="#f8f9fa", stroke_color="#adb5bd")
    gen.add_arrow("A1", "A1D", a1, a1d)

    a2 = gen.add_rect("A2", 30, 225, 330, 40, "SAME DIRECTION", bg_color="#e7f5ff", stroke_color="#1971c2")
    a2d = gen.add_rect("A2D", 30, 275, 500, 62, "[1,1,2,2,2,3]\nslow marks unique slot, fast scans", bg_color="#f8f9fa", stroke_color="#adb5bd")
    gen.add_arrow("A2", "A2D", a2, a2d)

    a3 = gen.add_rect("A3", 30, 380, 330, 40, "CONVERGING FROM ENDS", bg_color="#e7f5ff", stroke_color="#1971c2")
    a3d = gen.add_rect("A3D", 30, 430, 650, 62, "Container with Most Water: move shorter wall inward\nto seek larger min-height × width", bg_color="#f8f9fa", stroke_color="#adb5bd")
    gen.add_arrow("A3", "A3D", a3, a3d)

    gen.save("docs/assets/images/diagrams/algorithms/two-pointers-visual.excalidraw")


def generate_two_pointers_walkthrough():
    """Generates Two Sum II walkthrough state transitions."""
    gen = ExcalidrawGenerator()

    gen.add_rect("Title", 0, 0, 980, 40, "TWO SUM II WALKTHROUGH", bg_color="transparent", stroke_color="transparent")

    step1 = gen.add_rect("T1", 60, 80, 260, 64, "Step 1\nleft=0 (2), right=3 (15)\nsum=17 > 9", bg_color="#ffe3e3", stroke_color="#c92a2a")
    step2 = gen.add_rect("T2", 360, 80, 260, 64, "Step 2\nleft=0 (2), right=2 (11)\nsum=13 > 9", bg_color="#fff4e6", stroke_color="#f08c00")
    step3 = gen.add_rect("T3", 660, 80, 260, 64, "Step 3\nleft=0 (2), right=1 (7)\nsum=9 == target", bg_color="#e6fcf5", stroke_color="#0ca678")

    gen.add_arrow("T1", "T2", step1, step2)
    gen.add_arrow("T2", "T3", step2, step3)

    arr = gen.add_rect("Arr", 210, 230, 560, 62, "numbers = [2, 7, 11, 15], target = 9", bg_color="#f8f9fa", stroke_color="#adb5bd")
    res = gen.add_rect("Res", 360, 350, 260, 52, "Result: [1, 2]", bg_color="#e7f5ff", stroke_color="#1971c2")
    gen.add_arrow("T3", "Res", step3, res)
    gen.add_arrow("Arr", "T1", arr, step1)

    gen.save("docs/assets/images/diagrams/algorithms/two-pointers-walkthrough.excalidraw")


if __name__ == "__main__":
    # generate_docs_architecture()
    # generate_immersive_architecture()
    # generate_shadow_scroll_architecture()
    # generate_rust_terminal_architecture()
    # generate_mvvm_architecture()
    # generate_chat_data_flow()
    # generate_interview_pipeline()
    # generate_problem_solving_framework()
    # generate_time_allocation()
    # generate_practice_routine()
    # generate_system_design_pillars()
    # generate_cap_theorem()
    # generate_latency_comparison()
    # generate_system_design_interview()
    # generate_ds_linear()
    # generate_ds_hash_collision()
    # generate_ds_trees()
    # generate_ds_graphs()
    # generate_ds_decision_tree()
    generate_backtracking_tree()
    generate_backtracking_template()
    generate_backtracking_walkthrough()
    generate_algorithms_selection_guide()
    generate_sliding_window_visual_explanation()
    generate_sliding_window_core_approach()
    generate_two_pointers_visual_explanation()
    generate_two_pointers_walkthrough()
