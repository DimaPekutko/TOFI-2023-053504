import { isArray } from "lodash";

const API_URL = process.env.API_URL; // 'http://localhost:8001/api/'
const methods = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

const api = async (path, method, body, jwt=null, headers={'Content-Type': 'application/json'}) => {
  const token = jwt ? { 'Authorization': 'Bearer ' + jwt } : {}
  
  const options = {
    method: method,
    headers: {...headers, ...token},
  }

  if (body) {
    options.body = body;
  }

  const resp = await fetch(API_URL + path, options);
  
  let data = await resp.text();
  if (data) {
    data = JSON.parse(data);
  }
  
  let err = null;
  if (![200, 204].includes(resp.status)) {
    const detail = data.detail
    err = isArray(detail) ? detail[0].msg : detail;
  }
  return {data, err}
}

export { api, methods }