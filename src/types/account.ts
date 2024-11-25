export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  lastUpdated?: number;
}
