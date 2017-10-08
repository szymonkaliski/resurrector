# Resurrector
## Automatically resurect process that stop responding

It's easy to detect process crash, but harded to detect when it hangs without quitting.
**Resurrector** uses heartbeat through OSC to automatically restart process that stopped respoding.

### Usage

1. `npm install -g resurrector`
2. write `config.json`
3. `resurrector config.json`

### Sample config

```json
{
  "port": 4000,
  "interval": 100,
  "path": "/hb/",
  "processes": [
    { "id": "app 1", "cmd": "node app1.js", "timeout": 2000 },
    { "id": "app 2", "cmd": "node app2.js", "timeout": 5000 }
  ]
}
```

#### Main config

* `port` - OSC port that resurrector listens on (defaults to `3000`)
* `interval` - how often resurrevtor checks for heartbeat (defaults to `100`ms)
* `path` - OSC path to send heartbeat on (defaults to `/hb/`)
* `processes` - array of processes to start

#### Process config

* `id` - process name, required
* `cmd` - command to run
* `timeout` - how long to wait before restarting

## Heartbeat

Each of the running processes should periodically ping resurrector with OSC message on specifed port and path, sending the process id (from config) as only parameter.
So for the sample config, process 1 sends: `/hb/ "app 1"` on OSC `4000`, and process 2 sends: `/hb/ "app 2"` on OSC `4000`.
