import { ethers } from 'ethers';

// Common status enum across contracts
export enum ContractStatus {
  Active = 0,
  Disabled = 1
}

// Event types for the different contracts
export interface ContractEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp?: number;
}

// MasterFactory Events
export interface NewVerContractPushedEvent extends ContractEvent {
  factoryName: string;
  verNo: number;
  masterFactoryAddr: string;
  subFactoryAddr: string;
  ownerAddr: string;
}

export interface UsingVerEvent extends ContractEvent {
  factoryName: string;
  verNo: number;
  masterFactoryAddr: string;
  subFactoryAddr: string;
  ownerAddr: string;
}

// Factory Events
export interface NewContractOwnedEvent extends ContractEvent {
  factoryAddr: string;
  contractAddr: string;
  ownerAddr: string;
  title: string;
  contractType: 'broadcast' | 'public' | 'private';
}

// Main Contract Events
export interface NewSubContractOwnedEvent extends ContractEvent {
  parentContractAddr: string;
  subContractAddr: string;
  ownerAddr: string;
  startDate: number;
  endDate: number;
  contractType: 'broadcast' | 'public' | 'private';
}

export interface ContractActivatedEvent extends ContractEvent {
  contractAddr: string;
  ownerAddr: string;
  userAddr: string;
  title: string;
  contractType: 'public' | 'private';
}

// SubContract Events
export interface StatusUpdatedEvent extends ContractEvent {
  subContractAddr: string;
  status: ContractStatus;
}

export interface DataLinksUpdatedEvent extends ContractEvent {
  subContractAddr: string;
  userAddr: string;
}

// Parameter types for contract methods
export interface CreateBroadcastParams {
  title: string;
}

export interface CreatePublicPrivateParams {
  title: string;
  activationCode: string;
}

export interface BroadcastSubContractParams {
  jsonHash: string;
  softCopyHash: string;
  storageLink: string;
  startDate: number;
  endDate: number;
}

export interface PublicSubContractParams extends BroadcastSubContractParams {
  // Same as broadcast for now
}

export interface PrivateSubContractParams {
  jsonHash: string;
  softCopyHash: string;
  startDate: number;
  endDate: number;
}

export interface UpdateDataLinksParams {
  jsonLink: string;
  softCopyLink: string;
}

// Hook return types
export interface BaseHookReturn {
  isLoading: boolean;
  error: string | null;
}
