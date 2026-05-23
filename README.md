# Mandelbrot Set Visualizer

An interactive and high-performance Mandelbrot Set visualizer built with Vue.js and TypeScript.  
This project allows users to explore the Mandelbrot fractal in real time with smooth zooming, panning, adjustable iteration precision, and image exporting capabilities.

---

## Preview

### Repository
https://github.com/Jayant061/Mandelbrot-Set-Visualiser

### Live Demo
https://mandelbrot-set-visualizer-jt.netlify.app/

---

## Features

- Real-time Mandelbrot Set rendering
- Smooth zooming using mouse wheel
- Click-and-drag panning support
- Adjustable fractal center coordinates
- Dynamic view width control
- Configurable maximum iteration count for precision
- Export current fractal view as PNG image
- Dynamic favicon generation from live canvas render
- Responsive canvas rendering with automatic resize handling
- Optimized rendering using `requestAnimationFrame`

---

## Tech Stack

- Vue.js
- TypeScript
- HTML5 Canvas API
- Composition API
- SCSS / Scoped Styling

---

## Project Structure

```bash
src/
├── components/
│   ├── ControlPanel.vue
│   └── Playground.vue
├── composables/
│   └── useMandelBrot.ts
```

---

## Core Functionalities

### Mandelbrot Rendering
The application calculates the escape-time algorithm for each pixel and maps iteration counts to RGB color intensities for visual rendering.

### Zooming
Users can zoom in and out using the mouse wheel while preserving cursor focus for a natural exploration experience.

### Panning
Click and drag functionality enables smooth navigation across the fractal plane.

### Dynamic Precision
The maximum iteration count can be increased for sharper and more detailed fractal rendering.

### Export Snapshot
Users can export the currently rendered Mandelbrot visualization as a PNG image.

---

## Installation

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate into project directory
cd <project-folder>

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Build for Production

```bash
npm run build
```

---

## Controls

| Action | Description |
|---|---|
| Mouse Wheel | Zoom In / Out |
| Mouse Drag | Pan Across Fractal |
| Center X / Y | Change fractal center |
| View Width | Adjust visible area |
| Max Iteration Count | Increase render precision |
| Extract Image | Download current frame |

---

## Performance Optimizations

- Debounced resize handling
- Shared image buffer reuse
- `requestAnimationFrame` based rendering
- Reduced iterations during panning for smoother interaction

---

## Future Improvements

- GPU acceleration using WebGL
- Multi-threaded rendering with Web Workers
- Custom color palettes
- Minimap navigation
- Bookmarkable fractal coordinates
- Progressive rendering
- Touch gesture support for mobile devices

---

## Mathematical Formula

The Mandelbrot Set is generated using the recursive formula:

```math
z_{n+1} = z_n^2 + c
```

---

## Author

Developed by **Jayant Thakur**

---

## License

This project is licensed under the MIT License.