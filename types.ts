export interface Transaction {
  [key: string]: string;
  category: string;
  id: string;
  'Comprador(a)': string;
  'Email do(a) Comprador(a)': string;
  'Data da transação': string;
  'Valor de compra com impostos': string;
  'Status da transação': string;
}

export interface Category {
  name: string;
  count: number;
}