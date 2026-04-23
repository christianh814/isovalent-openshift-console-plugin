import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  CiliumNetworkPolicySpec,
  CiliumNetworkPolicyStatus,
} from './CiliumNetworkPolicyModel';

export const CiliumClusterwideNetworkPolicyModel: K8sModel = {
  label: 'CiliumClusterwideNetworkPolicy',
  labelPlural: 'CiliumClusterwideNetworkPolicies',
  apiVersion: 'v2',
  apiGroup: 'cilium.io',
  plural: 'ciliumclusterwidenetworkpolicies',
  abbr: 'CCNP',
  namespaced: false,
  kind: 'CiliumClusterwideNetworkPolicy',
  id: 'ciliumclusterwidenetworkpolicy',
  crd: true,
};

export interface CiliumClusterwideNetworkPolicyKind extends K8sResourceCommon {
  spec?: CiliumNetworkPolicySpec;
  status?: CiliumNetworkPolicyStatus;
}
