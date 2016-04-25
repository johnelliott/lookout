var fetch = require('isomorphic-fetch')
var url = require('url')
var cp = require('child_process')
var debug = require('debug')('lookout')
var argv = require('minimist')(process.argv.slice(2), {boolean: ['q', 'quiet']});
debug('argv', argv);

var token = argv.key || argv.k
debug('API access token:', token)
if (!token) process.exit(1)

var config = {
  protocol: 'https:',
  headers:{
    Authorization: `Token ${token}`
  }
}

var now = Math.floor(new Date().valueOf()/1000)
debug('now', now)
var startTime = now - 60*60 // sec*min
var endTime = now
// temporarily sample today to check against dashbord default total
//var startTime = Math.floor(new Date(2016, 3, 25).valueOf()/1000)
//var endTime = Math.floor(new Date().valueOf()/1000)


// Default: Union Square - Broadway East Sidewalk
var measurementPointId = argv.point || argv.p || 7112
var classes = argv.c || argv.classes || ['all']

var dataUrl = url.format({
  hostname: 'api.placemeter.net/api/v1/measurementpoints',
  pathname: `/${measurementPointId}/data`,
  query: {
    start: startTime,
    //resolution: 'minute', // don't need this...
		classes: classes, // TODO find out why this doesn't work with 'ped'
    end: endTime
  }
})
debug('dataUrl', dataUrl)

var metadataUrl = url.format({
	hostname: 'api.placemeter.net/api/v1/measurementpoints',
	pathname: `/${measurementPointId}`
})
debug('metadataUrl', metadataUrl)

var metadata = fetch(metadataUrl, config)
.then(function(response) {
  debug(response.headers.get('Content-Type'))
  debug(response.headers.get('Date'))
  debug(response.status)
  debug(response.statusText)
  debug(response.url)
  // TODO replace with better error handling
  if (response.statusText === "UNAUTHORIZED" || process.status >=400) process.exit(1)
    return response
})
.then(function(res) {
  return res.json()
})
.catch(function(e) {
  debug(e)
  console.error(e)
  process.exit(1)
})

var pointData = fetch(dataUrl, config)
.then(function(response) {
  debug(response.headers.get('Content-Type'))
  debug(response.headers.get('Date'))
  debug(response.status)
  debug(response.statusText)
  debug(response.url)
  // TODO replace with better error handling
  if (response.statusText === "UNAUTHORIZED") process.exit(1)
    return response
})
.then(function(res) {
  return res.json()
})
.catch(function(e) {
  debug(e)
  console.error(e)
  process.exit(1)
})

Promise.all([metadata, pointData]).then(function(values) {
  // Placemeter has non-overlapping keys for these two endpoints, so merge data
  var point = Object.assign({}, ...values)
  var directionalCounts = point.data.map((e)=>{
    return e.all
  })
  var sampleBiDirectionalSums = directionalCounts.map((s)=>{
    var keys = Object.keys(s)
    return keys.reduce((p, c)=>{
      return s[p] + s[c]
    })
  })
  var count = sampleBiDirectionalSums.reduce((p, c)=>{
    return p+c
  })
  debug('count', count)

  var message = `${point.name} had ${count} pedestrians in the last hour`
  if (argv.q || argv.quiet) {
    console.log(`${new Date()} ${message}`)
  } else {
    speak(message)
  }
})

function speak(message) {
  return cp.spawn('say', [message])
}
