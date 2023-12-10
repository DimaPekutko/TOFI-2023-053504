import { makeAutoObservable } from "mobx";
import { api, methods } from "../helpers";
import _ from "lodash";



class AuthStore {
  token = null;
  isLogged = false;
  isAdmin = false;
  user = {}
  
  constructor() {
    makeAutoObservable(this);
  }

  async initAuth() {
    const access = localStorage.getItem('access');
    if (access) {
      console.log('hello')
      this.token = access;
      this.isLogged = true;
      await this.me()
    }
  }

  async setAccountFakeBalance(percent) {
    this.user.account.fakeBalance = (this.user.account.balance * (percent / 100)).toFixed(4);
  }

  async setEconomyPercent(data) {
    const res = await api('account/set_economy/', methods.POST, JSON.stringify(data), this.token);
    if (!res.err) {
      await this.getAccount();
    }
  }

  async getAccount() {
    const res = await api('account/', methods.GET, null, this.token);
    if (!res.err) {
      this.user.account = res.data;
      this.setAccountFakeBalance(res.data.economy_percent)
      this.user = _.cloneDeep(this.user);
    }
  }

  async me() {
    const result = await api('users/me', methods.GET, null, this.token);
    if (!result.err) {
      this.user = result.data;
      this.isAdmin = this.user.is_superuser || this.user.is_manager
      await this.getAccount();
    }
  }

  async register(data, handler) {
    const result = await api('auth/register', methods.POST, JSON.stringify(data), this.token);
    handler(result);
  }

  async login(data, handler) {
    const result = await api('auth/jwt/login', methods.POST, new URLSearchParams(data), this.token, {});
    handler(result);
  }

  async verifyCode(data) {
    const result = await api('auth/jwt/verify_code', methods.POST, JSON.stringify(data), this.token);
    if (!result.err) {
      this.token = result.data.access_token;
      this.isLogged = true;

      localStorage.setItem("access", this.token);
      await this.me();
    }
    return result;
  }

  async logout() {
    if (!this.isLogged) {
      return false;
    }

    const result = await api('auth/jwt/logout', methods.POST, null, this.token);
    if (result.err) {
      return false;
    }

    localStorage.removeItem("access");

    this.isLogged = false;
    this.token = null;
    this.user = {}

    return true;
  }
}


export const authStore = new AuthStore();