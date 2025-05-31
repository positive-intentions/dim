# HTML Demo Files

The HTML demo files in this directory demonstrate the Dim framework's capabilities with direct browser usage.

## Running the Demos

Due to browser security restrictions, ES modules cannot be loaded from the `file://` protocol. You need to serve the files through a web server.

### Option 1: Using npm script (recommended)
```bash
npm run serve:demos
```
Then open your browser to:
- http://localhost:8080/stories/simple-demo.html
- http://localhost:8080/stories/nested-demo.html
- http://localhost:8080/stories/test-useState.html

### Option 2: Using Python (if you have Python installed)
```bash
# Python 3
python -m http.server 8080 --directory src

# Python 2
cd src && python -m SimpleHTTPServer 8080
```

### Option 3: Using Node.js http-server
```bash
npx http-server src -p 8080 --cors
```

### Option 4: Using Live Server in VS Code
If you're using VS Code, install the "Live Server" extension and right-click on any HTML file to select "Open with Live Server".

## Demo Files

- **simple-demo.html**: Basic examples including Todo app, nested components, and toggle demos
- **nested-demo.html**: Advanced nested component examples with dynamic rendering
- **test-useState.html**: Comprehensive tests for useState hook with falsy values

## Features Demonstrated

1. **Component Composition**: Shows how to nest components within each other
2. **State Management**: Demonstrates useState hook with various data types including falsy values
3. **Props Passing**: Shows how to pass props between parent and child components
4. **Event Handling**: Demonstrates click handlers and state updates
5. **Conditional Rendering**: Shows how to conditionally render content based on state
6. **Dynamic Component Lists**: Demonstrates rendering lists of components dynamically