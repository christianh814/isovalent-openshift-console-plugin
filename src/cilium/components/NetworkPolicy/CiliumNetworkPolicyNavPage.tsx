import * as React from 'react';
import {
  HorizontalNav,
  K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { CiliumNetworkPolicyModel } from '@cilium-models/CiliumNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import CiliumNetworkPolicyDetailsTab from './CiliumNetworkPolicyDetailsTab';
import CiliumNetworkPolicyGraphTab from './CiliumNetworkPolicyGraphTab';
import ResourceYAMLTab from '@utils/components/ResourceYAMLTab/ResourceYAMLTab';
import StatusTab from '@utils/components/StatusTab/StatusTab';
import ResourceHeader from '@utils/components/ResourceHeader/ResourceHeader';

type CiliumNetworkPolicyNavPageProps = {
  name: string;
  namespace: string;
  kind: string;
};

const CiliumNetworkPolicyNavPage: React.FC<CiliumNetworkPolicyNavPageProps> = ({
  name,
  namespace,
  kind,
}) => {
  const { t } = useIsovalentTranslation();

  const [policy, loaded] = useK8sWatchResource<K8sResourceCommon>({
    groupVersionKind: {
      group: CiliumNetworkPolicyModel.apiGroup,
      version: CiliumNetworkPolicyModel.apiVersion,
      kind: CiliumNetworkPolicyModel.kind,
    },
    kind,
    name,
    namespace,
  });

  const pages = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: CiliumNetworkPolicyDetailsTab,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: ResourceYAMLTab,
      },
      {
        href: 'graph',
        name: t('Policy Graph'),
        component: CiliumNetworkPolicyGraphTab,
      },
      {
        href: 'status',
        name: t('Status'),
        component: StatusTab,
      },
    ],
    [t],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <>
      <ResourceHeader model={CiliumNetworkPolicyModel} name={name} namespace={namespace} />
      <HorizontalNav pages={pages} resource={policy} />
    </>
  );
};

export default CiliumNetworkPolicyNavPage;
