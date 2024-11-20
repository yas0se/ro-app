/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-loop-func */
import React, { useState, useEffect } from 'react';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

function App() {
  const [nodesList, setNodesList] = useState(['A', 'B', 'C']);
  const [matrix, setMatrix] = useState(
    Array(3).fill().map(() => Array(3).fill(''))
  );
  const [t, setT] = useState({});
  const [startNode, setStartNode] = useState('A'); // Noeud de départ
  const [terminalHistory, setTerminalHistory] = useState([]); // Historique des terminaux

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
        if (!isNaN(weight) && weight !== 0) {
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
    let history = [];
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
      history.push({ step: i + 1, terminal: { ...terminal } });

      if (i === nbS - 1 && changed.length !== 0) {
        alert("Présence d'une boucle négative!!!");
        terminal={};
      }
    }

    setTerminalHistory(history);
    
  };

  useEffect(() => {
    generateGraph();
  }, [nodesList, matrix]);

  return (
<div className="App p-6">
  <h1 className="text-2xl font-bold text-center mb-4">Matrix Input</h1>
  <table className="table-auto border-collapse border border-gray-300 mx-auto mb-6">
    <thead>
      <tr>
        <th className="border border-gray-300 px-4 py-2 bg-gray-100">From/To</th>
        {nodesList.map((node) => (
          <th key={node} className="border border-gray-300 px-4 py-2 bg-gray-100">
            {node}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {nodesList.map((node, rowIndex) => (
        <tr key={node}>
          <td className="border border-gray-300 px-4 py-2">{node}{' --->'}</td>
          {nodesList.map((_, colIndex) => (
            <td key={colIndex} className="border border-gray-300 px-2 py-2">
              {rowIndex === colIndex ? (
                <div className="bg-gray-300 w-full h-full">&nbsp;</div>
              ) : (
                <input
                  type="number"
                  value={matrix[rowIndex][colIndex]}
                  onChange={(e) =>
                    handleInputChange(rowIndex, colIndex, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
  <div className="flex justify-center gap-4 mb-6">
    <button
      onClick={addNode}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Add Node
    </button>
    <button
      onClick={removeNode}
      disabled={nodesList.length <= 1}
      className={`${
        nodesList.length <= 1
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-red-500 text-white hover:bg-red-600'
      } px-4 py-2 rounded`}
    >
      Remove Node
    </button>
  </div>
  <div className="mb-6">
    <label htmlFor="startNode" className="block text-sm font-medium mb-2">
      Start Node:
    </label>
    <div className="flex gap-4">
      <select
        id="startNode"
        value={startNode}
        onChange={(e) => setStartNode(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full"
      >
        {nodesList.map((node) => (
          <option key={node} value={node}>
            {node}
          </option>
        ))}
      </select>
      <button
        onClick={calculateShortestPath}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Calculate Shortest Path
      </button>
    </div>
  </div>
  <div id="network" className="h-72 w-full border border-gray-300 mb-6"></div>
  <div className="overflow-x-auto">
    <table className="table-auto border-collapse border border-gray-300 mx-auto mb-6">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2 bg-gray-100">Step</th>
          {nodesList.map((node) => (
            <th key={node} className="border border-gray-300 px-4 py-2 bg-gray-100">
              {node}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {terminalHistory.map((historyStep, index) => (
          <tr key={index}>
            <td className="border border-gray-300 px-4 py-2">{historyStep.step}</td>
            {nodesList.map((node) => (
              <td key={node} className="border border-gray-300 px-4 py-2">
                {historyStep.terminal[node] || 'infinity'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

  );
}

export default App;
