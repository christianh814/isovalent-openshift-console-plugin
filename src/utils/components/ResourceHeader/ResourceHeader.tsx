import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  PageBreadcrumb,
  PageSection,
} from '@patternfly/react-core';
import { ResourceIcon, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

type ResourceHeaderProps = {
  model: K8sModel;
  name: string;
  namespace?: string;
};

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ model, name, namespace }) => {
  const gvk = `${model.apiGroup}~${model.apiVersion}~${model.kind}`;
  const listPath = model.namespaced
    ? namespace
      ? `/k8s/ns/${namespace}/${gvk}`
      : `/k8s/all-namespaces/${gvk}`
    : `/k8s/cluster/${gvk}`;

  return (
    <>
      <PageBreadcrumb>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={listPath}>{model.label}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{model.label} details</BreadcrumbItem>
        </Breadcrumb>
      </PageBreadcrumb>
      <PageSection>
        <h1
          className="pf-v6-c-title pf-m-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}
        >
          <ResourceIcon kind={gvk} />
          <span>{name}</span>
        </h1>
      </PageSection>
    </>
  );
};

export default ResourceHeader;


