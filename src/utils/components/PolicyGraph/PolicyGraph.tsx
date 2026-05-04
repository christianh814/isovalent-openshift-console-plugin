import * as React from 'react';
import { GlobeIcon, CubesIcon, ClusterIcon, LockIcon, LockOpenIcon } from '@patternfly/react-icons';
import {
  buildPolicyGraph,
  GraphRow,
  GraphSide,
  PolicyGraphData,
  PolicyScope,
  PolicyVerdict,
} from './policy-graph-utils';
import { CiliumNetworkPolicySpec } from '@cilium-models/CiliumNetworkPolicyModel';
import './PolicyGraph.css';

type PolicyGraphProps = {
  spec?: CiliumNetworkPolicySpec;
  namespace?: string;
};

type Side = 'left' | 'right';

type RowAnchor = {
  el: HTMLDivElement;
  side: Side;
  scope: PolicyScope;
  verdict: PolicyVerdict;
};

const SCOPE_ORDER: PolicyScope[] = ['outside', 'namespace', 'cluster'];

const SCOPE_HEADERS: Record<PolicyScope, { label: string; icon: React.ComponentType }> = {
  outside: { label: 'Outside Cluster', icon: GlobeIcon },
  namespace: { label: 'In Namespace', icon: CubesIcon },
  cluster: { label: 'In Cluster', icon: ClusterIcon },
};

const ScopeCard: React.FC<{
  scope: PolicyScope;
  rows: GraphRow[];
  side: Side;
  registerRow: (key: string, anchor: RowAnchor | null) => void;
  keyPrefix: string;
}> = ({ scope, rows, side, registerRow, keyPrefix }) => {
  const Header = SCOPE_HEADERS[scope].icon;
  return (
    <div className="policy-graph-card">
      <div className="policy-graph-card-header">
        <Header />
        <span>{SCOPE_HEADERS[scope].label}</span>
      </div>
      {rows.map((row, idx) => {
        const key = `${keyPrefix}-${scope}-${idx}`;
        return (
          <div
            key={key}
            className="policy-graph-row"
            ref={(el) => {
              if (el) {
                registerRow(key, { el, side, scope, verdict: row.verdict });
              } else {
                registerRow(key, null);
              }
            }}
          >
            <span className="policy-graph-row-label" title={row.label}>
              {row.label}
            </span>
            {row.ports && <span className="policy-graph-row-ports">→ {row.ports}</span>}
          </div>
        );
      })}
    </div>
  );
};

const SideColumn: React.FC<{
  data: GraphSide;
  side: Side;
  registerRow: (key: string, anchor: RowAnchor | null) => void;
  keyPrefix: string;
}> = ({ data, side, registerRow, keyPrefix }) => (
  <div className="policy-graph-column">
    {SCOPE_ORDER.map((scope) => (
      <ScopeCard
        key={scope}
        scope={scope}
        rows={data[scope]}
        side={side}
        registerRow={registerRow}
        keyPrefix={keyPrefix}
      />
    ))}
  </div>
);

const SelectorCard: React.FC<{
  data: PolicyGraphData;
  selectorRef: React.RefObject<HTMLDivElement>;
}> = ({ data, selectorRef }) => (
  <div className="policy-graph-selector" ref={selectorRef}>
    <div className="policy-graph-selector-header">{'{ } Selector'}</div>
    <div className="policy-graph-selector-defaults">
      <div className={`policy-graph-default ${data.ingressDefault}`}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {data.ingressDefault === 'deny' ? <LockIcon /> : <LockOpenIcon />}
          Ingress
        </span>
        <span>Default {data.ingressDefault === 'deny' ? 'Deny' : 'Allow'}</span>
      </div>
      <div
        className={`policy-graph-default ${data.egressDefault}`}
        style={{ alignItems: 'flex-end' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Egress
          {data.egressDefault === 'deny' ? <LockIcon /> : <LockOpenIcon />}
        </span>
        <span>Default {data.egressDefault === 'deny' ? 'Deny' : 'Allow'}</span>
      </div>
    </div>
    <div className="policy-graph-selector-labels">
      {data.selectorEmpty ? (
        <span className="policy-graph-selector-label">all endpoints</span>
      ) : (
        data.selectorLines.map((line) => (
          <span className="policy-graph-selector-label" key={line}>
            {line}
          </span>
        ))
      )}
    </div>
  </div>
);

const PolicyGraph: React.FC<PolicyGraphProps> = ({ spec, namespace }) => {
  const data = React.useMemo(() => buildPolicyGraph(spec, namespace), [spec, namespace]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectorRef = React.useRef<HTMLDivElement>(null);
  const anchorsRef = React.useRef<Map<string, RowAnchor>>(new Map());
  const [paths, setPaths] = React.useState<
    Array<{
      d: string;
      verdict: PolicyVerdict;
      key: string;
      side: Side;
      midX: number;
      midY: number;
      angle: number;
    }>
  >([]);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  const registerRow = React.useCallback((key: string, anchor: RowAnchor | null) => {
    if (anchor) anchorsRef.current.set(key, anchor);
    else anchorsRef.current.delete(key);
  }, []);

  const recompute = React.useCallback(() => {
    const container = containerRef.current;
    const selector = selectorRef.current;
    if (!container || !selector) return;
    const cRect = container.getBoundingClientRect();
    setSize({ w: cRect.width, h: cRect.height });
    const sRect = selector.getBoundingClientRect();
    const anchors: Array<{
      d: string;
      verdict: PolicyVerdict;
      key: string;
      side: Side;
      midX: number;
      midY: number;
      angle: number;
    }> = [];
    const leftAnchor = {
      x: sRect.left - cRect.left,
      y: sRect.top - cRect.top + sRect.height / 2,
    };
    const rightAnchor = {
      x: sRect.right - cRect.left,
      y: sRect.top - cRect.top + sRect.height / 2,
    };
    anchorsRef.current.forEach((a, key) => {
      const r = a.el.getBoundingClientRect();
      const isLeft = a.side === 'left';
      const fromX = isLeft ? r.right - cRect.left : r.left - cRect.left;
      const fromY = r.top - cRect.top + r.height / 2;
      const toX = isLeft ? leftAnchor.x : rightAnchor.x;
      const toY = isLeft ? leftAnchor.y : rightAnchor.y;
      const dx = (toX - fromX) * 0.5;
      const d = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
      anchors.push({ d, verdict: a.verdict, key, side: a.side, midX: 0, midY: 0, angle: 0 });
    });
    setPaths(anchors);
  }, []);

  React.useLayoutEffect(() => {
    recompute();
  }, [data, recompute]);

  React.useEffect(() => {
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [recompute]);

  return (
    <div className="policy-graph-container" ref={containerRef}>
      <svg className="policy-graph-svg" width={size.w} height={size.h}>
        <defs>
          <marker
            id="policy-graph-arrow-allow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3e8635" />
          </marker>
          <marker
            id="policy-graph-arrow-deny"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c9190b" />
          </marker>
        </defs>
        {paths.map((p) => (
          <path key={p.key} d={p.d} className={`policy-graph-edge ${p.verdict}`} />
        ))}
      </svg>
      <div className="policy-graph-grid">
        <SideColumn data={data.ingress} side="left" registerRow={registerRow} keyPrefix="ingress" />
        <div className="policy-graph-column center">
          <SelectorCard data={data} selectorRef={selectorRef} />
        </div>
        <SideColumn data={data.egress} side="right" registerRow={registerRow} keyPrefix="egress" />
      </div>
    </div>
  );
};

export default PolicyGraph;
