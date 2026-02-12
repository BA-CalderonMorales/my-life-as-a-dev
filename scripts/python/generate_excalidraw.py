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

    gen.save(
        "docs/assets/images/diagrams/shadow-scroll-blossom-architecture.excalidraw"
    )


def generate_rust_terminal_architecture():
    gen = ExcalidrawGenerator()

    # A[React Frontend]
    a = gen.add_rect("A", 100, 200, 140, 60, "React Frontend", bg_color="#e0ffff")

    # B[WebAssembly]
    b = gen.add_rect("B", 350, 200, 140, 60, "WebAssembly")

    # C[Rust Terminal Engine]
    c = gen.add_rect("C", 600, 200, 180, 60, "Rust Terminal Engine", bg_color="#ffdab9")

    # D[WebSocket Server]
    d = gen.add_rect("D", 350, 400, 160, 60, "WebSocket Server", bg_color="#e6e6fa")

    # E[Backend Services]
    e = gen.add_rect("E", 600, 400, 160, 60, "Backend Services")

    # Edges
    gen.add_arrow("A", "B", a, b)
    gen.add_arrow("B", "C", b, c)
    gen.add_arrow("A", "D", a, d)

    # C <--> D
    gen.add_arrow("C", "D", c, d)  # Representing double arrow with one for now

    gen.add_arrow("D", "E", d, e)

    gen.save("docs/assets/images/diagrams/rust-terminal-forge-architecture.excalidraw")


def generate_mvvm_architecture():
    gen = ExcalidrawGenerator()

    # View (view.js)
    view = gen.add_rect(
        "View",
        400,
        100,
        300,
        150,
        "View (view.js)\n- Creates DOM elements\n- Binds event listeners\n- Updates UI based on VM\n- 'Dumb' - no business logic",
        bg_color="#e0ffff",
    )

    # ViewModel (view-model.js)
    vm = gen.add_rect(
        "ViewModel",
        400,
        350,
        300,
        150,
        "ViewModel (view-model.js)\n- Handles user actions\n- Orchestrates API calls\n- Updates Model state\n- Notifies View of changes",
        bg_color="#fff0f5",
    )

    # Model (model.js)
    model = gen.add_rect(
        "Model",
        400,
        600,
        300,
        120,
        "Model (model.js)\n- Holds application state\n- Messages array, loading flag\n- No UI logic, no API calls",
        bg_color="#f0fff0",
    )

    # Edges
    # View -> ViewModel (Events / Callbacks)
    gen.add_arrow("View", "ViewModel", view, vm)

    # ViewModel -> Model (State Changes)
    gen.add_arrow("ViewModel", "Model", vm, model)

    gen.save("docs/assets/images/diagrams/chat-widget-mvvm.excalidraw")


def generate_chat_data_flow():
    gen = ExcalidrawGenerator()

    # User clicks send
    user = gen.add_rect(
        "User", 400, 50, 150, 50, "User clicks send", bg_color="#f0f8ff"
    )

    # View.onSend()
    view_send = gen.add_rect(
        "ViewSend",
        400,
        150,
        200,
        60,
        "View.onSend()\nCaptures input",
        bg_color="#e0ffff",
    )

    # ViewModel.handleSend
    vm_send = gen.add_rect(
        "VMSend",
        400,
        250,
        250,
        60,
        "ViewModel.handleSend\nValidates, rate limits",
        bg_color="#fff0f5",
    )

    # Model.addMessage()
    model_add = gen.add_rect(
        "ModelAdd",
        200,
        350,
        200,
        60,
        "Model.addMessage()\nUpdates state",
        bg_color="#f0fff0",
    )

    # View.addMessage()
    view_add = gen.add_rect(
        "ViewAdd",
        600,
        350,
        200,
        60,
        "View.addMessage()\nUpdates UI",
        bg_color="#e0ffff",
    )

    # ChatAPI.send
    api_send = gen.add_rect(
        "APISend", 400, 450, 200, 60, "ChatAPI.send\nHTTP POST", bg_color="#ffe4e1"
    )

    # Response received
    response = gen.add_rect(
        "Response", 400, 550, 200, 60, "Response received", bg_color="#fffacd"
    )

    # Model.addMessage (Response)
    model_res = gen.add_rect(
        "ModelRes",
        200,
        650,
        200,
        60,
        "Model.addMessage()\nStore response",
        bg_color="#f0fff0",
    )

    # View.addMessage (Response)
    view_res = gen.add_rect(
        "ViewRes",
        600,
        650,
        200,
        60,
        "View.addMessage()\nDisplay response",
        bg_color="#e0ffff",
    )

    # Edges
    gen.add_arrow("User", "ViewSend", user, view_send)
    gen.add_arrow("ViewSend", "VMSend", view_send, vm_send)
    gen.add_arrow("VMSend", "ModelAdd", vm_send, model_add)
    gen.add_arrow("VMSend", "ViewAdd", vm_send, view_add)
    gen.add_arrow("VMSend", "APISend", vm_send, api_send)
    gen.add_arrow("APISend", "Response", api_send, response)
    gen.add_arrow("Response", "ModelRes", response, model_res)
    gen.add_arrow("Response", "ViewRes", response, view_res)

    gen.save("docs/assets/images/diagrams/chat-widget-data-flow.excalidraw")


if __name__ == "__main__":
    generate_docs_architecture()
    generate_immersive_architecture()
    generate_shadow_scroll_architecture()
    generate_rust_terminal_architecture()
    generate_mvvm_architecture()
    generate_chat_data_flow()
