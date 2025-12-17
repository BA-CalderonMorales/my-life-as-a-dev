# Fast & Slow Pointers - Infographics

Interactive visualizations to help you understand how the Fast & Slow Pointers pattern works under the hood.

## Available Infographics

### Cycle Detection

An interactive visualization showing how Floyd's Cycle Detection algorithm works using two pointers moving at different speeds.

<div class="infographic-container" style="margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 8px; border: 2px solid #e2e8f0;">
  <h4 style="margin-top: 0;">Interactive Demo: Cycle Detection</h4>
  <p style="margin-bottom: 15px;">This visualization shows the tortoise and hare algorithm in action. Watch how the fast pointer (hare) eventually meets the slow pointer (tortoise) when there's a cycle.</p>
  <iframe 
    src="cycle_detection.html"
    style="width: 100%; height: 700px; border: none; border-radius: 8px;"
    title="Cycle Detection Infographic"
    loading="lazy"
  ></iframe>
  <p style="margin-top: 10px; font-size: 0.9em; color: #718096;">
    <a href="cycle_detection.html" target="_blank" style="color: #4299e1; text-decoration: none;">Open in new tab</a>
  </p>
</div>

## Key Concepts Visualized

- **Slow Pointer Movement**: Moves one step at a time
- **Fast Pointer Movement**: Moves two steps at a time  
- **Cycle Detection**: When and why the pointers meet
- **No Cycle Case**: Fast pointer reaches the end

## Learning Tips

1. **Start Slow**: Use the animation speed control to slow down and see each step
2. **Toggle Cycle**: Switch between cycle and no-cycle scenarios to understand both cases
3. **Pause and Think**: Pause at any point to predict what happens next
4. **Count Steps**: Watch how many steps it takes for pointers to meet

## Related Problems

Practice these problems after understanding the visualization:

- [Linked List Cycle](../problems/linked_list_cycle.md)
- [Middle of Linked List](../problems/middle_of_linked_list.md)
- [Linked List Cycle II](../problems/linked_list_cycle_ii.md)
