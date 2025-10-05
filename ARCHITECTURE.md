# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   React    │  │  Next.js   │  │   Service Worker    │   │
│  │ Components │  │   Pages    │  │  (Offline Support)  │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│         │              │                    │                │
│         └──────────────┴────────────────────┘                │
│                        │                                      │
│                   tRPC Client                                │
└────────────────────────┼─────────────────────────────────────┘
                         │
                    HTTP/JSON
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                   API LAYER (tRPC)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              tRPC Router (Type-Safe)                  │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────────┐     │   │
│  │  │  Group  │  │ Expense │  │  Balance/Settle  │     │   │
│  │  │  Router │  │  Router │  │     Router       │     │   │
│  │  └─────────┘  └─────────┘  └──────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │                                      │
│                   Prisma ORM                                 │
└────────────────────────┼─────────────────────────────────────┘
                         │
                    SQL Queries
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                  DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────────┐   │   │
│  │  │  User  │ │ Group  │ │ Expense │ │ Settlement │   │   │
│  │  └────────┘ └────────┘ └─────────┘ └────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. User Creates Expense

```
User Action (UI)
    ↓
CreateExpenseModal Component
    ↓
tRPC Client (api.expense.create.useMutation)
    ↓
HTTP POST /api/trpc/expense.create
    ↓
tRPC Server Middleware (Auth Check)
    ↓
Expense Router Handler
    ↓
Business Logic (Validation, Split Calculation)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response (Type-Safe)
    ↓
React Query Cache Update
    ↓
UI Re-render with New Data
```

### 2. Debt Simplification Flow

```
User Views Balances
    ↓
api.balance.getSimplifiedDebts.useQuery()
    ↓
Balance Router
    ↓
Fetch All Unsettled ExpenseSplits
    ↓
calculateGroupBalances()
    ↓
simplifyDebts() Algorithm
    │
    ├─ Calculate Net Balances
    ├─ Sort by Amount (Creditors/Debtors)
    ├─ Match Max Creditor with Max Debtor
    ├─ Create Simplified Transaction
    └─ Repeat Until Balanced
    ↓
Return Optimized Debt List
    ↓
Display in UI
```

## Data Models

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │◄─────┐
│ name        │      │
│ email       │      │
│ image       │      │
└─────────────┘      │
       │             │
       │ 1           │
       │             │
       │ N           │
       ▼             │
┌─────────────┐      │
│ GroupMember │      │
├─────────────┤      │
│ id          │      │
│ groupId     │──┐   │
│ userId      │──┘   │
│ role        │      │
└─────────────┘      │
       │             │
       │             │
       ▼             │
┌─────────────┐      │
│    Group    │      │
├─────────────┤      │
│ id          │◄─┐   │
│ name        │  │   │
│ description │  │   │
└─────────────┘  │   │
       │         │   │
       │ 1       │   │
       │         │   │
       │ N       │   │
       ▼         │   │
┌─────────────┐  │   │
│   Expense   │  │   │
├─────────────┤  │   │
│ id          │  │   │
│ description │  │   │
│ amount      │  │   │
│ groupId     │──┘   │
│ createdById │──────┘
└─────────────┘
       │
       │ 1
       │
       │ N
       ▼
┌──────────────┐
│ ExpenseSplit │
├──────────────┤
│ id           │
│ expenseId    │
│ paidById     │───┐
│ owedById     │───┤
│ amount       │   │
│ settled      │   │
└──────────────┘   │
                   │
                   ▼
            ┌─────────────┐
            │ Settlement  │
            ├─────────────┤
            │ id          │
            │ groupId     │
            │ fromId      │
            │ toId        │
            │ amount      │
            └─────────────┘
```

## Technology Stack Details

### Frontend Stack

```
┌─────────────────────────────────────┐
│         Next.js 14 (App Router)     │
│  ┌─────────────────────────────┐   │
│  │      React 18 Components     │   │
│  │  ┌────────────────────────┐ │   │
│  │  │   TypeScript (Strict)  │ │   │
│  │  └────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │    Tailwind CSS Styling     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  TanStack Query (State)     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Backend Stack

```
┌─────────────────────────────────────┐
│         tRPC API Layer              │
│  ┌─────────────────────────────┐   │
│  │    Type-Safe Procedures      │   │
│  │  ┌────────────────────────┐ │   │
│  │  │   Zod Validation       │ │   │
│  │  └────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      Prisma ORM             │   │
│  │  ┌────────────────────────┐ │   │
│  │  │   PostgreSQL DB        │ │   │
│  │  └────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      NextAuth.js            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### PWA Stack

```
┌─────────────────────────────────────┐
│         Progressive Web App         │
│  ┌─────────────────────────────┐   │
│  │    Service Worker (Workbox) │   │
│  │  ┌────────────────────────┐ │   │
│  │  │  Caching Strategies    │ │   │
│  │  │  - NetworkFirst        │ │   │
│  │  │  - CacheFirst          │ │   │
│  │  │  - StaleWhileRevalidate│ │   │
│  │  └────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │    Web App Manifest         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │    Offline Support          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User Submits Credentials
        ↓
2. NextAuth.js Credential Provider
        ↓
3. Validate & Find/Create User in DB
        ↓
4. Generate JWT Session Token
        ↓
5. Store in HTTP-Only Cookie
        ↓
6. Return Session to Client
        ↓
7. Include in Subsequent Requests
        ↓
8. tRPC Middleware Validates Session
        ↓
9. Attach User to Context
        ↓
10. Protected Procedures Execute
```

### Authorization Layers

```
┌─────────────────────────────────────┐
│     Request Authorization           │
│  ┌─────────────────────────────┐   │
│  │  1. Session Check            │   │
│  │     (Authenticated?)         │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  2. Group Membership Check   │   │
│  │     (Is user in group?)      │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  3. Role Check               │   │
│  │     (Admin/Member?)          │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  4. Resource Ownership       │   │
│  │     (Created by user?)       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Deployment Architecture

### Vercel Serverless

```
┌─────────────────────────────────────────────┐
│              Vercel Edge Network            │
│  ┌─────────────────────────────────────┐   │
│  │         CDN (Static Assets)          │   │
│  └─────────────────────────────────────┘   │
│                    ↓                        │
│  ┌─────────────────────────────────────┐   │
│  │      Next.js Serverless Functions   │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │  API Routes (tRPC)          │   │   │
│  │  └─────────────────────────────┘   │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │  SSR Pages                  │   │   │
│  │  └─────────────────────────────┘   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         External Services                   │
│  ┌─────────────────────────────────────┐   │
│  │  PostgreSQL Database                │   │
│  │  (Vercel Postgres/Supabase/Railway) │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Performance Optimizations

### 1. Database Query Optimization

```sql
-- Indexed fields for fast lookups
CREATE INDEX idx_group_members_user ON GroupMember(userId);
CREATE INDEX idx_group_members_group ON GroupMember(groupId);
CREATE INDEX idx_expenses_group ON Expense(groupId);
CREATE INDEX idx_expense_splits_expense ON ExpenseSplit(expenseId);
CREATE INDEX idx_expense_splits_settled ON ExpenseSplit(settled);
```

### 2. Caching Strategy

```
┌─────────────────────────────────────┐
│         Caching Layers              │
│  ┌─────────────────────────────┐   │
│  │  1. Browser Cache            │   │
│  │     (Service Worker)         │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  2. React Query Cache        │   │
│  │     (Client-side)            │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  3. CDN Cache                │   │
│  │     (Vercel Edge)            │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │  4. Database Connection Pool │   │
│  │     (Prisma)                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3. Code Splitting

```
Route-based splitting:
- /              → index.tsx bundle
- /group/[id]    → [id].tsx bundle
- /auth/signin   → signin.tsx bundle

Component lazy loading:
- Modals loaded on demand
- Heavy components code-split
```

## Algorithm: Debt Simplification

### Complexity Analysis

```
Time Complexity: O(n²)
Space Complexity: O(n)

Where n = number of people in the group
```

### Algorithm Steps

```python
def simplify_debts(balances):
    """
    Greedy algorithm to minimize transactions
    
    Input: List of {userId, amount} where:
           - amount > 0 means they are owed
           - amount < 0 means they owe
    
    Output: List of {from, to, amount} transactions
    """
    
    # 1. Filter non-zero balances
    non_zero = [b for b in balances if abs(b.amount) > 0.01]
    
    # 2. Initialize result
    transactions = []
    
    # 3. While there are unsettled balances
    while len(non_zero) > 1:
        # 4. Sort by amount (descending)
        non_zero.sort(key=lambda x: x.amount, reverse=True)
        
        # 5. Get max creditor and max debtor
        creditor = non_zero[0]      # Highest positive
        debtor = non_zero[-1]       # Lowest negative
        
        # 6. Calculate settlement amount
        amount = min(creditor.amount, abs(debtor.amount))
        
        # 7. Create transaction
        transactions.append({
            'from': debtor.userId,
            'to': creditor.userId,
            'amount': amount
        })
        
        # 8. Update balances
        creditor.amount -= amount
        debtor.amount += amount
        
        # 9. Remove settled balances
        if abs(creditor.amount) < 0.01:
            non_zero.remove(creditor)
        if abs(debtor.amount) < 0.01:
            non_zero.remove(debtor)
    
    return transactions
```

### Example

```
Initial State:
- Alice owes $30
- Bob is owed $10
- Charlie is owed $20

Without Simplification (2 transactions):
1. Alice → Bob: $10
2. Alice → Charlie: $20

With Simplification (2 transactions):
1. Alice → Charlie: $20
2. Alice → Bob: $10

(In this case, same number, but algorithm optimizes for more complex scenarios)

Complex Example:
- A owes $50
- B is owed $20
- C is owed $30
- D owes $10
- E is owed $10

Without: 6+ transactions
With Simplification: 3 transactions
```

## Scalability Considerations

### Current Architecture (Good for 1K-10K users)

```
- Serverless functions (auto-scaling)
- PostgreSQL (vertical scaling)
- CDN for static assets
- Client-side caching
```

### Future Scaling (10K-100K users)

```
1. Database:
   - Read replicas
   - Connection pooling (PgBouncer)
   - Partitioning by group

2. Caching:
   - Redis for session storage
   - Redis for frequently accessed data
   - CDN for API responses

3. API:
   - Rate limiting
   - Request queuing
   - Background jobs (Bull/BullMQ)

4. Real-time:
   - WebSocket server (Socket.io)
   - Pub/Sub for updates
```

### Enterprise Scale (100K+ users)

```
1. Microservices:
   - Separate services for groups, expenses, settlements
   - Message queue (RabbitMQ/Kafka)
   - Event-driven architecture

2. Database:
   - Sharding by group
   - Separate read/write databases
   - Time-series DB for analytics

3. Infrastructure:
   - Kubernetes orchestration
   - Load balancers
   - Auto-scaling policies
```

---

**This architecture is designed for production use with room to scale.**
