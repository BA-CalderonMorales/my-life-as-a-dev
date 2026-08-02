import re

with open('/mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev/site/assets/css/life-tree.css', 'r') as f:
    content = f.read()

old = '''@media (prefers-reduced-motion: reduce) {
    [data-life-index] .life-tree__breeze {
        animation: none !important;
        transform: none !important;
    }

    [data-life-index] .life-tree__pixels rect {
        animation: none !important;
    }

    [data-life-index] .life-tree__branch-hit,
    [data-life-index] [data-tree-node] {
        transition: none;
    }
}'''

new = '''@media (prefers-reduced-motion: reduce) {
    [data-life-index] .life-tree__breeze {
        animation: none !important;
        transform: none !important;
    }

    [data-life-index] .life-tree__roots,
    [data-life-index] .life-tree__roots path {
        animation: none !important;
        transform: none !important;
    }

    [data-life-index] .life-tree__pixels rect {
        animation: none !important;
    }

    [data-life-index] .life-tree__branch-hit,
    [data-life-index] [data-tree-node] {
        transition: none;
    }
}'''

content = content.replace(old, new)

with open('/mnt/c/Users/bacm6/world/repositories/working/my-life-as-a-dev/site/assets/css/life-tree.css', 'w') as f:
    f.write(content)

print('Done')