# Isovalent OpenShift Console Plugin

A dynamic OpenShift Console plugin that adds first-class views for Cilium network policies. It exposes an **Isovalent** navigation section in the admin perspective with dedicated pages for `CiliumNetworkPolicy` and `CiliumClusterwideNetworkPolicy`. Each resource gets a Details, YAML, and Status tab which includes a sortable conditions table and inline links to Isovalent Hubble Timescape for traffic visualization.

## Quickstart

Install the plugin into your OpenShift cluster with Helm. The `plugin.hubbleUrl` is optional. When set, the plugin renders an inline deep link to your Hubble UI; when unset, the link is hidden. Expose the URL of your Hubble UI however makes the most sense for your environment.

Example:

```bash
oc -n cilium create route edge  hubble --service hubble-timescape --port ui
```

Once your Hubble UI is exposed via an OpenShift `Route`, you can derive the URL inline with:

```bash
helm upgrade -i isovalent-openshift-console-plugin \
  oci://ghcr.io/christianh814/charts/isovalent-openshift-console-plugin --version 0.1.17 \
  -n isovalent-openshift-console-plugin --create-namespace \
  --set plugin.hubbleUrl=https://$(oc get route -n cilium hubble -o jsonpath='{.spec.host}')
```

After the install completes, refresh the OpenShift Console; the **Isovalent** section appears in the admin nav.

## Helm Values

| Key | Default | Description |
| --- | --- | --- |
| `plugin.image` | `quay.io/christianh814/isovalent-openshift-console-plugin:v0.0.18` | Plugin container image. |
| `plugin.hubbleUrl` | `""` | Base URL of your Isovalent Hubble Timescape / Hubble UI. Optional — when unset, the deep link is hidden. |
| `plugin.imagePullPolicy` | `IfNotPresent` | Image pull policy for the plugin container. |
| `plugin.imagePullSecrets` | `[]` | List of image pull secrets. |
| `plugin.replicas` | `2` | Replica count for the plugin Deployment. |
| `plugin.port` | `9443` | TLS port the plugin serves on. |
| `plugin.basePath` | `/` | Base path used by the `ConsolePlugin` backend service config. |
| `plugin.certificateSecretName` | `""` | Existing TLS Secret name. Defaults to `<release>-cert` when empty. |
| `plugin.resources` | `requests: { cpu: 10m, memory: 50Mi }` | Resource requests/limits for the plugin pod. |
| `plugin.podSecurityContext` | `runAsNonRoot: true`, `seccompProfile.type: RuntimeDefault` | Pod-level security context. |
| `plugin.containerSecurityContext` | `allowPrivilegeEscalation: false`, `capabilities.drop: [ALL]` | Container-level security context. |
| `plugin.serviceAccount.create` | `true` | Create the plugin ServiceAccount. |
| `plugin.patcherServiceAccount.create` | `true` | Create the ServiceAccount used to patch the `Console` operator CR. |
| `plugin.jobs.patchConsoles.enabled` | `true` | Run the post-install Job that registers the plugin with the Console operator. |
| `plugin.jobs.patchConsoles.image` | `registry.redhat.io/openshift4/ose-tools-rhel9@sha256:ee65b244...` | Image used by the patcher Job. |

See [`charts/openshift-console-plugin/values.yaml`](charts/openshift-console-plugin/values.yaml) for the full schema.

## OpenShift Dynamic Plugin Template

This is based on the OpenShift dynamic plugin template, see [openshift-console-template-readme.md](openshift-console-template-readme.md) for the original template documentation, including local development and i18n workflows.
