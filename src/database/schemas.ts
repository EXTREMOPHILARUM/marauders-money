// Database schemas
export const accountSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { 
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    name: { 
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    type: { 
      type: 'string',
      enum: ['checking', 'savings', 'credit', 'investment', 'other'],
      maxLength: 20
    },
    balance: { 
      type: 'number',
      minimum: -1000000000,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currency: { 
      type: 'string',
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]{3}$'
    },
    institution: {
      type: 'string',
      maxLength: 100
    },
    notes: {
      type: 'string',
      maxLength: 500
    },
    createdAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    updatedAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
  },
  required: ['id', 'name', 'type', 'balance', 'currency'],
  indexes: ['type', 'createdAt']
};

export const transactionSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    accountId: {
      type: 'string',
      maxLength: 100,
      ref: 'accounts'
    },
    type: {
      type: 'string',
      enum: ['income', 'expense', 'transfer'],
      maxLength: 20
    },
    amount: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]{3}$'
    },
    description: {
      type: 'string',
      maxLength: 500
    },
    category: {
      type: 'string',
      maxLength: 100
    },
    date: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    createdAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    updatedAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
  },
  required: ['id', 'accountId', 'type', 'amount', 'currency', 'date'],
  indexes: ['accountId', 'type', 'date']
};

export const budgetSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    amount: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]{3}$'
    },
    period: {
      type: 'string',
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      maxLength: 20
    },
    category: {
      type: 'string',
      maxLength: 100
    },
    startDate: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    endDate: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    createdAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    updatedAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
  },
  required: ['id', 'name', 'amount', 'currency', 'period', 'startDate', 'endDate'],
  indexes: ['period', 'category']
};

export const investmentSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    type: {
      type: 'string',
      enum: ['stock', 'bond', 'crypto', 'other'],
      maxLength: 20
    },
    symbol: {
      type: 'string',
      maxLength: 20
    },
    quantity: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.00000001
    },
    purchasePrice: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currentPrice: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]{3}$'
    },
    purchaseDate: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    createdAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    updatedAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
  },
  required: ['id', 'name', 'type', 'quantity', 'purchasePrice', 'currency', 'purchaseDate'],
  indexes: ['type', 'symbol']
};

export const goalSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    targetAmount: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currentAmount: {
      type: 'number',
      minimum: 0,
      maximum: 1000000000,
      multipleOf: 0.01
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      pattern: '^[A-Z]{3}$'
    },
    deadline: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    category: {
      type: 'string',
      enum: ['savings', 'debt', 'investment', 'purchase', 'emergency', 'retirement'],
      maxLength: 20
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      maxLength: 10
    },
    notes: {
      type: 'string',
      maxLength: 500
    },
    status: {
      type: 'string',
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      maxLength: 20
    },
    createdAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
    updatedAt: { 
      type: 'number',
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999
    },
  },
  required: ['id', 'name', 'targetAmount', 'currency', 'deadline', 'category', 'priority'],
  indexes: ['status', 'deadline', 'category', 'priority']
};
