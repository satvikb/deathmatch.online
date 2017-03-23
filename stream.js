const DeepstreamServer = require('deepstream.io')
const C = DeepstreamServer.constants
const deepserver = new DeepstreamServer({
  host: '192.168.1.8',
  port: 8000
})

deepserver.start()
