import IRequest from 'interfaces/models/request';
import { IPaginationParams, IPaginationResponse } from 'interfaces/pagination';
import { Observable } from 'rxjs';

import apiService, { ApiService } from './api';

export class RequestService {
  constructor(private apiService: ApiService) {}

  public list(params: IPaginationParams): Observable<IPaginationResponse<IRequest>> {
    return this.apiService.get('/requests', params);
  }

  public save(model: IRequest): Observable<IRequest> {
    const { price, amount } = model;
    return this.apiService.post('/requests', { ...model, price: Number(price), amount: Number(amount) });
  }

  public delete(id: number): Observable<void> {
    return this.apiService.delete(`/requests/${id}`);
  }
}

const requestService = new RequestService(apiService);
export default requestService;
