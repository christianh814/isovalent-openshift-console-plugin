import * as React from 'react';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  ResourceLink,
  RowProps,
  TableColumn,
  TableData,
  Timestamp,
  VirtualizedTable,
  useK8sWatchResource,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { CiliumNetworkPolicyKind, CiliumNetworkPolicyModel } from '@cilium-models/CiliumNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import HubbleLink from '@utils/components/HubbleLink/HubbleLink';
import PolicyActionsKebab from '@utils/components/PolicyActionsKebab/PolicyActionsKebab';

const useColumns = (): TableColumn<CiliumNetworkPolicyKind>[] => {
  const { t } = useIsovalentTranslation();
  return React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
      },
      {
        title: t('Namespace'),
        id: 'namespace',
        transforms: [sortable],
        sort: 'metadata.namespace',
      },
      {
        title: t('Description'),
        id: 'description',
      },
      {
        title: t('Ingress Rules'),
        id: 'ingress',
      },
      {
        title: t('Egress Rules'),
        id: 'egress',
      },
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        sort: 'metadata.creationTimestamp',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'pf-v6-c-table__action' },
      },
    ],
    [t],
  );
};

const CiliumNetworkPolicyRow: React.FC<RowProps<CiliumNetworkPolicyKind>> = ({
  obj,
  activeColumnIDs,
}) => {
  const ingressCount =
    (obj.spec?.ingress?.length ?? 0) + (obj.spec?.ingressDeny?.length ?? 0);
  const egressCount =
    (obj.spec?.egress?.length ?? 0) + (obj.spec?.egressDeny?.length ?? 0);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={{
            group: CiliumNetworkPolicyModel.apiGroup,
            version: CiliumNetworkPolicyModel.apiVersion,
            kind: CiliumNetworkPolicyModel.kind,
          }}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="description" activeColumnIDs={activeColumnIDs}>
        {obj.spec?.description ?? '—'}
      </TableData>
      <TableData id="ingress" activeColumnIDs={activeColumnIDs}>
        {ingressCount}
      </TableData>
      <TableData id="egress" activeColumnIDs={activeColumnIDs}>
        {egressCount}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData id="actions" activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action">
        <PolicyActionsKebab obj={obj} model={CiliumNetworkPolicyModel} />
      </TableData>
    </>
  );
};

type CiliumNetworkPolicyListProps = {
  namespace: string;
  hideNameLabelFilters?: boolean;
  showTitle?: boolean;
};

const CiliumNetworkPolicyList: React.FC<CiliumNetworkPolicyListProps> = ({
  namespace,
  hideNameLabelFilters,
  showTitle,
}) => {
  const { t } = useIsovalentTranslation();

  const [policies, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    groupVersionKind: {
      group: CiliumNetworkPolicyModel.apiGroup,
      version: CiliumNetworkPolicyModel.apiVersion,
      kind: CiliumNetworkPolicyModel.kind,
    },
    namespaced: true,
    namespace,
  });

  const columns = useColumns();
  const [data, filteredData, onFilterChange] = useListPageFilter(policies);

  const gvk = `${CiliumNetworkPolicyModel.apiGroup}~${CiliumNetworkPolicyModel.apiVersion}~${CiliumNetworkPolicyModel.kind}`;

  return (
    <div>
      {showTitle !== false && (
        <ListPageHeader title={t('CiliumNetworkPolicies')}>
          <ListPageCreate groupVersionKind={gvk}>
            {t('Create CiliumNetworkPolicy')}
          </ListPageCreate>
        </ListPageHeader>
      )}
      <ListPageBody>
        {!hideNameLabelFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ListPageFilter
                data={data}
                loaded={loaded}
                onFilterChange={onFilterChange}
              />
            </div>
            <div style={{ paddingRight: '1rem' }}>
              <HubbleLink />
            </div>
          </div>
        )}
        <VirtualizedTable<CiliumNetworkPolicyKind>
          data={filteredData as CiliumNetworkPolicyKind[]}
          unfilteredData={data as CiliumNetworkPolicyKind[]}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={CiliumNetworkPolicyRow}
        />
      </ListPageBody>
    </div>
  );
};

export default CiliumNetworkPolicyList;
