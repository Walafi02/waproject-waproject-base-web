export default interface IRequest {
  id?: number;
  userId?: number;
  description: string;
  amount: number;
  price: number;

  createdDate?: Date;
  updatedDate?: Date;
}
