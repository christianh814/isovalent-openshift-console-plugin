import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Button,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { K8sModel, K8sResourceCommon, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { useIsovalentTranslation } from '@utils/hooks/useIsovalentTranslation';

type PolicyActionsKebabProps = {
  obj: K8sResourceCommon;
  model: K8sModel;
};

const PolicyActionsKebab: React.FC<PolicyActionsKebabProps> = ({ obj, model }) => {
  const { t } = useIsovalentTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSelect = () => setIsOpen(false);

  const editPath = (() => {
    const ns = obj.metadata?.namespace;
    const name = obj.metadata?.name;
    const gvk = `${model.apiGroup}~${model.apiVersion}~${model.kind}`;
    if (model.namespaced && ns) {
      return `/k8s/ns/${ns}/${gvk}/${name}/yaml`;
    }
    return `/k8s/cluster/${gvk}/${name}/yaml`;
  })();

  const onEdit = () => {
    setIsOpen(false);
    window.location.href = editPath;
  };

  const onDeleteClick = () => {
    setIsOpen(false);
    setError(null);
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await k8sDelete({ model, resource: obj });
      setConfirmOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={setIsOpen}
        popperProps={{ position: 'right' }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            aria-label={t('Actions')}
            variant="plain"
            onClick={() => setIsOpen((v) => !v)}
            isExpanded={isOpen}
          >
            <EllipsisVIcon />
          </MenuToggle>
        )}
      >
        <DropdownList>
          <DropdownItem key="edit" onClick={onEdit}>
            {t('Edit Policy')}
          </DropdownItem>
          <DropdownItem key="delete" onClick={onDeleteClick}>
            {t('Delete Policy')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <Modal
        variant={ModalVariant.small}
        isOpen={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
      >
        <ModalHeader title={t('Delete {{kind}}?', { kind: model.kind })} />
        <ModalBody>
          <p>
            {t('Are you sure you want to delete {{name}}? This cannot be undone.', {
              name: obj.metadata?.name ?? '',
            })}
          </p>
          {error && (
            <p
              style={{
                color: 'var(--pf-t--global--text--color--status--danger--default, #c9190b)',
              }}
            >
              {error}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="danger"
            onClick={onConfirmDelete}
            isLoading={deleting}
            isDisabled={deleting}
          >
            {t('Delete')}
          </Button>
          <Button
            key="cancel"
            variant="link"
            onClick={() => setConfirmOpen(false)}
            isDisabled={deleting}
          >
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PolicyActionsKebab;
