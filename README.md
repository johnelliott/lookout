# lookout

👀

hear counts from your placemeter sensor every hour

# installing

you'll need a mac running OS X and a Placemeter account

to install, clone this repository, cd into the directory with this readme, install dependencies with `$ npm install --global .`, then have your api key handy

# use
``` sh
$ lookout --key yourplacemeterapikey --point 7112 [--classes ['pedestrians']]
$ lookout --key yourplacemeterapikey --point 7112 [--classes ['pedestrians']]
```
classes takes a JSON array

# running continuously

for the union square demo sensor:
``` sh
$ PMKEY=yourplacemeterapikey POINT=7112 npm run continuous
```


