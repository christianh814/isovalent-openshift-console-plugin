import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const CiliumNetworkPolicyModel: K8sModel = {
  label: 'CiliumNetworkPolicy',
  labelPlural: 'CiliumNetworkPolicies',
  apiVersion: 'v2',
  apiGroup: 'cilium.io',
  plural: 'ciliumnetworkpolicies',
  abbr: 'CNP',
  namespaced: true,
  kind: 'CiliumNetworkPolicy',
  id: 'ciliumnetworkpolicy',
  crd: true,
};

export interface CiliumPolicyPort {
  port?: string;
  protocol?: string;
}

export interface CiliumPolicyRule {
  fromEndpoints?: Record<string, unknown>[];
  fromCIDR?: string[];
  fromCIDRSet?: Array<{ cidr: string; except?: string[] }>;
  fromRequires?: Record<string, unknown>[];
  fromEntities?: string[];
  toEndpoints?: Record<string, unknown>[];
  toCIDR?: string[];
  toCIDRSet?: Array<{ cidr: string; except?: string[] }>;
  toRequires?: Record<string, unknown>[];
  toServices?: Record<string, unknown>[];
  toEntities?: string[];
  toFQDNs?: Array<{ matchName?: string; matchPattern?: string }>;
  toPorts?: Array<{
    ports?: CiliumPolicyPort[];
    rules?: Record<string, unknown>;
  }>;
}

export interface CiliumNetworkPolicySpec {
  description?: string;
  endpointSelector?: Record<string, unknown>;
  nodeSelector?: Record<string, unknown>;
  ingress?: CiliumPolicyRule[];
  ingressDeny?: CiliumPolicyRule[];
  egress?: CiliumPolicyRule[];
  egressDeny?: CiliumPolicyRule[];
  enableDefaultDeny?: {
    egress?: boolean;
    ingress?: boolean;
  };
  labels?: Array<{
    key: string;
    source?: string;
    value?: string;
  }>;
  specs?: CiliumNetworkPolicySpec[];
}

export interface CiliumNetworkPolicyStatus {
  nodes?: Record<string, {
    lastUpdated?: string;
    ok?: boolean;
    error?: string;
    localPolicyRevision?: number;
    enforcing?: boolean;
    annotations?: Record<string, string>;
  }>;
  derivativePolicies?: Record<string, {
    lastUpdated?: string;
    ok?: boolean;
    error?: string;
  }>;
}

export interface CiliumNetworkPolicyKind extends K8sResourceCommon {
  spec?: CiliumNetworkPolicySpec;
  status?: CiliumNetworkPolicyStatus;
}
