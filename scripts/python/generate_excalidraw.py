import json
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

    def add_arrow(self, start_id, end_id, start_el, end_el):
        # Simple straight arrow for now, calculating center points
        start_x = start_el["x"] + start_el["width"] / 2
        start_y = start_el["y"] + start_el["height"] / 2
        end_x = end_el["x"] + end_el["width"] / 2
        end_y = end_el["y"] + end_el["height"] / 2

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
            "startBinding": {"elementId": start_id, "focus": 0, "gap": 1},
            "endBinding": {"elementId": end_id, "focus": 0, "gap": 1},
            "points": [[0, 0], [end_x - start_x, end_y - start_y]],
        }
        self.elements.append(arrow)
        return arrow

    def save(self, filename):
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
    generate_ds_linear()
    generate_ds_hash_collision()
    generate_ds_trees()
    generate_ds_graphs()
    generate_ds_decision_tree()
