# Implementation Order Recommendation

To merge UI and logic efficiently, implement page by page in this order:

---

## 1. **Home Page (`pages/Home.tsx`)**

- **Why first:**  
  - It's the dashboard and entry point for users.
  - Shows contract stats and quick links, so you can quickly verify wallet connection, contract fetching, and global state.
- **What to implement:**  
  - Replace mock stats with real data from contract services.
  - Show real contract counts, user info, and quick actions.

---

## 2. **Broadcast Contracts Page (`pages/Broadcast.tsx`)**

- **Why second:**  
  - Broadcast contracts are the simplest (no activation/user logic).
  - Good for validating contract list fetching, creation, and display.
- **What to implement:**  
  - Fetch and display real broadcast contracts.
  - Implement contract creation via service.
  - Remove mock data.

---

## 3. **Public Contracts Page (`pages/Public.tsx`)**

- **Why third:**  
  - Public contracts add activation/user logic.
  - Builds on patterns from broadcast page.
- **What to implement:**  
  - Fetch and display real public contracts.
  - Implement contract creation and activation.
  - Remove mock data.

---

## 4. **Private Contracts Page (`pages/Private.tsx`)**

- **Why fourth:**  
  - Private contracts add file encryption and more complex flows.
  - Builds on public contract logic.
- **What to implement:**  
  - Fetch and display real private contracts.
  - Implement contract creation, activation, and file upload/encryption.
  - Remove mock data.

---

## 5. **Contract View/Activate/Verify Pages (`pages/PublicView.tsx`, `pages/PublicActivate.jsx`, `pages/Verify.tsx`)**

- **Why last:**  
  - These pages depend on the contract data and flows being in place.
  - They require integration with file download, hash verification, and activation flows.
- **What to implement:**  
  - Show contract details, version history, and download links.
  - Implement activation and verification logic using services and hooks.

---

## General Steps for Each Page

1. Replace mock data with service calls.
2. Use context for wallet/global state.
3. Handle loading and error states.
4. Test UI with real blockchain data.
5. Refactor as needed for maintainability.

---

**Start with `Home.tsx`, then proceed as above for a smooth, incremental integration.**
