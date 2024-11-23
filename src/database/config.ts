import { createRxDatabase, RxDatabase, RxCollection, addRxPlugin } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { accountSchema, transactionSchema, budgetSchema, investmentSchema, goalSchema } from './schemas';

// Add plugins
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

// Type definitions for collections
interface AccountDocType {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
  balance: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

interface TransactionDocType {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description?: string;
  category?: string;
  date: number;
  createdAt: number;
  updatedAt: number;
}

interface BudgetDocType {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
  startDate: number;
  endDate: number;
  createdAt: number;
  updatedAt: number;
}

interface InvestmentDocType {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'crypto' | 'other';
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: number;
  createdAt: number;
  updatedAt: number;
}

interface GoalDocType {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

// Database interface
export interface DatabaseCollections {
  accounts: RxCollection<AccountDocType>;
  transactions: RxCollection<TransactionDocType>;
  budgets: RxCollection<BudgetDocType>;
  investments: RxCollection<InvestmentDocType>;
  goals: RxCollection<GoalDocType>;
}

export type MaraudersMoney = RxDatabase<DatabaseCollections>;

let dbInstance: MaraudersMoney | null = null;
let initPromise: Promise<MaraudersMoney> | null = null;

export const createDatabase = async (): Promise<MaraudersMoney> => {
  // If we already have a database instance, return it
  if (dbInstance) {
    return dbInstance;
  }

  // If we're already initializing, return the existing promise
  if (initPromise) {
    return initPromise;
  }

  // Create a new initialization promise
  initPromise = (async () => {
    try {
      console.log('Creating database...');
      const db = await createRxDatabase<DatabaseCollections>({
        name: 'maraudersmoney',
        storage: getRxStorageMemory(),
        multiInstance: false,
        eventReduce: true,
        ignoreDuplicate: true,
        cleanupPolicy: {
          minimumCollectionAge: 1000 * 60 * 60 * 24 // 24 hours
        }
      });
      console.log('Database created successfully');

      console.log('Adding collections...');
      await db.addCollections({
        accounts: {
          schema: accountSchema
        },
        transactions: {
          schema: transactionSchema
        },
        budgets: {
          schema: budgetSchema
        },
        investments: {
          schema: investmentSchema
        },
        goals: {
          schema: goalSchema
        }
      });
      console.log('Collections added successfully');

      dbInstance = db;
      return db;
    } catch (error) {
      console.error('Failed to create database:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      initPromise = null; // Reset the promise on error
      throw error;
    }
  })();

  return initPromise;
};

export const destroyDatabase = async () => {
  if (dbInstance) {
    try {
      await dbInstance.destroy();
      dbInstance = null;
      initPromise = null;
      console.log('Database destroyed successfully');
    } catch (error) {
      console.error('Error destroying database:', error);
      throw error;
    }
  }
};
