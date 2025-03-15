
import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: 'home',
    data: { label: 'Home Screen' },
    position: { x: 250, y: 0 },
    style: { backgroundColor: '#f0f9ff', borderColor: '#60a5fa', width: 180 }
  },
  {
    id: 'create',
    data: { label: 'Create Label' },
    position: { x: 50, y: 150 },
    style: { backgroundColor: '#f0fdf4', borderColor: '#86efac', width: 180 }
  },
  {
    id: 'scan',
    data: { label: 'Scan Label' },
    position: { x: 250, y: 150 },
    style: { backgroundColor: '#fef2f2', borderColor: '#fca5a5', width: 180 }
  },
  {
    id: 'labels',
    data: { label: 'My Labels' },
    position: { x: 450, y: 150 },
    style: { backgroundColor: '#f5f3ff', borderColor: '#c4b5fd', width: 180 }
  },
  {
    id: 'created-success',
    data: { label: 'Label Created Success' },
    position: { x: 50, y: 300 },
    style: { backgroundColor: '#f0fdf4', borderColor: '#86efac', width: 180 }
  },
  {
    id: 'scan-result',
    data: { label: 'Label Scan Result' },
    position: { x: 250, y: 300 },
    style: { backgroundColor: '#fef2f2', borderColor: '#fca5a5', width: 180 }
  },
  {
    id: 'label-detail',
    data: { label: 'Label Detail/QR' },
    position: { x: 450, y: 300 },
    style: { backgroundColor: '#f5f3ff', borderColor: '#c4b5fd', width: 180 }
  }
];

const initialEdges = [
  {
    id: 'home-to-create',
    source: 'home',
    target: 'create',
    animated: true,
    style: { stroke: '#60a5fa' }
  },
  {
    id: 'home-to-scan',
    source: 'home',
    target: 'scan',
    animated: true,
    style: { stroke: '#60a5fa' }
  },
  {
    id: 'home-to-labels',
    source: 'home',
    target: 'labels',
    animated: true,
    style: { stroke: '#60a5fa' }
  },
  {
    id: 'create-to-success',
    source: 'create',
    target: 'created-success',
    style: { stroke: '#86efac' }
  },
  {
    id: 'scan-to-result',
    source: 'scan',
    target: 'scan-result',
    style: { stroke: '#fca5a5' }
  },
  {
    id: 'labels-to-detail',
    source: 'labels',
    target: 'label-detail',
    style: { stroke: '#c4b5fd' }
  },
  {
    id: 'success-to-labels',
    source: 'created-success',
    target: 'labels',
    style: { stroke: '#86efac' }
  }
];

const AppFlowChart: React.FC = () => {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background color="#f0f0f0" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default AppFlowChart;
