# 📄 Verification Contract Flow (v4)

> 🧠 Structured by User Flow (what users do) and System Flow (how it works behind-the-scenes), with actors shown for every step.
> 

### ⚙️ System Flow — pre step

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Frontend | use the  master contract to find the current using `broadcastFactoryAddr` , `publicFactoryAddr` , `privateFactoryAddr` also show the current using version |

---

## 📡 1. Broadcast Contract (Open to All)

### 👤 User Flow — createNew

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Enters certificate title + startDate + endDate + JSON file + soft copy file to frontend |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **1.2** | Frontend | Uploads JSON file + soft copy to Arweave by irys, returns TxID |
| **1.3** | broadcastFactory |  creacte a broadcastContract with `title` |
| **1.4** | broadcastContract |  creacte a broadcastSubContract(ver 1)
with `title`, `jsonHash`, `softCopyHash`, `storageLink` , `startDate` , `endDate` |

---

### 👤 User Flow — addNewVer

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Find the Contract which need new ver |
| **2** | Owner | Enters certificate startDate + endDate + JSON file + soft copy file to frontend |

| Step | Actor | Action |
| --- | --- | --- |
| **2.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **2.2** | Frontend | Uploads JSON file + soft copy to Arweave by irys, returns TxID |
| **2.3** | Frontend |  find the broadcastContract |
| **2.4** | broadcastContract |  creacte a broadcastSubContract(ver 2)
with `title`, `jsonHash`, `softCopyHash`, `storageLink` , `startDate` , `endDate` |
| **2.5** | broadcastContract | update the ver to the latest one |

---

### 👤 User Flow — verifi

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Verifier | search the contract addr or owner addr or sub contract addr |
| **2** | Verifier | Downloads file and checks validity |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | search by event |
| **1.2** | Frontend | Show the info of that broadcastContract + broadcastSubContract(current ver) |
| **2.1** | Frontend | download the file form Arweave by irys |
| **2.2** | Frontend | compare the downloaded file hash and the on chain hash    |
| **2.3** | Frontend | return the result |

---

## 🌐 2. Public Contract (Point to target user)

### 👤 User Flow — createNew

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Enters certificate title + startDate + endDate + JSON file + soft copy file to frontend |
| **2** | Owner | Send the Activation code and the publicContractAddress to the user |
| **3** | User | Search the contract and input Activation code |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **1.2** | Frontend | Uploads JSON file + soft copy to Arweave by irys, returns TxID |
| **1.3** | publicFactory |  creacte a publicContract with `title` |
| **1.4** | publicContract |  creacte a publicSubContract(ver 1)
with `title`, `jsonHash`, `softCopyHash`, `storageLink` , `startDate` , `endDate` |
| **3.1** | Frontend | return the contract activation page & call the publicContract  |
| **3.2** | publicContract | update the `userAddr` with the user addr |

---

### 👤 User Flow — addNewVer

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Find the Contract which need new ver |
| **2** | Owner | Enters certificate startDate + endDate + JSON file + soft copy file to frontend |

| Step | Actor | Action |
| --- | --- | --- |
| **2.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **2.2** | Frontend | Uploads JSON file + soft copy to Arweave by irys, returns TxID |
| **2.3** | Frontend |  find the publicContract  |
| **2.4** | publicContract |  creacte a publicSubContract (ver 2)
with `title`, `jsonHash`, `softCopyHash`, `storageLink` , `startDate` , `endDate` |
| **2.5** | publicContract | update the ver to the latest one |

---

### 👤 User Flow — verifi

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Verifier | search the contract addr or owner addr or sub contract addr |
| **2** | Verifier | Downloads file and checks validity |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | search by event |
| **1.2** | Frontend | Show the info of that publicContract  +publicSubContract(current ver) |
| **2.1** | Frontend | download the file form Arweave by irys |
| **2.2** | Frontend | compare the downloaded file hash and the on chain hash    |
| **2.3** | Frontend | return the result |

---

## 🔒 3. Private Contract (Point to target user + data privacy)

### 👤 User Flow — createNew

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Enters certificate title + startDate + endDate + JSON file + soft copy file to frontend |
| **2** | Owner | Send the Activation code + JSON file + soft copy file and the privateContractAddress to the user |
| **3** | User | Search the contract and input Activation code + JSON file + soft copy file |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **1.2** | privateFactory |  creacte a privateContract with `title` |
| **1.4** | privateContract |  creacte a privateSubContract(ver 1)
with `title`, `jsonHash`, `softCopyHash` , `startDate` , `endDate` |
| **3.1** | Frontend | return the contract activation page & call the privateContract  |
| **3.2** | privateContract  | update the `userAddr` with the user addr |
| **3.3** | Frontend | encrypt the JSON file + soft copy file to Arweave by irys, returns TxID |
| **3.4** | Frontend | upload TxID to privateSubContract (ver 1) |
| **3.5** | privateSubContract | update the dataLink |

---

### 👤 User Flow — addNewVer

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | Owner | Find the Contract which need new ver |
| **2** | Owner | Enters certificate startDate + endDate + JSON file + soft copy file to frontend |
| **3** | Owner | Send the  JSON file + soft copy file and the privateContractAddress to the user |
| **4** | User | Search the contract and input JSON file + soft copy file |

| Step | Actor | Action |
| --- | --- | --- |
| **1.1** | Frontend | Hashes JSON + Hashes soft copy  |
| **1.2** | privateContract |  creacte a privateSubContract (ver 2)
with `title`, `jsonHash`, `softCopyHash`, `startDate` , `endDate` |
| **4.1** | Frontend |  find the privateContract  |
| **4.2** | Frontend | encrypt the JSON file + soft copy file to Arweave by irys, returns TxID |
| **4.3** | Frontend | upload TxID to privateSubContract (ver 2) |
| **4.4** | privateSubContract | update the dataLink |

---

### 👤 User Flow — verifi

### ⚙️ System Flow

| Step | Actor | Action |
| --- | --- | --- |
| **1** | User | Send the  JSON file + soft copy file and the privateContractAddress to the user |
| **2** | Verifier | search the contract addr or owner addr or sub contract addr |
| **3** | Verifier | Upload file and checks validity |

| Step | Actor | Action |
| --- | --- | --- |
| **2.1** | Frontend | search by event |
| **2.2** | Frontend | Show the info of that privateContract  +privateSubContract(current ver) |
| **3.1** | Frontend | download the file form Arweave by irys |
| **3.2** | Frontend | compare the uploaded file hash and the on chain hash    |
| **3.3** | Frontend | return the result |