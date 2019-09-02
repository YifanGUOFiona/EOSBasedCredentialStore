import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import IpfsAPI from 'ipfs-api';

import { notification } from 'antd';
import * as actionCreator from '../store/actionCreator';

const APP_NAME = 'eos-credentials';
const CONTRACT_NAME = 'fenxiangbaio';

const ipfs = IpfsAPI('localhost', '5002', {protocol: 'http'});
const ipfsPrefix = "http://localhost:5002/ipfs/";

const notify = () => {
  notification.error({
    message: 'No Scatter detected',
    description: 'Please install Scatter or activate',
  });
};

const networkConfig = {
  blockchain:'eos',
  protocol:'http',
  host:'jungle2.cryptolions.io',
  port:80,
  chainId:'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
};

ScatterJS.plugins(new ScatterEOS());   
  
export const login = () => (
  async (dispatch) => {
    const connected = await ScatterJS.scatter.connect(APP_NAME);
    if(!connected) { notify(); return false;}
  
    const scatter = ScatterJS.scatter;      
    try {
      await scatter.login({accounts:[networkConfig]})
      const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
      dispatch(actionCreator.changeLoginStatus(account.name));   
    } catch (error) {
      console.error(error);
    }
  }
);

export const logout = () => (
  async (dispatch) => {
    await ScatterJS.scatter.logout();
    dispatch(actionCreator.changeLoginStatus(false));
  }
);

export const checkLogin = () => (
  async (dispatch) => {
    const connected = await ScatterJS.scatter.connect(APP_NAME);
    if(!connected) return false;

    const res = await ScatterJS.scatter.checkLogin();
    if(res) dispatch(login());
  }
);

export const saveTextToIPFS = (text) => {
  return new Promise((resolve, reject) => {
    const descBuf = Buffer.from(text, 'utf-8');
    ipfs.add(descBuf).then(res => {
      resolve(res[0].hash);
    }).catch(error => {
      console.log(error);
    });
  });
};

export const readTextFromIPFS = (hash) => {
  return new Promise((resolve, reject) => {
    ipfs.cat(hash).then(res => {
      let content = new TextDecoder('utf-8').decode(res);
      resolve(content);
    }).catch(error => {
      console.log(error);
    });
  });
};

export const saveFileToIPFS = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result);
      ipfs.add(buffer).then(res => {
        resolve(res[0].hash);
      }).catch(error => {
        console.log(error);
      });
    };
  });
};

export const ipfsUrl = (url) => {
  return ipfsPrefix + url;
};

export const eosTransact = async (action, data, callback) => {
  const scatter = ScatterJS.scatter;
  const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
  const eos = scatter.eos(networkConfig, Eos, { expireInSeconds:60 });
  await eos.transaction({
    actions: [
      {
        account: CONTRACT_NAME,
        name: action,
        authorization: [
          {
            actor: `${account.name}`,
            permission: `${account.authority}`
          }
        ],
        data: data
      }
    ]
  });
  callback();
};

export const eosTableRows = (tableName, offset, callback, param = {}) => {
  const scatter = ScatterJS.scatter;
  const eos = scatter.eos(networkConfig, Eos, { expireInSeconds:60 });
  eos.getTableRows(true, CONTRACT_NAME, CONTRACT_NAME, tableName, 'id', 0, -1, 1000, 'i64', 1).then(res => {
    callback(provide(res.rows, offset, param));
  });
}

export const eosTableRowById = (tableName, id, callback) => {
  const scatter = ScatterJS.scatter;
  const eos = scatter.eos(networkConfig, Eos, { expireInSeconds:60 });
  eos.getTableRows(true, CONTRACT_NAME, CONTRACT_NAME, tableName, 'id', id, -1, 1, 'i64', 1).then(res => {
    callback(res.rows[0]);
  });
};

const provide = (data, offset, param) => {
  
  let newData = [];
  let paramKey = null;
  Object.keys(param).forEach(key => {
    paramKey = key;
  });

  if(paramKey){
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if(paramKey === key && param[paramKey] === item[key]){
          newData.push(item);
        }
      });
    });
  }else{
    newData = [...data];
  }

  newData = newData.sort(compare('id'));
  return newData.splice(offset, 10);
};

const compare = (property) => ((a,b) => {
  var value1 = a[property];
  var value2 = b[property];
  return value2 - value1;
});