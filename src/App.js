import React, { useState, useEffect } from 'react';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

function App() {
  const [nodesList, setNodesList] = useState(['A', 'B', 'C']);
  const [matrix, setMatrix] = useState(
    Array(3).fill().map(() => Array(3).fill(''))
  );
  const [t, setT] = useState({});
  const [startNode, setStartNode] = useState('A'); // Noeud de départ
  const [terminal, setTerminal] = useState({});

  const handleInputChange = (rowIndex, colIndex, value) => {
    const updatedMatrix = matrix.map((row, i) =>
      row.map((cell, j) => (i === rowIndex && j === colIndex ? value : cell))
    );
    setMatrix(updatedMatrix);
  };

  const addNode = () => {
    const newNode = String.fromCharCode(65 + nodesList.length); // Lettre suivante (A, B, C...)
    setNodesList([...nodesList, newNode]);
    
    // Mettre à jour la matrice avec une nouvelle ligne et une nouvelle colonne pour le nœud
    const newMatrix = matrix.map(row => [...row, '']);
    newMatrix.push(Array(nodesList.length + 1).fill(''));
    setMatrix(newMatrix);
  };

  const removeNode = () => {
    if (nodesList.length <= 1) return; // Empêcher la suppression si un seul nœud reste
    const updatedNodesList = nodesList.slice(0, -1);
    setNodesList(updatedNodesList);

    // Mettre à jour la matrice en supprimant la dernière ligne et la dernière colonne
    const newMatrix = matrix.slice(0, -1).map(row => row.slice(0, -1));
    setMatrix(newMatrix);
  };

  const generateGraph = () => {
    const nodes = nodesList.map((node, index) => ({ id: index + 1, label: node }));
    const edges = [];
    const newT = {};

    nodesList.forEach((node, rowIndex) => {
      newT[node] = [];
      nodesList.forEach((targetNode, colIndex) => {
        const weight = parseInt(matrix[rowIndex][colIndex]);
        if (!isNaN(weight) && weight > 0) {
          edges.push({
            from: rowIndex + 1,
            to: colIndex + 1,
            label: weight.toString(),
            arrows: 'to',
          });
          newT[node].push([targetNode, weight]);
        }
      });
    });

    setT(newT); // Stocker les informations dans `t`
    drawGraph(nodes, edges);
  };

  const drawGraph = (nodes, edges) => {
    const container = document.getElementById('network');
    if (!container) {
      console.error('Le conteneur du graphe est introuvable');
      return;
    }

    const data = { nodes: new DataSet(nodes), edges: new DataSet(edges) };
    const options = {
      edges: {
        font: { align: 'top' },
        color: { color: 'gray' },
        arrows: { to: { enabled: true, type: 'arrow' } },
      },
    };

    new Network(container, data, options);
  };

  const calculateShortestPath = () => {
    let s = startNode; //départ
    let terminal = {};
    let changed = [s];
    let tempchanged = [];
    let nbS = 0;

    for (const key in t) {
      terminal[key] = 'infinity';
    }

    for (const key in t) {
      if (key === s) {
        terminal[key] = 0;
      }
      nbS++;
    }

    for (let i = 0; i < nbS; i++) {
      for (const key of changed) {
        t[key].forEach(([relatedKey, value]) => {
          if (terminal[relatedKey] > value + terminal[key]) {
            terminal[relatedKey] = value + terminal[key];
            tempchanged.push(relatedKey);
          }
          if (terminal[relatedKey] === 'infinity') {
            terminal[relatedKey] = value + terminal[key];
            tempchanged.push(relatedKey);
          }
        });
      }

      changed = tempchanged;
      tempchanged = [];
      console.log(i + 1, ' changed: ', changed);

      if (i === nbS - 1 && changed.length !== 0) {
        console.log('Présence d une boucle négative!!!');
      }
    }

    console.log('terminal: ', terminal);
    setTerminal(terminal);
  };

  useEffect(() => {
    generateGraph();
  }, [nodesList, matrix]);

  return (
    <div className="App">
      <h1>Matrix Input</h1>
      <table border="1" style={{ margin: '20px auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>From/To</th>
            {nodesList.map((node) => (
              <th key={node}>{node}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nodesList.map((node, rowIndex) => (
            <tr key={node}>
              <td>{node}</td>
              {nodesList.map((_, colIndex) => (
                <td key={colIndex}>
                  {rowIndex === colIndex ? (
                    <div style={{ backgroundColor: '#ccc', width: '100%', height: '100%' }}>
                      &nbsp;
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={matrix[rowIndex][colIndex]}
                      onChange={(e) =>
                        handleInputChange(rowIndex, colIndex, e.target.value)
                      }
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addNode}>Add Node</button>
      <button onClick={removeNode} disabled={nodesList.length <= 1}>Remove Node</button>
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="startNode">Start Node:</label>
        <select
          id="startNode"
          value={startNode}
          onChange={(e) => setStartNode(e.target.value)}
        >
          {nodesList.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
        <button onClick={calculateShortestPath}>Calculate Shortest Path</button>
      </div>
      <div id="network" style={{ height: '300px', width: '100%', marginTop: '20px' }}></div>
      <pre style={{ textAlign: 'left', marginTop: '20px' }}>
        terminal = {JSON.stringify(terminal, null, 2)}
      </pre>
    </div>
  );
}

export default App;
