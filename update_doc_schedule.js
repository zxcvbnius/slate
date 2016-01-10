var schedule = require('node-schedule');
var shell = require('shelljs');

// schedule : update slate at Mon.-Fri. 8:00 a.m.
var job = schedule.scheduleJob('0 0 0 * * 1-5', function() {

    if ( shell.exec('git pull').code !== 0) {

        shell.echo('Error: Git commit failed');
        exit(1);
    }
    shell.echo('update success : ' + new Date() );

});
