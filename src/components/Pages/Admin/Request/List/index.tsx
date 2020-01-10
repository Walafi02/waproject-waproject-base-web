import CardLoader from 'components/Shared/CardLoader';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Toolbar from 'components/Layout/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableWrapper from 'components/Shared/TableWrapper';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import TableCellSortable from 'components/Shared/Pagination/TableCellSortable';
import TablePagination from 'components/Shared/Pagination/TablePagination';
import usePaginationObservable from 'hooks/usePagination';
import RefreshIcon from 'mdi-react/RefreshIcon';
import CardContent from '@material-ui/core/CardContent';
import EmptyAndErrorMessages from 'components/Shared/Pagination/EmptyAndErrorMessages';

import requestService from 'services/request';
import ListItem from './ListItem';

import RequestFormDialog from '../RequestFormDialog';
import RequestView from '../RequestView';
import IRequest from 'interfaces/models/request';

import React, { Fragment, memo, useCallback, useState } from 'react';

const UserListPage = memo(() => {
  const [showOpened, setShowOpened] = useState(false);
  const [formOpened, setFormOpened] = useState(false);
  const [current, setCurrent] = useState();

  const handleEdit = useCallback((current: IRequest) => {
    setCurrent(current);
    setFormOpened(true);
  }, []);

  const handleShow = useCallback((current: IRequest) => {
    setCurrent(current);
    setShowOpened(true);
  }, []);

  const [params, mergeParams, loading, data, error, , refresh] = usePaginationObservable(
    params => requestService.list(params),
    { orderBy: 'description', orderDirection: 'asc' },
    []
  );

  const formCallback = useCallback(
    (request?: IRequest) => {
      setFormOpened(false);
      current ? refresh() : mergeParams({ term: request.description });
    },
    [current, mergeParams, refresh]
  );

  const handleCreate = useCallback(() => {
    setCurrent({ description: null, amount: 0, price: 0 });
    setFormOpened(true);
  }, []);

  const formCancel = useCallback(() => setFormOpened(false), []);
  const viewClose = useCallback(() => setShowOpened(false), []);
  const handleRefresh = useCallback(() => refresh(), [refresh]);

  const { total, results } = data || ({ total: 0, results: [] } as typeof data);

  return (
    <Fragment>
      <Toolbar title='Pedidos' />

      <Card>
        <RequestFormDialog opened={formOpened} request={current} onComplete={formCallback} onCancel={formCancel} />
        <RequestView opened={showOpened} request={current} onClose={viewClose} />

        <CardLoader show={loading} />
        <CardContent>
          <Grid container justify='flex-end' alignItems='center'>
            <Grid item xs={12} sm={'auto'}>
              <Button fullWidth variant='contained' color='primary' onClick={handleCreate}>
                Adicionar
              </Button>
            </Grid>
          </Grid>
        </CardContent>

        <TableWrapper minWidth={500}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCellSortable
                  paginationParams={params}
                  disabled={loading}
                  onChange={mergeParams}
                  column='description'
                >
                  Descrição
                </TableCellSortable>

                <TableCellSortable paginationParams={params} disabled={loading} onChange={mergeParams} column='amount'>
                  Quantidade
                </TableCellSortable>
                <TableCellSortable paginationParams={params} disabled={loading} onChange={mergeParams} column='price'>
                  Valor
                </TableCellSortable>
                <TableCellActions>
                  <IconButton disabled={loading} onClick={handleRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </TableCellActions>
              </TableRow>
            </TableHead>
            <TableBody>
              <EmptyAndErrorMessages
                colSpan={3}
                error={error}
                loading={loading}
                hasData={results.length > 0}
                onTryAgain={refresh}
              />
              {results.map(request => (
                <ListItem
                  key={request.id}
                  request={request}
                  onEdit={handleEdit}
                  onDeleteComplete={refresh}
                  onView={handleShow}
                />
              ))}
            </TableBody>
          </Table>
        </TableWrapper>

        <TablePagination total={total} disabled={loading} paginationParams={params} onChange={mergeParams} />
      </Card>
    </Fragment>
  );
});

export default UserListPage;
