class Graph {
    constructor() {
        this.cy = null;
    }

    render(data) {
        document.querySelector('[data-target="graph-view"]').click(); 

        const list = [];
        data.tasks.forEach(task => {
            list.push({ data: { id: task.id, label: task.title } });
        });

        data.tasks.forEach(task => {
            if (task.dependencies) {
                task.dependencies.forEach(dep => {
                    list.push({ data: { source: dep, target: task.id } });
                });
            }
        });

        this.cy = cytoscape({
            container: document.getElementById('cy-canvas'),
            elements: list,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#00f0ff',
                        'label': 'data(label)',
                        'color': '#fff',
                        'text-valign': 'top',
                        'font-family': 'Courier New',
                        'font-size': '12px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': 'rgba(0, 240, 255, 0.4)',
                        'target-arrow-color': 'rgba(0, 240, 255, 0.4)',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
            layout: { name: 'breadthfirst', directed: true, padding: 30 }
        });
    }
}
window.GraphEngine = new Graph();