const fastify = require('fastify')({ logger: true })

const createResponse = (resId) => {
  return {
    id: resId,
    type: 's3',
    resource: {
      secrets: {
        password: 'secret'
      },
      values: {
        host: 'tods.somewhere.org',
        port: 3030
      },
      manifests: []
    }  
  };
};

const HUM_COOKIE_NAME = 'set-humanitec-driver-cookie';

const makeHumanitecCookieInBase64 = (resId) => {
  return btoa(JSON.stringify({id: resId}));
};

// trivial ephemeral state management 
var consumers = [];

// used as a readiness probe so we don't log from this path
fastify.get('/', { logLevel: 'silent' }, async () => {
  return 'Time of day service resource driver';
})

// list our registered consumers
fastify.get('/tods/consumers', async () => {
  console.log('GET /tods/consumers'); 
  return {'consumers': consumers};
})

// create or update a consumer
fastify.put('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers[HUM_COOKIE_NAME];

  console.log(`PUT /tods/${resId}, cookie=${cookie}`);

  if (!consumers.find(e => e === resId)) {
    consumers.push(resId);
    console.log(`Registered consumer: resId=${resId}`);
  } else {
    console.log(`Consumer already registered - nothing to do: resId=${resId}`);
  }

  const rspCookie = makeHumanitecCookieInBase64(resId);
  console.log(`Set response cookie: ${rspCookie}`);

  rsp
    .code(200)
    .headers(HUM_COOKIE_NAME, rspCookie)
    .send(createResponse(resId)); 
})

// remove a consumer
fastify.delete('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers[HUM_COOKIE_NAME];

  console.log(`DELETE /tods/${resId}, cookie=${cookie}`);

  if (consumers.find(e => e === resId)) {
    consumers = consumers.filter(e => e !== resId);
    console.log(`Unegistered consumer: resId=${resId}`);
  } else {
    console.log(`No consumer was registered - nothing to do: resId=${resId}`);
  }

  rsp
    .code(204)
    .headers(HUM_COOKIE_NAME, '')
    .send(); 
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0'})
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

