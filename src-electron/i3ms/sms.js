const axios = require('axios');
const _  = require('lodash');

const baseUrl = 'https://portal.mobtexting.com/api/v2/sms/send';

const senderIdBaseUrl = 'https://portal.mobtexting.com/rest/v1/sender/';

const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
});

const kMobTextingApiKey = "4b2cd1eb853426e76718cb8ee39c2b63";

export async function sendSms(msg, to) {

  const queryParams = {
    'access_token' : kMobTextingApiKey,
    'sender' : 'FREWIS',
    'service' :'T',
    'message': msg,
    'to' : to,
  };

  try {
    const response = await client.get(baseUrl, {params: queryParams});
    return response;
  } catch(ex) {
      console.error(ex);
      return null;
  }
}

export async function sendBulkSms(msg, to) {

  const body = {
    "root":  {
    'access_token' : kMobTextingApiKey,
    'sender' : 'FREWIS',
    'service' :'T',
    'message': msg,
    },
    'nodes' : _.uniq(to).map(t => ({to: t})),
  };

  console.log(body)

  try {
    const response = await client.post(baseUrl+'/json?access_token=' + kMobTextingApiKey, body);
    console.log(response);
    return response;

  } catch(ex) {
      console.error(ex);
      return null;
  }
}


export async function createSenderId(senderId, company) {

  const params = {
      'access_token' : kMobTextingApiKey,
      'name' : senderId,
      'message': company,
      entity_name: company
  };

  console.log(params)

  try {
    const response = await client.get(senderIdBaseUrl + '/create', {
      headers: {
        'access_token': kMobTextingApiKey
      },
      params: params
    });
    console.log(response);
    return response;

  } catch(ex) {
      console.error(ex);
      return null;
  }
}


// exports.sendSms = sendSms
// exports.sendBulkSms = sendBulkSms

if (require.main === module) {
  (async function() {
    const r = await sendBulkSms('Hello', ['8105245255', '8105616743']);
    console.log(r)
  })()
}
