# Kifflom Log - FiveM Plugin

## Overview

Kifflom Log is a logging plugin for FiveM servers that integrates with Grafana Loki. It automatically captures and logs network events and export calls from your server resources, providing detailed insights for debugging and monitoring.

### Features

- **Event Tracking**: Automatically logs all network events triggered across your server
- **Export Call Monitoring**: Tracks all server-side export function calls between resources
- **Grafana Loki Integration**: Send logs to Grafana Loki for advanced querying and visualization
- **Detailed Context**: Captures source player ID, citizen ID (Qbox), invoking resource, and arguments

## Requirements

- FiveM server with Node.js 22 support
- Grafana Loki instance

## Installation

1. Clone the repository into your FiveM server resources folder:
   ```bash
   cd resources
   git clone https://github.com/lordchunk/kifflom_log
   ```

2. Navigate to the project directory:
   ```bash
   cd kifflom_log
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Add the resource to your `server.cfg` configuration. Kifflom Log should be started before any other resources that you want to log:
   ```
   # Kifflom Log Configuration
   set kifflom:log:grafana_token "YOUR_GRAFANA_TOKEN"
   set kifflom:log:grafana_url "YOUR_GRAFANA_LOKI_URL"

   ensure kifflom_log
   
   ... start other resources
   ```

6. To enable logging for your resource, add the following to the <i>start</i> of your `fxmanifest.lua`:

   ```lua
   server_scripts {
      '@kifflom_log/init-server.lua',
      ... 
   }
   ```

## How It Works

Kifflom Log works by monkey-patching the FiveM server's event handling system:

1. It intercepts all event registrations and wraps callbacks in logging functionality
2. It captures export function calls across resources
3. All logs are sent to your configured Grafana Loki instance
4. For events from player sources, it attempts to retrieve the citizen ID if Qbox Core is used

## Usage Examples

Adding this line will automatically enable the capturing of all network events and export calls in your resource without any additional code changes.

### Automatic Event Logging

Any event triggered on your server will be automatically captured with useful metadata:

```lua
-- This event will be automatically logged with source and arguments
RegisterNetEvent('my-resource:someAction', function(data)
    -- Your code here
end)
```

### Automatic Export Call Logging

Export calls between resources are automatically logged:

```lua
-- This export call will be logged with all arguments
exports['some-resource']:someFunction('arg1', 'arg2')
```

## Viewing Logs

Access your logs through your Grafana Loki interface. You can query logs using LogQL with labels like:

- `{level="error"}` - Show only error logs
- `{event="playerConnecting"}` - Show logs for specific events
- `{citizen_id="ABC123"}` - Filter logs by player citizen ID
- `{invoking_resource="my-resource"}` - Show logs from a specific resource
