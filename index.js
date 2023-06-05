const fastify = require('fastify')({ logger: true })

const outputData = {
  type: 'time-of-day-service',
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

// trivial ephemeral state management 
var consumers = [];

fastify.get('/', async () => {
  console.log('GET /');
  return 'Time of day service resource driver';
})

fastify.get('/tods/consumers', async () => {
  console.log('GET /tods'); 
  return {'consumers': consumers};
})

fastify.put('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers['set-humanitec-driver-cookie'];

  console.log(`PUT /tods/resId=${resId}, cookie=${cookie}`);

  if (!consumers.find(e => e === resId)) {
    consumers.push(resId);
    console.log(`Registered consumer: resId=${resId}`);
  } else {
    console.log(`Consumer already registered - nothing to do: resId=${resId}`);
  }

  rsp
    .code(200)
    .send(outputData); 
})

fastify.delete('/tods/:resId', async (req, rsp) => {
  const {resId} = req.params;
  const cookie = req.headers['set-humanitec-driver-cookie'];

  console.log(`DELETE /tods/resId=${resId}, cookie=${cookie}`);

  if (consumers.find(e => e === resId)) {
    consumers = consumers.filter(e => e !== resId);
    console.log(`Unegistered consumer: resId=${resId}`);
  } else {
    console.log(`No consumer was registered - nothing to do: resId=${resId}`);
  }

  rsp
    .code(204)
    .send(); 
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    // await fastify.listen({ port: 3000, host: '0.0.0.0'})
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

