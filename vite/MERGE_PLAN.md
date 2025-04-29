# Plan for Merging UI and Logic

This plan outlines how to connect the UI components/pages with the contract and wallet logic, ensuring a clean, maintainable, and scalable architecture.

---

## 1. **Provider Layer**

- **Goal:** Ensure all components have access to wallet, global data, and contract logic.
- **Action:**  
  - Wrap the app with `DataProvider` and `WalletProvider` (already done in `main.tsx`).
  - Use React context (`useContext`) in components to access wallet status, provider, and global state.

---

## 2. **Service Layer**

- **Goal:** Abstract contract hook logic into service functions for each page type.
- **Action:**  
  - Implement service files in `src/services/` (e.g., `publicService.ts`, `privateService.ts`, etc.).
  - Each service will use the relevant contract hooks and expose functions for the UI (e.g., fetch contracts, create contract, activate, verify, etc.).
  - Services handle sequencing, error handling, and data transformation for the UI.

---

## 3. **Component Integration**

- **Goal:** UI components/pages use services and providers, not hooks directly.
- **Action:**  
  - In each page/component, import the relevant service and use its functions via hooks or props.
  - Use `useContext(WalletContext)` and `useContext(DataContext)` for wallet/global state.
  - Use service functions for all contract and blockchain interactions.
  - Pass loading, error, and data states from services to UI for feedback.

---

## 4. **UI Feedback and State**

- **Goal:** Provide clear feedback for loading, errors, and transaction status.
- **Action:**  
  - Use loading spinners, snackbars, and alerts in the UI (already started in `ConnectionPopup.jsx`).
  - Update UI state after contract actions (e.g., refresh balances after funding/withdrawal).
  - Disable buttons and show progress during async actions.

---

## 5. **Mock to Real Data Transition**

- **Goal:** Replace mock data with real contract/service calls.
- **Action:**  
  - Update components like `ShowContracts` to fetch contract lists from services instead of `mockHelpers.js`.
  - Gradually remove mock data as real logic is implemented and tested.

---

## 6. **Testing and Error Handling**

- **Goal:** Ensure robust error handling and user experience.
- **Action:**  
  - Catch and display errors from service/contract calls in the UI.
  - Add unit tests for service logic (optional, for future).

---

## 7. **Documentation and Maintainability**

- **Goal:** Keep codebase understandable and maintainable.
- **Action:**  
  - Document service functions and component usage.
  - Keep `PROJECT_STRUCTURE.md` and this plan up to date.

---

## Example Flow

1. **User opens Public Contracts page**
   - Page uses `publicService.ts` to fetch contracts via contract hooks.
   - UI displays contracts, loading state, and errors as needed.

2. **User clicks "Create New Contract"**
   - UI calls `publicService.createPublicContract` with form data.
   - Service handles contract interaction, updates state, and notifies UI.

3. **User connects wallet**
   - `WalletProvider` updates context, UI reacts to new connection status.

---

## Next Steps

- Implement and connect service files for each contract type/page.
- Refactor UI components to use services and context for all blockchain logic.
- Remove mock data as real logic is verified.

