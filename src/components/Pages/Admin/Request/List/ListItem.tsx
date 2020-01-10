import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import IRequest from 'interfaces/models/request';
import { IOption } from 'components/Shared/DropdownMenu';
import DeleteIcon from 'mdi-react/DeleteIcon';
import EditIcon from 'mdi-react/EditIcon';
import ShowIcon from 'mdi-react/ShowIcon';
import { useCallbackObservable } from 'react-use-observable';
import Alert from 'components/Shared/Alert';
import { filter, switchMap, tap } from 'rxjs/operators';
import { logError } from 'helpers/rxjs-operators/logError';
import Toast from 'components/Shared/Toast';
import { from } from 'rxjs';
import requestService from 'services/request';

import React, { memo, useMemo, useCallback, useState } from 'react';

interface IProps {
  request: IRequest;
  onEdit: (request: IRequest) => void;
  onDeleteComplete: () => void;
  onView: (request: IRequest) => void;
}

const ListItem = memo((props: IProps) => {
  const { request, onEdit, onDeleteComplete, onView } = props;

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDismissError = useCallback(() => setError(null), []);

  const handleEdit = useCallback(() => {
    onEdit(request);
  }, [onEdit, request]);

  const handleView = useCallback(() => {
    onView(request);
  }, [onView, request]);

  const [handleDelete] = useCallbackObservable(() => {
    return from(Alert.confirm('Deseja excluir esse pedido?')).pipe(
      filter(ok => ok),
      tap(() => setLoading(true)),
      switchMap(() => requestService.delete(request.id)),
      logError(),
      tap(
        () => {
          Toast.show('O podido foi removido');
          setLoading(true);
          setDeleted(true);
          onDeleteComplete();
        },
        error => {
          setLoading(false);
          setError(error);
        }
      )
    );
  }, []);

  const options = useMemo<IOption[]>(() => {
    return [
      { text: 'Ver', icon: ShowIcon, handler: handleView },
      { text: 'Editar', icon: EditIcon, handler: handleEdit },
      { text: 'Excluir', icon: DeleteIcon, handler: handleDelete }
    ];
  }, [handleDelete, handleEdit, handleView]);

  if (deleted) {
    return null;
  }
  return (
    <TableRow>
      <TableCell>{request.description}</TableCell>
      <TableCell>{request.amount}</TableCell>
      <TableCell>{request.price}</TableCell>
      <TableCellActions options={options} loading={loading} error={error} onDismissError={handleDismissError} />
    </TableRow>
  );
});

export default ListItem;
