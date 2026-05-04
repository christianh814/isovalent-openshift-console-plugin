import {
  CiliumNetworkPolicySpec,
  CiliumPolicyRule,
} from '@cilium-models/CiliumNetworkPolicyModel';

export type PolicyVerdict = 'allow' | 'deny';
export type PolicyScope = 'outside' | 'namespace' | 'cluster';

export type GraphRow = {
  label: string;
  ports?: string;
  verdict: PolicyVerdict;
};

export type GraphSide = {
  outside: GraphRow[];
  namespace: GraphRow[];
  cluster: GraphRow[];
};

export type PolicyGraphData = {
  selectorLines: string[];
  selectorEmpty: boolean;
  ingressDefault: PolicyVerdict;
  egressDefault: PolicyVerdict;
  ingress: GraphSide;
  egress: GraphSide;
};

const NAMESPACE_LABEL_KEYS = [
  'io.kubernetes.pod.namespace',
  'k8s:io.kubernetes.pod.namespace',
  'k8s.io/namespace',
];

type MatchExpression = {
  key?: string;
  operator?: string;
  values?: string[];
};

function getMatchExpressions(selector: unknown): MatchExpression[] {
  if (!selector || typeof selector !== 'object') return [];
  const me = (selector as Record<string, unknown>).matchExpressions;
  if (!Array.isArray(me)) return [];
  return me.filter((e): e is MatchExpression => !!e && typeof e === 'object');
}

function formatExpression(expr: MatchExpression): string {
  const key = expr.key ?? '';
  const op = expr.operator ?? '';
  const values = expr.values ?? [];
  if (op === 'Exists' || op === 'DoesNotExist') {
    return `${key} ${op}`.trim();
  }
  return `${key} ${op} ${values.join(',')}`.trim();
}

function formatExpressionShort(expr: MatchExpression): string {
  const key = expr.key ?? '';
  const op = (expr.operator ?? '').toUpperCase();
  const values = expr.values ?? [];
  if (op === 'EXISTS' || op === 'DOESNOTEXIST') {
    return `${key} ${op}`;
  }
  const first = values[0] ?? '';
  const more = values.length > 1 ? '...' : '';
  return `${key} ${op} ${first}${more}`;
}

function flattenLabels(selector: unknown): Record<string, string> {
  if (!selector || typeof selector !== 'object') return {};
  const out: Record<string, string> = {};
  const sel = selector as Record<string, unknown>;
  const matchLabels = (sel.matchLabels ?? null) as Record<string, unknown> | null;
  if (matchLabels && typeof matchLabels === 'object') {
    for (const [k, v] of Object.entries(matchLabels)) {
      out[k] = String(v);
    }
  }
  // Cilium also accepts loose top-level labels
  for (const [k, v] of Object.entries(sel)) {
    if (k === 'matchLabels' || k === 'matchExpressions') continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = String(v);
    }
  }
  return out;
}

function formatPorts(toPorts?: CiliumPolicyRule['toPorts']): string | undefined {
  if (!toPorts || toPorts.length === 0) return undefined;
  const parts: string[] = [];
  for (const tp of toPorts) {
    for (const p of tp.ports ?? []) {
      const port = p.port ?? '*';
      const protocol = p.protocol ?? 'TCP';
      parts.push(`:${port}|${protocol}`);
    }
  }
  return parts.length ? parts.join(', ') : undefined;
}

function endpointScope(
  labels: Record<string, string>,
  ownNamespace: string | undefined,
): { scope: PolicyScope; namespaceLabel?: string } {
  let nsValue: string | undefined;
  for (const key of NAMESPACE_LABEL_KEYS) {
    if (labels[key]) {
      nsValue = labels[key];
      break;
    }
  }
  if (nsValue) {
    if (ownNamespace && nsValue === ownNamespace) {
      return { scope: 'namespace', namespaceLabel: nsValue };
    }
    return { scope: 'cluster', namespaceLabel: nsValue };
  }
  // No namespace label: assume same namespace for namespaced policies, else cluster-scoped
  return { scope: ownNamespace ? 'namespace' : 'cluster' };
}

function entityScope(entity: string): PolicyScope {
  switch (entity) {
    case 'world':
    case 'all':
      return 'outside';
    case 'host':
    case 'remote-node':
    case 'kube-apiserver':
    case 'init':
    case 'unmanaged':
    case 'health':
    case 'cluster':
    case 'ingress':
      return 'cluster';
    default:
      return 'cluster';
  }
}

function endpointLabel(labels: Record<string, string>): string {
  const entries = Object.entries(labels);
  if (entries.length === 0) return 'Any endpoint';
  // Prefer non-namespace labels for display
  const display = entries.filter(
    ([k]) => !NAMESPACE_LABEL_KEYS.includes(k),
  );
  const used = display.length > 0 ? display : entries;
  return used.map(([k, v]) => `${k}=${v}`).join(',');
}

function processRule(
  rule: CiliumPolicyRule,
  side: GraphSide,
  direction: 'from' | 'to',
  ownNamespace: string | undefined,
  verdict: PolicyVerdict,
) {
  const ports = formatPorts(rule.toPorts);
  const endpoints = direction === 'from' ? rule.fromEndpoints : rule.toEndpoints;
  const cidrs = direction === 'from' ? rule.fromCIDR : rule.toCIDR;
  const cidrSets = direction === 'from' ? rule.fromCIDRSet : rule.toCIDRSet;
  const entities = direction === 'from' ? rule.fromEntities : rule.toEntities;
  const fqdns = direction === 'to' ? rule.toFQDNs : undefined;
  const services = direction === 'to' ? rule.toServices : undefined;

  let added = false;

  for (const ep of endpoints ?? []) {
    const labels = flattenLabels(ep);
    const expressions = getMatchExpressions(ep);
    const { scope, namespaceLabel } = endpointScope(labels, ownNamespace);
    let display: string;
    if (scope === 'cluster' && namespaceLabel) {
      display = `namespace=${namespaceLabel}`;
    } else if (Object.keys(labels).length === 0 && expressions.length > 0) {
      display = formatExpressionShort(expressions[0]);
    } else {
      display = endpointLabel(labels);
    }
    side[scope].push({ label: display, ports, verdict });
    added = true;
  }

  for (const cidr of cidrs ?? []) {
    side.outside.push({ label: cidr, ports, verdict });
    added = true;
  }
  for (const cs of cidrSets ?? []) {
    const except = cs.except?.length ? ` (except ${cs.except.join(', ')})` : '';
    side.outside.push({ label: `${cs.cidr}${except}`, ports, verdict });
    added = true;
  }
  for (const entity of entities ?? []) {
    const scope = entityScope(entity);
    side[scope].push({ label: entity, ports, verdict });
    added = true;
  }
  for (const fqdn of fqdns ?? []) {
    const label = fqdn.matchName ?? fqdn.matchPattern ?? 'FQDN';
    side.outside.push({ label, ports, verdict });
    added = true;
  }
  for (const svc of services ?? []) {
    const labels = flattenLabels(svc);
    side.cluster.push({ label: endpointLabel(labels) || 'Service', ports, verdict });
    added = true;
  }

  // Rule with only ports (no peers) means "any peer" with port restriction
  if (!added && ports) {
    side.outside.push({ label: 'Any endpoint', ports, verdict });
    side.namespace.push({ label: 'Any endpoint', ports, verdict });
    side.cluster.push({ label: 'Any endpoint', ports, verdict });
  }
}

export function buildPolicyGraph(
  spec: CiliumNetworkPolicySpec | undefined,
  ownNamespace: string | undefined,
): PolicyGraphData {
  const selectorLabels = flattenLabels(spec?.endpointSelector);
  const selectorExpressions = getMatchExpressions(spec?.endpointSelector);
  const selectorLines: string[] = [
    ...Object.entries(selectorLabels).map(([k, v]) => `${k}=${v}`),
    ...selectorExpressions.map(formatExpression),
  ];
  const selectorEmpty = selectorLines.length === 0;

  const ingress: GraphSide = { outside: [], namespace: [], cluster: [] };
  const egress: GraphSide = { outside: [], namespace: [], cluster: [] };

  for (const r of spec?.ingress ?? []) processRule(r, ingress, 'from', ownNamespace, 'allow');
  for (const r of spec?.ingressDeny ?? []) processRule(r, ingress, 'from', ownNamespace, 'deny');
  for (const r of spec?.egress ?? []) processRule(r, egress, 'to', ownNamespace, 'allow');
  for (const r of spec?.egressDeny ?? []) processRule(r, egress, 'to', ownNamespace, 'deny');

  const hasIngressRules =
    (spec?.ingress?.length ?? 0) > 0 || (spec?.ingressDeny?.length ?? 0) > 0;
  const hasEgressRules =
    (spec?.egress?.length ?? 0) > 0 || (spec?.egressDeny?.length ?? 0) > 0;

  const ingressDefault: PolicyVerdict =
    spec?.enableDefaultDeny?.ingress === false
      ? 'allow'
      : spec?.enableDefaultDeny?.ingress === true || hasIngressRules
        ? 'deny'
        : 'allow';
  const egressDefault: PolicyVerdict =
    spec?.enableDefaultDeny?.egress === false
      ? 'allow'
      : spec?.enableDefaultDeny?.egress === true || hasEgressRules
        ? 'deny'
        : 'allow';

  // Fill defaults
  fillDefaults(ingress, ingressDefault, 'ingress');
  fillDefaults(egress, egressDefault, 'egress');

  return {
    selectorLines,
    selectorEmpty,
    ingressDefault,
    egressDefault,
    ingress,
    egress,
  };
}

function fillDefaults(side: GraphSide, def: PolicyVerdict, direction: 'ingress' | 'egress') {
  if (def === 'allow') {
    if (side.outside.length === 0) {
      side.outside.push({ label: 'Any endpoint', verdict: 'allow' });
    }
    if (side.namespace.length === 0) {
      side.namespace.push({ label: 'Everything in the cluster', verdict: 'allow' });
    }
    if (side.cluster.length === 0) {
      side.cluster.push({ label: 'Everything in the cluster', verdict: 'allow' });
    }
  } else {
    // default deny
    if (side.outside.length === 0) {
      side.outside.push({ label: 'Any endpoint', verdict: 'deny' });
    } else {
      side.outside.push({ label: 'Rest of the traffic', verdict: 'deny' });
    }
    if (side.namespace.length === 0) {
      side.namespace.push({ label: 'Everything in the cluster', verdict: 'deny' });
    } else {
      side.namespace.push({ label: 'Rest of the traffic', verdict: 'deny' });
    }
    if (side.cluster.length === 0) {
      side.cluster.push({ label: 'Everything in the cluster', verdict: 'deny' });
    } else {
      side.cluster.push({ label: 'Rest of the traffic', verdict: 'deny' });
    }
    if (direction === 'egress') {
      side.cluster.push({ label: 'Kubernetes DNS', verdict: 'deny' });
    }
  }
}
