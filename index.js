var fetch = require('isomorphic-fetch')
//var querystring = require('querystring')
var url = require('url')
var debug = require('debug')('lookout')

var token = process.argv[2]
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
var startTime = now - 60*1000
var endTime = now

var measurementPointId = 7423

var getMessage = function(data) {
  return [data.length, 'pedestrians in the last hour']
}

var resource = url.format({
  hostname: 'api.placemeter.net/api/v1/measurementpoints',
  pathname: `/${measurementPointId}/data`,
  query: {
    start: startTime,
    resolution: 'hour',
    end: endTime
  }
})
debug(resource)

fetch(resource, config)
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
  return res.json();
})
.then(function(json) {
  json.data.forEach((e)=>{debug(e)});
  require('child_process').spawn('say', getMessage(json.data))
});

/*
 * Mac OS-X UI:
 * $ lookout --key abc123 --what pedestrians --where "10th St. South Sidewalk"
 * $ lookout --key abc123 --interactice -> curses
 * " Here's the hourly placemeter report for 10th St. South Sidewalk ... 10 northbound and 5 southbound pedestrians in the last hour "
 */
