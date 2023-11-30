import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Banner, Field, useModal, useForm, Switch } from '@kubed/components';

import { Group, Pen, Trash } from '@kubed/icons';
import { DataTable, useCommonActions, useActionMenu, getOriginData } from '@ks-console/shared';
import { constraintTemplateStore } from '../../store';
import FORM_TEMPLATES from '../../utils/form.templates';
import CreateConstraintTemplateModal from '../../components/Modal/CreateContraintTemplateModal';

const ConstraintTemplateList = () => {
  const { cluster } = useParams();
  const params = useParams();
  const templateRef = useRef();
  const requestTemplatePrefix = '/apis/templates.gatekeeper.sh/v1';
  const [form] = useForm();
  const [createVisible, setCreateVisible] = useState(false);
  const module = constraintTemplateStore.module;
  const formTemplate = FORM_TEMPLATES[module]();
  const formatFn = data => {
    return {
      name: data.metadata.name,
      _originData: getOriginData(data),
      ...data,
    };
  };
  function formatServerData(serverData) {
    return {
      ...serverData,
      items: serverData.items,
      totalItems: serverData.items.length,
    };
  }

  const callback = () => {
    templateRef?.current?.refetch();
  };

  const { editYaml, del } = useCommonActions({
    store: constraintTemplateStore,
    params: { cluster },
    callback: callback,
  });

  const renderItemActions = useActionMenu({
    authKey: 'constrainttemplates',
    params: { cluster: cluster },
    actions: [
      {
        key: 'editYaml',
        icon: <Pen />,
        text: t('EDIT_YAML'),
        action: 'edit',
        onClick: editYaml,
      },
      {
        key: 'delete',
        icon: <Trash />,
        text: t('DELETE'),
        action: 'delete',
        onClick: del,
      },
    ],
  });

  const columns = [
    {
      title: t('Name'),
      field: 'metadata.name',
      sortable: false,
      searchable: false,
      render: (value, row) => (
        <Field
          value={value}
          label={row.target}
          as={Link}
          to={`/clusters/${cluster}/gatekeeper.constrainttemplates/${row.metadata.name}`}
        />
      ),
    },
    {
      title: t('Description'),
      width: '70%',
      canHide: true,
      render: (value, row) => (
        <Field
          value={
            row.metadata.annotations['kubesphere.io/description'] == undefined
              ? '-'
              : row.metadata.annotations['kubesphere.io/description']
          }
        />
      ),
    },
    {
      id: 'more',
      title: '',
      width: 20,
      render: (value, record) => renderItemActions({ ...record }),
    },
  ];

  const renderTableActions = useActionMenu({
    authKey: module,
    params,
    autoSingleButton: true,
    actions: [
      {
        key: 'create',
        text: t('CREATE'),
        action: 'create',
        props: {
          color: 'secondary',
          shadow: true,
        },
        onClick: () => {
          setCreateVisible(true);
        },
      },
    ],
  });

  const handleCreate = data => {
    constraintTemplateStore.post(cluster, data).then(() => {
      callback()
      setCreateVisible(false)
    });
  };

  return (
    <>
      <Banner
        icon={<Group />}
        title={t('Constraint Templates')}
        description={t('CONSTRAINT_TEMPLATES_DESC')}
        className="mb12"
      />
      <DataTable
        ref={templateRef}
        columns={columns}
        tableName="template-list"
        rowKey="name"
        format={formatFn}
        serverDataFormat={formatServerData}
        placeholder={t('SEARCH_BY_NAME')}
        url={`${requestTemplatePrefix}/constrainttemplates`}
        useStorageState={false}
        disableRowSelect={false}
        selectType={false}
        toolbarRight={renderTableActions({})}
      />
      {createVisible && (
        <CreateConstraintTemplateModal
          visible={createVisible}
          onOk={handleCreate}
          form={form}
          initialValues={formTemplate}
          onCancel={() => {
            setCreateVisible(false);
          }}
        />
      )}
    </>
  );
};

export default ConstraintTemplateList;
