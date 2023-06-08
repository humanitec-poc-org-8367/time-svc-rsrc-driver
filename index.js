const fastify = require('fastify')({ logger: true })

const TODS_HOST = process.env.TODS_HOST;
const TODS_PORT = process.env.TODS_PORT || '443';

const TODS_BASE_URL = `https://${TODS_HOST}:${TODS_PORT}`;

const HUM_COOKIE_NAME = 'set-humanitec-driver-cookie';

const createRegistrationResponse = (resId) => {
  return {
    id: resId,
    type: 's3',
    resource: {
      secrets: {
        oursecret: 'super-seeecret'
      },
      values: {
        url: `${TODS_BASE_URL}/${resId}/time`,
      },
      manifests: []
    }  
  };
};

const createErrorResponse = (msg) => {
  return {
    error: 'RES-101',
    message: msg
  };
};

const makeHumanitecCookieInBase64 = (resId) => {
  return btoa(JSON.stringify({id: resId}));
};

const errorResponse = (rsp, msg) => {  
  console.log(`ERROR: ${msg}`)
  rsp.code(400).send(createErrorResponse(msg));
}

// used as a readiness probe so we don't log from this path
fastify.get('/', { logLevel: 'silent' }, async () => {
  return `Time of day service resource driver: remote service host=${TODS_HOST}, port=${TODS_PORT}`;
})

// list registered consumers from remote service
fastify.get('/tods/consumers', async (req, rsp) => {
  const url = `${TODS_BASE_URL}/consumers`;  

  console.log(`GET /tods/consumers, url=${url}`); 

  try {
    const r = await fetch(url);

    if (!r.ok) {
      errorResponse(rsp, `Unable to get consumers: remote status=${r.status}, text=${r.statusText}`);
      return;  
    }

    rsp.code(200).send(r.json); 
  }
  catch (err) {
    errorResponse(rsp, `Unexpected error calling remote service: ${err}`);
  }
})

// create or update a consumer in the remote service
fastify.put('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers[HUM_COOKIE_NAME];
  const url = `${TODS_BASE_URL}/consumers/${resId}`;

  console.log(`PUT /tods/${resId}, cookie=${cookie}, url=${url}`);

  try {
    const r = await fetch(new Request(url, {method: "PUT"}));

    if (!r.ok) {
      errorResponse(rsp, `Unable to register consumer: remote status=${r.status}, text=${r.statusText}`);
      return;  
    }

    console.log(`Registered consumer in remote service: ${resId}`);
    const rspCookie = makeHumanitecCookieInBase64(resId);
    console.log(`Set response cookie: ${rspCookie}`);

    rsp
      .code(200)
      .headers(HUM_COOKIE_NAME, rspCookie)
      .send(createRegistrationResponse(resId)); 
  }
  catch (err) {
    errorResponse(rsp, `Unexpected error calling remote service: ${err}`);
  }
})

// remove a consumer from the remote service
fastify.delete('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers[HUM_COOKIE_NAME];
  const url = `${TODS_BASE_URL}/consumers/${resId}`;

  console.log(`DELETE /tods/${resId}, cookie=${cookie}, url=${url}`);

  try {
    const r = await fetch(new Request(url, {method: "DELETE"}));

    if (!r.ok) {
      errorResponse(rsp, `Unable to unregister consumer: remote status=${r.status}, text=${r.statusText}`);
      return;  
    }

    console.log(`Unegistered consumer from remote service: resId=${resId}`);

    rsp
      .code(204)
      .headers(HUM_COOKIE_NAME, '')
      .send(); 
  }
  catch (err) {
    errorResponse(rsp, `Unexpected error calling remote service: ${err}`);
  }
})

const assertConfiguration = () => {
  if (!TODS_HOST) {
    throw new Error('Remote service host not specified: did you forget to set TODS_HOST env var?');
  }
};

const start = async () => {
  try {
    assertConfiguration();
    console.log(`Starting resource driver: remote service host=${TODS_HOST}, port=${TODS_PORT}`);
    await fastify.listen({ port: 3000, host: '0.0.0.0'})
  } 
  catch (err) {
    console.error(err)
    process.exit(1)
  }
}
start()

