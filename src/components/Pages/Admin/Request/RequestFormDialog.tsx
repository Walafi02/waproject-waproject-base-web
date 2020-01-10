import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useModel from 'hooks/useModel';
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import { useCallbackObservable } from 'react-use-observable';
import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import requestService from 'services/request';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import FormValidation from '@react-form-fields/material-ui/components/FormValidation';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FieldText from '@react-form-fields/material-ui/components/Text';

import IRequest from 'interfaces/models/request';

import React, { memo, useState, Fragment, useCallback } from 'react';

interface IProps {
  opened: boolean;
  request?: IRequest;
  onComplete: (request: IRequest) => void;
  onCancel: () => void;
}

const useStyle = makeStyles({
  content: {
    width: 400,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const RequestFormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const [model, setModelProp, setModel, ,] = useModel<IRequest>();
  const [loading, setLoading] = useState<boolean>(false);
  const handleEnter = useCallback(() => {
    setModel({ ...(props.request || {}) });
  }, [props.request, setModel]);

  const [onSubmit] = useCallbackObservable(
    (isValid: boolean) => {
      return of(isValid).pipe(
        filter(isValid => isValid),
        tap(() => setLoading(true)),
        switchMap(() => requestService.save(model as IRequest)),
        tap(
          request => {
            Toast.show(`O pedido ${request.description} foi salvo`);
            props.onComplete(request);
            setLoading(false);
          },
          err => {
            Toast.error(err);
            setLoading(false);
          }
        ),
        logError()
      );
    },
    [model]
  );

  return (
    <Dialog open={props.opened} disableBackdropClick disableEscapeKeyDown onEnter={handleEnter}>
      {loading && <LinearProgress color='secondary' />}

      <FormValidation onSubmit={onSubmit}>
        <DialogTitle>{model.id ? 'Editar' : 'Novo'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>
          <Fragment>
            <FieldText
              label='Descrição'
              disabled={loading}
              value={model.description}
              validation='required|min:3|max:1000'
              onChange={setModelProp('description', (model, v) => (model.description = v))}
            />
            <FieldText
              label='Quantidade'
              type='number'
              disabled={loading}
              value={model.amount}
              validation='required'
              onChange={setModelProp('amount', (model, v) => (model.amount = v))}
            />

            <FieldText
              label='Valor'
              type='text'
              mask='money'
              disabled={loading}
              value={model.price}
              validation='required'
              onChange={setModelProp('price', (model, v) => (model.price = v))}
            />
          </Fragment>
        </DialogContent>

        <DialogActions>
          <Button onClick={props.onCancel}>Cancelar</Button>
          <Button color='primary' type='submit' disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </FormValidation>
    </Dialog>
  );
});

export default RequestFormDialog;
