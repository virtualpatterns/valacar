# valacar

A tool for importing and viewing DHCP leases.

## Installation

	$ [sudo] npm install valacar -g

## Usage
See the help for more information ...

	$ valacar --help

### Installation
To create a local database or upgrade an existing local database to the latest installed version (will create the file but the folder must exist) ...

	$ valacar install ./data/valacar.db

By default log information is stored in `./valacar.log`.  This can be changed using the `--logPath` option ...

	$ valacar install ./data/valacar.db --logPath ./data/valacar.log

### Import
Import DHCP leases inlo a local database ...

	$ valacar /var/lib/dhcp/dhcpd.leases ./data/valacar.db --logPath ./data/valacar.log

This can be scheduled via `cron` using an entry like the following in `crontab` ...

	0,15,30,45 * * * * /usr/bin/valacar import /var/lib/dhcp/dhcpd.leases /home/USER/data/valacar.db --logPath /home/USER/data/valacar.log

This will import the DHCP leases file every 15 minutes into a local database.  Duplicate entries will be overwritten.

### Server
To view imported DHCP leases in a web app start the server using ...

	valacar-server start ./data/valacar.db --port 8080 --masterLogPath ./data/valacar.master.log --workerLogPath ./data/valacar.worker.log --masterPIDPath ./data/valacar.master.pid --numberOfWorkers 1

This will make the web app available at `http://127.0.0.1:8080`.  See the server help for more information ...

	$ valacar-server --help
