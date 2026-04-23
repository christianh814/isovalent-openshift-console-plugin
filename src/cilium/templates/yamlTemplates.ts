export const defaultCiliumNetworkPolicyYamlTemplate = `apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: example
  namespace: default
spec:
  description: "Example CiliumNetworkPolicy"
  endpointSelector:
    matchLabels:
      app: example
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend
      toPorts:
        - ports:
            - port: "80"
              protocol: TCP
`;

export const defaultCiliumClusterwideNetworkPolicyYamlTemplate = `apiVersion: cilium.io/v2
kind: CiliumClusterwideNetworkPolicy
metadata:
  name: example
spec:
  description: "Example CiliumClusterwideNetworkPolicy"
  endpointSelector:
    matchLabels:
      app: example
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend
      toPorts:
        - ports:
            - port: "80"
              protocol: TCP
`;
