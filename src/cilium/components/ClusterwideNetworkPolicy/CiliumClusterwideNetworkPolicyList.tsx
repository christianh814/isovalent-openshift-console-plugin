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
import {
  CiliumClusterwideNetworkPolicyKind,
  CiliumClusterwideNetworkPolicyModel,
} from '@cilium-models/CiliumClusterwideNetworkPolicyModel';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';
import HubbleLink from '@utils/components/HubbleLink/HubbleLink';
import PolicyActionsKebab from '@utils/components/PolicyActionsKebab/PolicyActionsKebab';

const useColumns = (): TableColumn<CiliumClusterwideNetworkPolicyKind>[] => {
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

const CiliumClusterwideNetworkPolicyRow: React.FC<
  RowProps<CiliumClusterwideNetworkPolicyKind>
> = ({ obj, activeColumnIDs }) => {
  const ingressCount =
    (obj.spec?.ingress?.length ?? 0) + (obj.spec?.ingressDeny?.length ?? 0);
  const egressCount =
    (obj.spec?.egress?.length ?? 0) + (obj.spec?.egressDeny?.length ?? 0);

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={{
            group: CiliumClusterwideNetworkPolicyModel.apiGroup,
            version: CiliumClusterwideNetworkPolicyModel.apiVersion,
            kind: CiliumClusterwideNetworkPolicyModel.kind,
          }}
          name={obj.metadata.name}
        />
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
        <PolicyActionsKebab obj={obj} model={CiliumClusterwideNetworkPolicyModel} />
      </TableData>
    </>
  );
};

type CiliumClusterwideNetworkPolicyListProps = {
  hideNameLabelFilters?: boolean;
  showTitle?: boolean;
};

const CiliumClusterwideNetworkPolicyList: React.FC<CiliumClusterwideNetworkPolicyListProps> = ({
  hideNameLabelFilters,
  showTitle,
}) => {
  const { t } = useIsovalentTranslation();

  const [policies, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    groupVersionKind: {
      group: CiliumClusterwideNetworkPolicyModel.apiGroup,
      version: CiliumClusterwideNetworkPolicyModel.apiVersion,
      kind: CiliumClusterwideNetworkPolicyModel.kind,
    },
    namespaced: false,
  });

  const columns = useColumns();
  const [data, filteredData, onFilterChange] = useListPageFilter(policies);

  const gvk = `${CiliumClusterwideNetworkPolicyModel.apiGroup}~${CiliumClusterwideNetworkPolicyModel.apiVersion}~${CiliumClusterwideNetworkPolicyModel.kind}`;

  return (
    <div>
      {showTitle !== false && (
        <ListPageHeader title={t('CiliumClusterwideNetworkPolicies')}>
          <ListPageCreate groupVersionKind={gvk}>
            {t('Create CiliumClusterwideNetworkPolicy')}
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
        <VirtualizedTable<CiliumClusterwideNetworkPolicyKind>
          data={filteredData as CiliumClusterwideNetworkPolicyKind[]}
          unfilteredData={data as CiliumClusterwideNetworkPolicyKind[]}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={CiliumClusterwideNetworkPolicyRow}
        />
      </ListPageBody>
    </div>
  );
};

export default CiliumClusterwideNetworkPolicyList;
