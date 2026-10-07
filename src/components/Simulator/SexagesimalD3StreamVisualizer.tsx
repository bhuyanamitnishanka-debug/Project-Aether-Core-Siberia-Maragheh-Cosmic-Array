import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import * as d3Drag from 'd3-drag';
import { StreamPacketPoint, FiberRoutingNode } from '../../types';
import { sound } from '../../utils/audioEngine';
import { SEXAGESIMAL_GLYPHS } from '../../utils/sexagesimal';
import {
  Activity,
  Zap,
  Radio,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Flame,
  Move,
  RotateCcw,
  Navigation,
  Globe2,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

// Compute real-time algebraic flow coefficients for each node along the fiber line
function computeAlgebraicFlow(nodes: FiberRoutingNode[]): FiberRoutingNode[] {
  return nodes.map((node, i) => {
    const prev = nodes[Math.max(0, i - 1)];
    const next = nodes[Math.min(nodes.length - 1, i + 1)];

    // Tangent trajectory vector
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const tangentRad = Math.atan2(dy, dx);
    const tangentDeg = Math.round((tangentRad * 180) / Math.PI);

    // Curvature calculation (dot product between incoming and outgoing segment unit vectors)
    let curvature = 0;
    if (i > 0 && i < nodes.length - 1) {
      const vInX = node.x - prev.x;
      const vInY = node.y - prev.y;
      const vOutX = next.x - node.x;
      const vOutY = next.y - node.y;

      const lenIn = Math.sqrt(vInX * vInX + vInY * vInY) || 1;
      const lenOut = Math.sqrt(vOutX * vOutX + vOutY * vOutY) || 1;

      const dot = (vInX * vOutX + vInY * vOutY) / (lenIn * lenOut);
      // Curvature index: 0 for straight line, up to 1.5 for severe bend
      curvature = Number(Math.max(0, (1.0 - dot) * 1.2).toFixed(3));
    }

    // Al-Khwarizmi Algebraic Flow Coefficient alpha_k:
    // Flow is maximized (1.0) along gentle geodesic curves with high repeater gain
    const gainBonus = (node.repeaterGainDb - 20) * 0.005;
    const curvaturePenalty = curvature * 0.28;
    const alpha = Number(Math.max(0.18, Math.min(1.0, 0.98 - curvaturePenalty + gainBonus)).toFixed(3));

    // Al-Jabr balancing weight: rounded token contribution mod 60
    const alJabrW = Math.round(alpha * 59);

    return {
      ...node,
      algebraicFlowCoeff: alpha,
      tangentAngleDeg: tangentDeg,
      curvatureIndex: curvature,
      alJabrWeight: alJabrW,
    };
  });
}

// Default initial nodes across Central Asian fiber line
const RAW_INITIAL_NODES: Omit<FiberRoutingNode, 'algebraicFlowCoeff' | 'tangentAngleDeg' | 'curvatureIndex' | 'alJabrWeight'>[] = [
  {
    id: 'baikal',
    name: 'Lake Baikal Core',
    region: 'Siberian Cryo-Grid',
    type: 'ORIGIN',
    x: 60,
    y: 70,
    originalX: 60,
    originalY: 70,
    latitude: 51.78,
    longitude: 104.38,
    distanceKm: 0,
    repeaterGainDb: 32,
    noiseFigureDb: 1.2,
    temperatureK: 77,
    isActive: true,
  },
  {
    id: 'novosibirsk',
    name: 'Novosibirsk Cryo-Terminal',
    region: 'Western Siberia',
    type: 'AMPLIFIER',
    x: 130,
    y: 110,
    originalX: 130,
    originalY: 110,
    latitude: 55.03,
    longitude: 82.92,
    distanceKm: 1420,
    repeaterGainDb: 28,
    noiseFigureDb: 1.4,
    temperatureK: 85,
    isActive: true,
  },
  {
    id: 'altay',
    name: 'Altay Quantum Ore Ridge',
    region: 'Siberian Mountains',
    type: 'MINING_BYPASS',
    x: 190,
    y: 165,
    originalX: 190,
    originalY: 165,
    latitude: 50.52,
    longitude: 86.21,
    distanceKm: 2150,
    repeaterGainDb: 34,
    noiseFigureDb: 1.1,
    temperatureK: 72,
    isActive: true,
  },
  {
    id: 'astana',
    name: 'Astana Quantum Repeater',
    region: 'Northern Steppes (Kazakhstan)',
    type: 'REPEATER',
    x: 260,
    y: 120,
    originalX: 260,
    originalY: 120,
    latitude: 51.16,
    longitude: 71.43,
    distanceKm: 2980,
    repeaterGainDb: 26,
    noiseFigureDb: 1.5,
    temperatureK: 95,
    isActive: true,
  },
  {
    id: 'balkhash',
    name: 'Balkhash Laser Gateway',
    region: 'Central Steppes',
    type: 'AMPLIFIER',
    x: 340,
    y: 155,
    originalX: 340,
    originalY: 155,
    latitude: 46.84,
    longitude: 74.98,
    distanceKm: 3620,
    repeaterGainDb: 28,
    noiseFigureDb: 1.3,
    temperatureK: 110,
    isActive: true,
  },
  {
    id: 'samarkand',
    name: 'Samarkand Silk Road Hub',
    region: 'Ancient Corridor (Uzbekistan)',
    type: 'REPEATER',
    x: 410,
    y: 190,
    originalX: 410,
    originalY: 190,
    latitude: 39.65,
    longitude: 66.97,
    distanceKm: 4280,
    repeaterGainDb: 30,
    noiseFigureDb: 1.2,
    temperatureK: 120,
    isActive: true,
  },
  {
    id: 'ashgabat',
    name: 'Ashgabat Optical Conduit',
    region: 'Kopet Dag Foothills',
    type: 'REPEATER',
    x: 480,
    y: 220,
    originalX: 480,
    originalY: 220,
    latitude: 37.95,
    longitude: 58.38,
    distanceKm: 4710,
    repeaterGainDb: 24,
    noiseFigureDb: 1.6,
    temperatureK: 135,
    isActive: true,
  },
  {
    id: 'takht',
    name: 'Takht-e Soleyman Crypt Relay',
    region: 'Sasanian Crypt Node (Iran)',
    type: 'CRYPT_RELAY',
    x: 540,
    y: 250,
    originalX: 540,
    originalY: 250,
    latitude: 36.61,
    longitude: 47.23,
    distanceKm: 5040,
    repeaterGainDb: 36,
    noiseFigureDb: 0.9,
    temperatureK: 65,
    isActive: true,
  },
  {
    id: 'maragheh',
    name: 'Maragheh Observatory Hub',
    region: 'East Azerbaijan Plateau (Iran)',
    type: 'DESTINATION',
    x: 620,
    y: 280,
    originalX: 620,
    originalY: 280,
    latitude: 37.39,
    longitude: 46.20,
    distanceKm: 5210,
    repeaterGainDb: 35,
    noiseFigureDb: 0.8,
    temperatureK: 77,
    isActive: true,
  },
];

const INITIAL_FIBER_NODES: FiberRoutingNode[] = computeAlgebraicFlow(
  RAW_INITIAL_NODES.map((n) => ({
    ...n,
    algebraicFlowCoeff: 0.95,
    tangentAngleDeg: 28,
    curvatureIndex: 0.05,
    alJabrWeight: 57,
  }))
);

export const SexagesimalD3StreamVisualizer: React.FC = () => {
  // Navigation tabs inside D3 visualizer
  const [activeD3Tab, setActiveD3Tab] = useState<'ROUTING_MAP' | 'TIMELINE' | 'POLAR_SCATTER'>('ROUTING_MAP');

  // Streaming telemetry state
  const [streamData, setStreamData] = useState<StreamPacketPoint[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sampleRateHz, setSampleRateHz] = useState<number>(30);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'VECTORS' | 'CHECKSUM'>('ALL');
  const [turbulenceActive, setTurbulenceActive] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<StreamPacketPoint | null>(null);

  // Interactive Central Asian Fiber Routing State
  const [routingNodes, setRoutingNodes] = useState<FiberRoutingNode[]>(INITIAL_FIBER_NODES);
  const [selectedNode, setSelectedNode] = useState<FiberRoutingNode | null>(null);
  const [activePreset, setActivePreset] = useState<string>('DEFAULT');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Dragging & Animation Lifecycle Refs for D3
  const isDraggingRef = useRef<boolean>(false);
  const routingNodesRef = useRef<FiberRoutingNode[]>(routingNodes);
  routingNodesRef.current = routingNodes;
  const rafIdRef = useRef<number | null>(null);
  const particleTimersRef = useRef<d3.Timer[]>([]);

  // SVG Refs for D3
  const routingSvgRef = useRef<SVGSVGElement | null>(null);
  const timelineSvgRef = useRef<SVGSVGElement | null>(null);
  const polarSvgRef = useRef<SVGSVGElement | null>(null);
  const packetCountRef = useRef<number>(0);
  const streamDataRef = useRef<StreamPacketPoint[]>([]);

  // Dynamically computed route telemetry & system-wide algebraic flow index
  const routeTelemetry = useMemo(() => {
    let totalDist = 0;
    for (let i = 1; i < routingNodes.length; i++) {
      const p1 = routingNodes[i - 1];
      const p2 = routingNodes[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segDist = Math.sqrt(dx * dx + dy * dy) * 8.4;
      totalDist += segDist;
    }
    const distRounded = Math.round(totalDist);
    const latencyMs = Number(((totalDist / 200000) * 1000).toFixed(2));

    // System-wide Algebraic Flow Coherence Index (mean alpha_k across all nodes)
    const avgFlowAlpha = routingNodes.reduce((acc, n) => acc + n.algebraicFlowCoeff, 0) / routingNodes.length;
    const flowCoherencePct = Number((avgFlowAlpha * 100).toFixed(1));

    // Modulo-60 Algebraic Flow Sum
    const sumAlJabrWeights = routingNodes.reduce((acc, n) => acc + n.alJabrWeight, 0);
    const flowModuloCongruence = sumAlJabrWeights % 60;
    const isFlowCongruent = flowModuloCongruence === 0;

    // Curvature tension & jitter
    const totalCurvature = routingNodes.reduce((acc, n) => acc + n.curvatureIndex, 0);
    const jitterUs = Number((0.8 + totalCurvature * 1.5 + (turbulenceActive ? 6.5 : 0)).toFixed(2));

    // Total optical loss (dB)
    const totalGain = routingNodes.reduce((acc, n) => acc + n.repeaterGainDb, 0);
    const lossDbm = Number(Math.max(1.5, totalDist * 0.046 - totalGain * 0.72 + (turbulenceActive ? 4.5 : 0)).toFixed(1));

    let qual = Math.round(flowCoherencePct - jitterUs * 1.8 - lossDbm * 1.2);
    if (!isFlowCongruent) qual -= 15;
    qual = Math.max(20, Math.min(100, qual));

    return {
      totalDistanceKm: distRounded,
      latencyMs,
      jitterUs,
      lossDbm,
      qualityScore: qual,
      avgFlowAlpha: Number(avgFlowAlpha.toFixed(3)),
      flowCoherencePct,
      sumAlJabrWeights,
      flowModuloCongruence,
      isFlowCongruent,
    };
  }, [routingNodes, turbulenceActive]);

  // Aggregate metrics
  const [metrics, setMetrics] = useState({
    avgQuality: 98.4,
    congruenceRate: 99.8,
    avgJitterUs: 1.2,
    avgSnrDb: 34.2,
    packetsReceived: 0,
    statusText: 'NOMINAL COHERENCE',
  });

  useEffect(() => {
    streamDataRef.current = streamData;
  }, [streamData]);

  // Real-time packet generator loop
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = Math.round(1000 / sampleRateHz);
    const timer = setInterval(() => {
      packetCountRef.current += 1;
      const count = packetCountRef.current;
      const t = Date.now() / 1000;

      const header = 59;
      const epoch = Math.floor((t * 2) % 60);

      const baseAzimuth = (Math.sin(t * 0.8) * 20 + 30) % 60;
      const baseElevation = (Math.cos(t * 0.5) * 15 + 25) % 60;

      const noiseAmplitude = turbulenceActive ? 8.5 : 0.4;
      const azimuth = Math.max(0, Math.min(59, Math.round(baseAzimuth + (Math.random() - 0.5) * noiseAmplitude)));
      const elevation = Math.max(0, Math.min(59, Math.round(baseElevation + (Math.random() - 0.5) * noiseAmplitude)));

      const energy = Math.max(0, Math.min(59, Math.round(28 + Math.sin(t * 1.5) * 12 + (turbulenceActive ? Math.random() * 10 : 0))));

      const partial = header + epoch + azimuth + elevation + energy;
      let checksum = (60 - (partial % 60)) % 60;

      let isCongruent = true;
      if (turbulenceActive && Math.random() < 0.25) {
        checksum = (checksum + Math.floor(Math.random() * 5) + 1) % 60;
        isCongruent = false;
      }

      const rawSum = partial + checksum;
      if (rawSum % 60 !== 0) isCongruent = false;

      const jitter = Number((routeTelemetry.jitterUs + (Math.random() * 0.3 - 0.15)).toFixed(2));
      const lossDbm = routeTelemetry.lossDbm;
      const snr = turbulenceActive ? Number((22.0 - Math.random() * 8).toFixed(1)) : Number((36.5 + Math.random() * 2).toFixed(1));

      let quality = routeTelemetry.qualityScore;
      if (!isCongruent) quality = Math.max(10, quality - 30);

      const thetaRad = (azimuth / 60) * Math.PI * 2;
      const tusiDisplacement = 2 * 60 * Math.cos(thetaRad);

      const newPoint: StreamPacketPoint = {
        id: count,
        timestamp: Date.now(),
        token0: header,
        token1: epoch,
        token2: azimuth,
        token3: elevation,
        token4: energy,
        token5: checksum,
        rawSum,
        isCongruent,
        transmissionQuality: quality,
        fiberJitterUs: jitter,
        fiberLossDbm: lossDbm,
        snrDb: snr,
        tusiThetaRad: thetaRad,
        tusiDisplacement,
      };

      setStreamData((prev) => {
        const next = [...prev, newPoint];
        return next.length > 45 ? next.slice(next.length - 45) : next;
      });

      if (count % 5 === 0) {
        const recents = streamDataRef.current.slice(-15);
        if (recents.length > 0) {
          const avgQ = recents.reduce((acc, p) => acc + p.transmissionQuality, 0) / recents.length;
          const congRate = (recents.filter((p) => p.isCongruent).length / recents.length) * 100;
          const avgJ = recents.reduce((acc, p) => acc + p.fiberJitterUs, 0) / recents.length;
          const avgS = recents.reduce((acc, p) => acc + p.snrDb, 0) / recents.length;

          setMetrics({
            avgQuality: Number(avgQ.toFixed(1)),
            congruenceRate: Number(congRate.toFixed(1)),
            avgJitterUs: Number(avgJ.toFixed(2)),
            avgSnrDb: Number(avgS.toFixed(1)),
            packetsReceived: count,
            statusText:
              avgQ > 90
                ? 'NOMINAL COHERENCE'
                : avgQ > 75
                ? 'FIBER DISPERSION DETECTED'
                : 'CRITICAL TURBULENCE',
          });
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, sampleRateHz, turbulenceActive, routeTelemetry]);

  // -------------------------------------------------------------------------
  // D3 Render Effect: Enhanced Click-and-Drag Central Asian Fiber Routing
  // with Real-time Algebraic Flow Coefficients & Dynamic Vector Fields
  // -------------------------------------------------------------------------
  useEffect(() => {
    // If user is actively dragging a node, do not tear down the SVG DOM!
    if (isDraggingRef.current) return;

    const svgEl = routingSvgRef.current;
    if (!svgEl) return;

    // Clean up any previously active particle timers
    particleTimersRef.current.forEach((t) => t.stop());
    particleTimersRef.current = [];

    const width = svgEl.clientWidth || 720;
    const height = 360;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'flowFiberGlow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers for algebraic flow vectors (cyan, amber, rose)
    const createMarker = (id: string, color: string) => {
      defs
        .append('marker')
        .attr('id', id)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '8')
        .attr('refY', '5')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 1 L 10 5 L 0 9 z')
        .attr('fill', color);
    };
    createMarker('vectorArrowCyan', '#38bdf8');
    createMarker('vectorArrowAmber', '#f59e0b');
    createMarker('vectorArrowRose', '#f43f5e');

    // Background Topographic Grid
    for (let x = 0; x < width; x += 36) {
      g.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', '#0d1829')
        .attr('stroke-width', 1);
    }
    for (let y = 0; y < height; y += 36) {
      g.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', '#0d1829')
        .attr('stroke-width', 1);
    }

    // Mountain relief contours (representing Central Asian mountain belts)
    g.append('path')
      .attr('d', `M 0 100 Q 180 50 360 80 T 720 120 L 720 360 L 0 360 Z`)
      .attr('fill', '#050c18')
      .attr('opacity', 0.6);

    // Coordinate scale mappings (unscaled 700x320 -> current width/height)
    const scaleX = (val: number) => (val / 700) * (width - 60) + 30;
    const scaleY = (val: number) => (val / 320) * (height - 60) + 30;
    const invertX = (px: number) => ((px - 30) / (width - 60)) * 700;
    const invertY = (py: number) => ((py - 30) / (height - 60)) * 320;

    // Draw Geodesic Baseline Chord (direct shortest theoretical line between Baikal and Maragheh)
    const pOrigin = [scaleX(routingNodes[0].x), scaleY(routingNodes[0].y)];
    const pDest = [scaleX(routingNodes[routingNodes.length - 1].x), scaleY(routingNodes[routingNodes.length - 1].y)];
    g.append('line')
      .attr('class', 'geodesic-baseline-chord')
      .attr('x1', pOrigin[0])
      .attr('y1', pOrigin[1])
      .attr('x2', pDest[0])
      .attr('y2', pDest[1])
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.25);

    g.append('text')
      .attr('x', (pOrigin[0] + pDest[0]) / 2)
      .attr('y', (pOrigin[1] + pDest[1]) / 2 - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono')
      .attr('opacity', 0.4)
      .text('GEODESIC DIRECT CHORD (4,320 KM)');

    const points = routingNodes.map((n) => [scaleX(n.x), scaleY(n.y)] as [number, number]);

    // D3 Spline Curve Generator (Smooth Catmull-Rom optical conduit)
    const lineGenerator = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
    const pathD = lineGenerator(points) || '';

    // Draw Optical Fiber Outer Glow
    const fiberGlowPath = g
      .append('path')
      .attr('class', 'fiber-glow-cable')
      .attr('d', pathD)
      .attr('fill', 'none')
      .attr('stroke', turbulenceActive ? '#f43f5e' : routeTelemetry.qualityScore > 85 ? '#38bdf8' : '#f59e0b')
      .attr('stroke-width', 8)
      .attr('opacity', 0.32)
      .attr('filter', 'url(#flowFiberGlow)');

    // Core Fiber Conduit Line
    const fiberPath = g
      .append('path')
      .attr('class', 'fiber-main-cable')
      .attr('d', pathD)
      .attr('fill', 'none')
      .attr('stroke', turbulenceActive ? '#fb7185' : routeTelemetry.qualityScore > 85 ? '#06b6d4' : '#fbbf24')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    // Pulsing Animated Photon Particles along path
    const pathNode = fiberPath.node();
    if (pathNode) {
      [0, 0.2, 0.4, 0.6, 0.8].forEach((offsetRatio, idx) => {
        const particle = g
          .append('circle')
          .attr('r', 4.5)
          .attr('fill', idx === 0 ? '#ffffff' : '#fbbf24')
          .attr('filter', 'url(#flowFiberGlow)');
        let progress = offsetRatio;
        const speed = 0.0035;

        const timer = d3.timer(() => {
          if (!fiberPath.node()) return;
          const currentLength = fiberPath.node()!.getTotalLength();
          progress = (progress + speed) % 1;
          const pos = fiberPath.node()!.getPointAtLength(progress * currentLength);
          particle.attr('cx', pos.x).attr('cy', pos.y);
        });
        particleTimersRef.current.push(timer);
      });
    }

    // Dynamic Drag HUD group (floats right above the node being dragged)
    const dragHud = g
      .append('g')
      .attr('class', 'drag-hud-overlay')
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    dragHud
      .append('rect')
      .attr('x', -70)
      .attr('y', -30)
      .attr('width', 140)
      .attr('height', 26)
      .attr('rx', 6)
      .attr('fill', '#020617')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))');

    const dragHudTitle = dragHud
      .append('text')
      .attr('class', 'hud-title')
      .attr('x', 0)
      .attr('y', -17)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '8.5px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono');

    const dragHudStats = dragHud
      .append('text')
      .attr('class', 'hud-stats')
      .attr('x', 0)
      .attr('y', -7)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fbbf24')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono');

    // -------------------------------------------------------------
    // D3 DRAG BEHAVIOR: Real-time Node Dragging & Flow Recalculation
    // -------------------------------------------------------------
    const dragBehavior = d3Drag
      .drag<SVGGElement, FiberRoutingNode>()
      .subject((_event, d) => ({
        x: scaleX(d.x),
        y: scaleY(d.y),
      }))
      .on('start', function (_event, d) {
        isDraggingRef.current = true;
        setDraggedNodeId(d.id);
        d3.select(this).raise();

        // Enlarge ring & add glowing stroke
        d3.select(this)
          .select('.node-ring')
          .transition()
          .duration(120)
          .attr('r', 17)
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 3.5);

        // Position & reveal HUD
        dragHud
          .attr('transform', `translate(${scaleX(d.x)}, ${scaleY(d.y) - 18})`)
          .transition()
          .duration(120)
          .attr('opacity', 1);

        dragHudTitle.text(`${d.name.split(' ')[0]} [DRAGGING]`);
        dragHudStats.text(`α:${d.algebraicFlowCoeff} · κ:${d.curvatureIndex} · θ:${d.tangentAngleDeg}°`);

        sound.playActionStrike();
      })
      .on('drag', function (event, d) {
        // Clamp to SVG bounds
        const curX = Math.max(30, Math.min(width - 30, event.x));
        const curY = Math.max(30, Math.min(height - 30, event.y));

        const unscaledX = Number(invertX(curX).toFixed(1));
        const unscaledY = Number(invertY(curY).toFixed(1));

        d.x = unscaledX;
        d.y = unscaledY;

        // Reposition group immediately
        d3.select(this).attr('transform', `translate(${curX}, ${curY})`);

        // Recalculate full routing nodes with fresh algebraic flow coefficients in local ref
        const updated = routingNodesRef.current.map((node) =>
          node.id === d.id ? { ...node, x: unscaledX, y: unscaledY } : node
        );
        const recomputed = computeAlgebraicFlow(updated);
        routingNodesRef.current = recomputed;

        const currentDatum = recomputed.find((n) => n.id === d.id) || d;

        // Dynamically update the optical fiber line and glow paths
        const newPoints = recomputed.map((n) => [scaleX(n.x), scaleY(n.y)] as [number, number]);
        const newPathD = lineGenerator(newPoints) || '';
        fiberPath.attr('d', newPathD);
        fiberGlowPath.attr('d', newPathD);

        // Dynamically update tangent vector lines and markers on all node groups
        nodeGroups.each(function (n) {
          const updatedNode = recomputed.find((item) => item.id === n.id);
          if (!updatedNode) return;

          const rad = (updatedNode.tangentAngleDeg * Math.PI) / 180;
          const vectorLen = 26 * updatedNode.algebraicFlowCoeff;
          const isHigh = updatedNode.algebraicFlowCoeff > 0.85;
          const isMid = updatedNode.algebraicFlowCoeff > 0.65;
          const strokeColor = isHigh ? '#38bdf8' : isMid ? '#f59e0b' : '#f43f5e';
          const markerId = isHigh ? 'url(#vectorArrowCyan)' : isMid ? 'url(#vectorArrowAmber)' : 'url(#vectorArrowRose)';

          d3.select(this)
            .select<SVGLineElement>('.vector-line')
            .attr('x2', Math.cos(rad) * vectorLen)
            .attr('y2', Math.sin(rad) * vectorLen)
            .attr('stroke', strokeColor)
            .attr('marker-end', markerId);

          // Update alpha badge
          d3.select(this)
            .select<SVGTextElement>('.alpha-badge-text')
            .text(`α:${updatedNode.algebraicFlowCoeff}`)
            .attr('fill', isHigh ? '#34d399' : isMid ? '#fbbf24' : '#f87171');

          d3.select(this)
            .select<SVGRectElement>('.alpha-badge-rect')
            .attr('stroke', isHigh ? '#10b981' : isMid ? '#f59e0b' : '#ef4444');
        });

        // Update Drag HUD
        dragHud.attr('transform', `translate(${curX}, ${curY - 18})`);
        dragHudStats.text(`α:${currentDatum.algebraicFlowCoeff} · κ:${currentDatum.curvatureIndex} · θ:${currentDatum.tangentAngleDeg}°`);

        // Throttle React state update via requestAnimationFrame for 60fps outside UI sync
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(() => {
            setRoutingNodes([...recomputed]);
            rafIdRef.current = null;
          });
        }
      })
      .on('end', function (_event, d) {
        isDraggingRef.current = false;
        setDraggedNodeId(null);

        // Hide Drag HUD
        dragHud.transition().duration(200).attr('opacity', 0);

        // Reset node ring styling
        d3.select(this)
          .select('.node-ring')
          .transition()
          .duration(200)
          .attr('r', d.type === 'ORIGIN' || d.type === 'DESTINATION' ? 15 : 11)
          .attr('stroke', d.type === 'DESTINATION' ? '#f59e0b' : '#38bdf8')
          .attr('stroke-width', 2);

        sound.playFiberDataBurst();

        // Final state sync
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        const finalNodes = computeAlgebraicFlow(routingNodesRef.current);
        setRoutingNodes(finalNodes);
        if (selectedNode?.id === d.id) {
          setSelectedNode(finalNodes.find((n) => n.id === d.id) || null);
        }
      });

    // Draw Draggable Node Elements
    const nodeGroups = g
      .selectAll<SVGGElement, FiberRoutingNode>('.fiber-node')
      .data(routingNodes, (d) => d.id)
      .enter()
      .append('g')
      .attr('class', 'fiber-node')
      .attr('transform', (d) => `translate(${scaleX(d.x)},${scaleY(d.y)})`)
      .style('cursor', 'grab')
      .call(dragBehavior);

    // Tangent Vector Arrows (Al-Khwarizmi Algebraic Flow Direction)
    nodeGroups
      .append('line')
      .attr('class', 'vector-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => {
        const rad = (d.tangentAngleDeg * Math.PI) / 180;
        return Math.cos(rad) * (26 * d.algebraicFlowCoeff);
      })
      .attr('y2', (d) => {
        const rad = (d.tangentAngleDeg * Math.PI) / 180;
        return Math.sin(rad) * (26 * d.algebraicFlowCoeff);
      })
      .attr('stroke', (d) => (d.algebraicFlowCoeff > 0.85 ? '#38bdf8' : d.algebraicFlowCoeff > 0.65 ? '#f59e0b' : '#f43f5e'))
      .attr('stroke-width', 2)
      .attr('marker-end', (d) =>
        d.algebraicFlowCoeff > 0.85 ? 'url(#vectorArrowCyan)' : d.algebraicFlowCoeff > 0.65 ? 'url(#vectorArrowAmber)' : 'url(#vectorArrowRose)'
      )
      .attr('opacity', 0.85);

    // Node Outer Ring
    nodeGroups
      .append('circle')
      .attr('class', 'node-ring')
      .attr('r', (d) => (d.type === 'ORIGIN' || d.type === 'DESTINATION' ? 15 : 11))
      .attr('fill', (d) =>
        d.type === 'ORIGIN'
          ? '#0284c7'
          : d.type === 'DESTINATION'
          ? '#b45309'
          : d.type === 'MINING_BYPASS'
          ? '#4f46e5'
          : d.type === 'CRYPT_RELAY'
          ? '#d97706'
          : '#0f172a'
      )
      .attr('stroke', (d) => (d.type === 'DESTINATION' ? '#f59e0b' : '#38bdf8'))
      .attr('stroke-width', 2);

    // Center Pip
    nodeGroups.append('circle').attr('r', 4.5).attr('fill', '#ffffff');

    // Live Algebraic Flow Coefficient Badge (alpha_k)
    const badgeG = nodeGroups.append('g').attr('transform', 'translate(0, -18)');

    badgeG
      .append('rect')
      .attr('class', 'alpha-badge-rect')
      .attr('x', -22)
      .attr('y', -8)
      .attr('width', 44)
      .attr('height', 14)
      .attr('rx', 3)
      .attr('fill', '#090d16')
      .attr('stroke', (d) => (d.algebraicFlowCoeff > 0.85 ? '#10b981' : d.algebraicFlowCoeff > 0.65 ? '#f59e0b' : '#ef4444'))
      .attr('stroke-width', 1);

    badgeG
      .append('text')
      .attr('class', 'alpha-badge-text')
      .attr('x', 0)
      .attr('y', 2)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.algebraicFlowCoeff > 0.85 ? '#34d399' : d.algebraicFlowCoeff > 0.65 ? '#fbbf24' : '#f87171'))
      .attr('font-size', '8.5px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono')
      .text((d) => `α:${d.algebraicFlowCoeff}`);

    // Node Name Label
    nodeGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.type === 'DESTINATION' ? '#fbbf24' : '#e2e8f0'))
      .attr('font-size', '9.5px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono')
      .text((d) => d.name.split(' ')[0]);

    // Click to select node (only if not dragged)
    nodeGroups.on('click', (event, d) => {
      if (event.defaultPrevented) return;
      const current = routingNodesRef.current.find((n) => n.id === d.id) || d;
      setSelectedNode(current);
      sound.playFiberDataBurst();
    });

    return () => {
      particleTimersRef.current.forEach((t) => t.stop());
      particleTimersRef.current = [];
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [routingNodes, turbulenceActive, routeTelemetry.qualityScore, activeD3Tab]);

  // -------------------------------------------------------------
  // D3 Render Effect: Multi-Channel Fluctuation Timeline
  // -------------------------------------------------------------
  useEffect(() => {
    const svgEl = timelineSvgRef.current;
    if (!svgEl || streamData.length < 2) return;

    const width = svgEl.clientWidth || 640;
    const height = 240;
    const margin = { top: 20, right: 35, bottom: 30, left: 40 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([d3.min(streamData, (d) => d.id) || 0, d3.max(streamData, (d) => d.id) || 1]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 60]).range([innerH, 0]);

    const yAxisGrid = d3.axisLeft(yScale).tickValues([0, 15, 30, 45, 59]).tickSize(-innerW).tickFormat(() => '');
    g.append('g').call(yAxisGrid).selectAll('line').attr('stroke', '#131e33').attr('stroke-dasharray', '2,2');

    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat((d) => `#${d}`);
    const yAxis = d3.axisLeft(yScale).tickValues([0, 15, 30, 45, 59]).tickFormat((d) => `${d}₆₀`);

    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).attr('color', '#64748b').selectAll('text').attr('font-size', '10px').attr('font-family', 'JetBrains Mono');
    g.append('g').call(yAxis).attr('color', '#64748b').selectAll('text').attr('font-size', '10px').attr('font-family', 'JetBrains Mono');

    const channels = [
      { key: 'token0', name: 'T0: Header (59)', color: '#06b6d4', show: channelFilter === 'ALL' },
      { key: 'token1', name: 'T1: Epoch', color: '#f59e0b', show: channelFilter === 'ALL' },
      { key: 'token2', name: 'T2: Azimuth Φ', color: '#38bdf8', show: channelFilter === 'ALL' || channelFilter === 'VECTORS' },
      { key: 'token3', name: 'T3: Zenith Θ', color: '#a855f7', show: channelFilter === 'ALL' || channelFilter === 'VECTORS' },
      { key: 'token4', name: 'T4: Energy PeV', color: '#f43f5e', show: channelFilter === 'ALL' },
      { key: 'token5', name: 'T5: Al-Jabr Checksum', color: '#10b981', show: channelFilter === 'ALL' || channelFilter === 'CHECKSUM' },
    ];

    channels.forEach((ch) => {
      if (!ch.show) return;
      const lineGen = d3.line<StreamPacketPoint>().x((d) => xScale(d.id)).y((d) => yScale((d as unknown as Record<string, number>)[ch.key] || 0)).curve(d3.curveMonotoneX);
      g.append('path').datum(streamData).attr('fill', 'none').attr('stroke', ch.color).attr('stroke-width', ch.key === 'token5' ? 2.5 : 1.8).attr('opacity', 0.9).attr('d', lineGen);
    });

    const bisect = d3.bisector<StreamPacketPoint, number>((d) => d.id).left;
    const overlay = g.append('rect').attr('width', innerW).attr('height', innerH).attr('fill', 'transparent').attr('cursor', 'crosshair');
    overlay.on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      const hoveredId = xScale.invert(mx);
      const idx = bisect(streamData, hoveredId);
      const point = streamData[idx] || streamData[streamData.length - 1];
      if (point) setSelectedPoint(point);
    });
  }, [streamData, channelFilter, activeD3Tab]);

  // -------------------------------------------------------------
  // D3 Render Effect: Polar Phase Scatter
  // -------------------------------------------------------------
  useEffect(() => {
    const svgEl = polarSvgRef.current;
    if (!svgEl) return;

    const size = svgEl.clientWidth || 240;
    const radius = size / 2 - 16;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

    [15, 30, 45, 60].forEach((lvl) => {
      const r = (lvl / 60) * radius;
      g.append('circle').attr('r', r).attr('fill', 'none').attr('stroke', '#1e293b').attr('stroke-width', 1).attr('stroke-dasharray', lvl === 60 ? 'none' : '2,2');
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', Math.cos(angle) * radius).attr('y2', Math.sin(angle) * radius).attr('stroke', '#131e33').attr('stroke-width', 1);
    }

    const tusiEnvelopeR = radius * 0.7;
    g.append('circle').attr('r', tusiEnvelopeR).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 1.2).attr('stroke-dasharray', '4,3').attr('opacity', 0.5);

    const recent = streamData.slice(-25);
    recent.forEach((d, idx) => {
      const angle = d.tusiThetaRad - Math.PI / 2;
      const r = (d.token3 / 60) * radius;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      const isLatest = idx === recent.length - 1;
      g.append('circle').attr('cx', px).attr('cy', py).attr('r', isLatest ? 6 : 3).attr('fill', isLatest ? '#fbbf24' : d.isCongruent ? '#38bdf8' : '#f43f5e').attr('stroke', isLatest ? '#ffffff' : '#0f172a').attr('stroke-width', 1.5).attr('opacity', (idx + 5) / 30);
    });
  }, [streamData, activeD3Tab]);

  // Route Preset Handlers
  const applyPreset = useCallback((presetName: string) => {
    setActivePreset(presetName);
    sound.playFiberDataBurst();

    let updated: FiberRoutingNode[] = [];
    if (presetName === 'DEFAULT') {
      updated = INITIAL_FIBER_NODES.map((n) => ({ ...n, x: n.originalX, y: n.originalY }));
    } else if (presetName === 'ALTAY_BYPASS') {
      updated = routingNodes.map((n) => {
        if (n.id === 'altay') return { ...n, x: 230, y: 195 };
        if (n.id === 'astana') return { ...n, x: 290, y: 140 };
        return n;
      });
    } else if (presetName === 'CRYPT_SASANIAN') {
      updated = routingNodes.map((n) => {
        if (n.id === 'takht') return { ...n, x: 520, y: 220 };
        if (n.id === 'ashgabat') return { ...n, x: 460, y: 200 };
        return n;
      });
    } else if (presetName === 'DIRECT_CHORD') {
      const start = routingNodes[0];
      const end = routingNodes[routingNodes.length - 1];
      updated = routingNodes.map((n, i) => {
        const ratio = i / (routingNodes.length - 1);
        return {
          ...n,
          x: start.originalX + ratio * (end.originalX - start.originalX),
          y: start.originalY + ratio * (end.originalY - start.originalY),
        };
      });
    }

    const recomputed = computeAlgebraicFlow(updated);
    routingNodesRef.current = recomputed;
    setRoutingNodes(recomputed);
  }, [routingNodes]);

  // Harmonic Geodesic Relaxation: Algorithmically smooths the Silk Road line to maximize alpha flow (α -> 1.0)
  const optimizeFlowHarmonics = useCallback(() => {
    setActivePreset('OPTIMIZED');
    sound.playActionStrike();
    const start = routingNodes[0];
    const end = routingNodes[routingNodes.length - 1];
    const count = routingNodes.length;

    const smoothed = routingNodes.map((node, i) => {
      if (i === 0 || i === count - 1) return node;
      const t = i / (count - 1);
      // Natural geodesic catenary curve across Central Asian terrain
      const idealX = start.x + t * (end.x - start.x);
      const idealY = start.y + t * (end.y - start.y) + Math.sin(t * Math.PI) * 22;
      return {
        ...node,
        x: Number((node.x * 0.35 + idealX * 0.65).toFixed(1)),
        y: Number((node.y * 0.35 + idealY * 0.65).toFixed(1)),
      };
    });

    const recomputed = computeAlgebraicFlow(smoothed);
    routingNodesRef.current = recomputed;
    setRoutingNodes(recomputed);
  }, [routingNodes]);

  const handleToggleTurbulence = () => {
    const next = !turbulenceActive;
    setTurbulenceActive(next);
    if (next) sound.playCherenkovShockwave();
    else sound.playFiberDataBurst();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['Cinzel'] font-bold text-base text-slate-100">
              CENTRAL ASIAN FIBER PIPELINE & SEXAGESIMAL D3 ENGINE
            </span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                routeTelemetry.qualityScore > 85
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              ● {metrics.statusText}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Interactive D3 Drag & Route: <strong className="text-cyan-300">Click and drag nodes</strong> along the 5,210-km Silk Road corridor to dynamically update packet routing paths and real-time <strong className="text-amber-300">Al-Khwarizmi algebraic flow coefficients (α)</strong>.
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveD3Tab('ROUTING_MAP')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeD3Tab === 'ROUTING_MAP'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Drag Routing</span>
          </button>
          <button
            onClick={() => setActiveD3Tab('TIMELINE')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeD3Tab === 'TIMELINE'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Token Timeline</span>
          </button>
          <button
            onClick={() => setActiveD3Tab('POLAR_SCATTER')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeD3Tab === 'POLAR_SCATTER'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Polar Phase</span>
          </button>
        </div>
      </div>

      {/* Real-time Route Telemetry Ribbon (Computed dynamically from dragged nodes) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">DYNAMIC ROUTE LENGTH</div>
          <div className="text-xl sm:text-2xl font-['Cinzel'] font-bold text-cyan-400 tabular-nums">
            {routeTelemetry.totalDistanceKm.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-mono">KM</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">Baikal ➔ Maragheh</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ONE-WAY FIBER LATENCY</div>
          <div className="text-xl sm:text-2xl font-['Cinzel'] font-bold text-amber-300 tabular-nums">
            {routeTelemetry.latencyMs} <span className="text-xs font-normal text-slate-400 font-mono">MS</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">~5.0 µs / km c_fiber</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">FLOW COHERENCE (Φ)</div>
          <div className="text-xl sm:text-2xl font-['Cinzel'] font-bold text-emerald-400 tabular-nums">
            {routeTelemetry.flowCoherencePct}%
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Mean α: {routeTelemetry.avgFlowAlpha}</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">OPTICAL ATTENUATION</div>
          <div className="text-xl sm:text-2xl font-['Cinzel'] font-bold text-purple-300 tabular-nums">
            {routeTelemetry.lossDbm} <span className="text-xs font-normal text-slate-400 font-mono">dB</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">8 Repeaters Gain Compensated</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">AL-JABR FLOW CONGRUENCE</div>
          <div
            className={`text-xl sm:text-2xl font-['Cinzel'] font-bold tabular-nums ${
              routeTelemetry.isFlowCongruent ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {routeTelemetry.flowModuloCongruence === 0 ? 'Σ ≡ 0' : `Δ=${routeTelemetry.flowModuloCongruence}`}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            {routeTelemetry.isFlowCongruent ? 'Harmonic Equilibrium ✓' : 'Modulo Restoring...'}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: INTERACTIVE CLICK-AND-DRAG CENTRAL ASIAN ROUTING MAP  */}
      {/* ------------------------------------------------------------- */}
      {activeD3Tab === 'ROUTING_MAP' && (
        <div className="space-y-4">
          {/* Topology Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 mr-1 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>ROUTING TOPOLOGY PRESETS:</span>
              </span>
              <button
                onClick={() => applyPreset('DEFAULT')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activePreset === 'DEFAULT' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                1. Standard Silk Road (5,210 km)
              </button>
              <button
                onClick={() => applyPreset('ALTAY_BYPASS')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activePreset === 'ALTAY_BYPASS' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                2. Altay Quantum Ore Bypass (5,680 km)
              </button>
              <button
                onClick={() => applyPreset('CRYPT_SASANIAN')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activePreset === 'CRYPT_SASANIAN' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                3. Takht-e Soleyman Crypt Link (4,940 km)
              </button>
              <button
                onClick={() => applyPreset('DIRECT_CHORD')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activePreset === 'DIRECT_CHORD' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                4. Deep Mantle Direct Chord (4,320 km)
              </button>
              <button
                onClick={optimizeFlowHarmonics}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  activePreset === 'OPTIMIZED'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-emerald-400 hover:text-emerald-200 bg-slate-900 border border-emerald-500/30'
                }`}
                title="Algorithmically smooth the fiber curve to maximize Al-Khwarizmi algebraic flow (α -> 1.0)"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>5. Harmonic Geodesic Relaxation</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => applyPreset('DEFAULT')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                title="Reset Node Locations to Default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Map</span>
              </button>
              <button
                onClick={handleToggleTurbulence}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer border ${
                  turbulenceActive
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>{turbulenceActive ? 'Clear Storm' : 'Inject Solar CME'}</span>
              </button>
            </div>
          </div>

          {/* D3 Draggable Canvas Viewport */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#050a14] shadow-inner">
            <svg ref={routingSvgRef} className="w-full h-80 sm:h-96 block select-none" />

            {/* Instruction Overlay */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 pointer-events-none flex items-center gap-2">
              <Move className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>CLICK & DRAG ANY NODE TO RESHAPE ROUTE & LIVE RECALCULATE FLOW COEFFICIENTS (α)</span>
            </div>

            {/* Active Node Inspection Card Overlay (Reads live coordinates & coefficients) */}
            {selectedNode && (() => {
              const liveNode = routingNodes.find((n) => n.id === selectedNode.id) || selectedNode;
              return (
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/40 text-xs font-mono max-w-xs space-y-1.5 shadow-xl">
                  <div className="flex items-center justify-between text-cyan-300 font-bold">
                    <span>{liveNode.name}</span>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">{liveNode.region} · {liveNode.type}</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-800 text-slate-300">
                    <div className="text-amber-300 font-bold">Flow Coeff (α): {liveNode.algebraicFlowCoeff}</div>
                    <div>Heading: {liveNode.tangentAngleDeg}°</div>
                    <div>Curvature (κ): {liveNode.curvatureIndex}</div>
                    <div>Al-Jabr W: {liveNode.alJabrWeight} mod 60</div>
                    <div>Repeater Gain: +{liveNode.repeaterGainDb} dB</div>
                    <div>Cryo Temp: {liveNode.temperatureK} K</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Real-time Algebraic Flow Coefficients Matrix Table */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>REAL-TIME AL-KHWARIZMI ALGEBRAIC FLOW MATRIX [α₀ … α₈]</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                System Flow Index: <strong className="text-emerald-400">{routeTelemetry.flowCoherencePct}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {routingNodes.map((node, idx) => (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    sound.playFiberDataBurst();
                  }}
                  className={`p-2.5 rounded-lg border text-center font-mono cursor-pointer transition-all ${
                    draggedNodeId === node.id
                      ? 'bg-amber-500/20 border-amber-400 shadow-md scale-105'
                      : selectedNode?.id === node.id
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-sm'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase truncate">
                    {node.name.split(' ')[0]}
                  </div>
                  <div
                    className={`text-base font-bold my-0.5 tabular-nums ${
                      node.algebraicFlowCoeff > 0.85
                        ? 'text-emerald-400'
                        : node.algebraicFlowCoeff > 0.65
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    α{idx}: {node.algebraicFlowCoeff}
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-150 ${
                        node.algebraicFlowCoeff > 0.85
                          ? 'bg-emerald-400'
                          : node.algebraicFlowCoeff > 0.65
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${node.algebraicFlowCoeff * 100}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    θ: {node.tangentAngleDeg}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: MULTI-CHANNEL FLUCTUATION TIMELINE                     */}
      {/* ------------------------------------------------------------- */}
      {activeD3Tab === 'TIMELINE' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOKEN FLUCTUATION DYNAMICS (0 TO 59 POSITIONAL RANGE)</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[11px]">
              <button
                onClick={() => setChannelFilter('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  channelFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                All 6 Tokens
              </button>
              <button
                onClick={() => setChannelFilter('VECTORS')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  channelFilter === 'VECTORS' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Tusi Vectors (Φ, Θ)
              </button>
              <button
                onClick={() => setChannelFilter('CHECKSUM')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  channelFilter === 'CHECKSUM' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Al-Jabr Checksum
              </button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#060a14] p-2 relative">
            <svg ref={timelineSvgRef} className="w-full h-64 block" />
            <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              WINDOW: 45 PACKETS · 30Hz
            </div>
          </div>

          {/* Channel Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /><span>T0: Header (59)</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /><span>T1: Time</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /><span>T2: Azimuth Φ</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /><span>T3: Zenith Θ</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /><span>T4: Energy</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /><span>T5: Al-Jabr Checksum</span></span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: POLAR PHASE RADAR SCATTER                             */}
      {/* ------------------------------------------------------------- */}
      {activeD3Tab === 'POLAR_SCATTER' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-3">
            <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>TUSI POLAR PHASE SCATTER</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SECTORS 0–59</span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#060a14] p-3 flex items-center justify-center">
              <svg ref={polarSvgRef} className="w-full max-w-[260px] h-64 block" />
            </div>
          </div>

          <div className="md:col-span-6 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3 text-xs font-mono">
              <div className="font-['Cinzel'] font-bold text-amber-300 text-sm">
                BASE-60 HARMONIC ENVELOPE THEOREM
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                In the Tusi Couple transform, arriving Cherenkov arrival coordinates S(Phi) and S(Theta) are mapped onto concentric sexagesimal rings.
                When the Silk Road fiber line maintains phase coherence, all coordinates settle onto the circular harmonic envelope of radius R = 2r.
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Vector Offset:</span>
                  <span className="text-cyan-400">0.038″</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modulo Invariance:</span>
                  <span className="text-emerald-400">Σ ≡ 0 (mod 60) SUSTAINED</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 font-mono">
              Transit Route: {routeTelemetry.totalDistanceKm} km across 8 repeaters
            </div>
          </div>
        </div>
      )}

      {/* Packet Inspection Card */}
      {selectedPoint && (
        <div className="p-4 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="font-bold">
              PACKET INSPECTOR: #{selectedPoint.id} (T+{selectedPoint.token1} GHATI)
            </span>
            <span className={selectedPoint.isCongruent ? 'text-emerald-400' : 'text-rose-400'}>
              {selectedPoint.isCongruent ? 'AL-JABR BALANCED ✓' : 'MOD-60 CHECKSUM DRIFT ✖'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T0 (Header)</span>
              <span className="text-sm font-bold text-cyan-400">{selectedPoint.token0}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token0] || '·'}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T1 (Time)</span>
              <span className="text-sm font-bold text-amber-400">{selectedPoint.token1}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token1] || '·'}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T2 (Azimuth)</span>
              <span className="text-sm font-bold text-sky-400">{selectedPoint.token2}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token2] || '·'}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T3 (Zenith)</span>
              <span className="text-sm font-bold text-purple-400">{selectedPoint.token3}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token3] || '·'}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T4 (Energy)</span>
              <span className="text-sm font-bold text-rose-400">{selectedPoint.token4}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token4] || '·'}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">T5 (Checksum)</span>
              <span className="text-sm font-bold text-emerald-400">{selectedPoint.token5}₆₀</span>
              <span className="text-[10px] text-slate-400 block">{SEXAGESIMAL_GLYPHS[selectedPoint.token5] || '·'}</span>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-400">
            Mathematical Balance Proof: ({selectedPoint.token0} + {selectedPoint.token1} + {selectedPoint.token2} + {selectedPoint.token3} + {selectedPoint.token4} + {selectedPoint.token5}) = {selectedPoint.rawSum} ≡ {selectedPoint.rawSum % 60} mod 60
          </div>
        </div>
      )}
    </div>
  );
};
