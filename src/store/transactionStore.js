import { makeAutoObservable } from "mobx";
import { api, methods } from "../helpers";
import { authStore } from "./authStore";


class TransactionStore {
  transactions = []
  credits = []

  constructor() {
    makeAutoObservable(this);
  }

  async getCredits() {
    const result = await api('credits', methods.GET, null, authStore.token);
    this.credits = result.data;
  }

  async createCredit(data) {
    const res = await api('credits', methods.POST, JSON.stringify(data), authStore.token);
    await this.getCredits();
    return res;
  }

  async approveCredit(crId) {
    await api(`credits/${crId}/approve/`, methods.POST, null, authStore.token);
    await this.getCredits();
  }

  async getTransactions() {
    const result = await api('transactions', methods.GET, null, authStore.token);
    this.transactions = result.data;
  }

  async createTransaction(data) {
    const res = await api('transactions', methods.POST, JSON.stringify(data), authStore.token);
    await this.getTransactions();
    return res;
  }

  async approveTransaction(trId) {
    await api(`transactions/${trId}/approve/`, methods.POST, null, authStore.token);
    await this.getTransactions();
  }
}

export const transactionStore = new TransactionStore();