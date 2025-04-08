# Kifflom Logger - FiveM Plugin

## Overview

Kifflom Logger is a logging plugin for FiveM servers that integrates with Grafana Loki. It automatically captures and logs network events and export calls from your server resources, providing detailed insights for debugging and monitoring.

### Features

- **Event Tracking**: Automatically logs all network events triggered across your server
- **Export Call Monitoring**: Tracks all server-side export function calls between resources
- **Grafana Loki Integration**: Send logs to Grafana Loki for advanced querying and visualization
- **Detailed Context**: Captures source player ID, citizen ID (Qbox), invoking resource, and arguments
- **Error Tracking**: Records errors that occur during event handling
- **Convenient Log Levels**: Support for info, warn, error, and debug log levels

## Requirements

- FiveM server with Node.js 22 support
- Grafana Loki instance
- `ox_lib` dependency

## Installation

1. Clone the repository into your FiveM server resources folder:
   ```bash
   cd resources
   git clone https://github.com/lordchunk/kifflom_logger
   ```

2. Navigate to the project directory:
   ```bash
   cd kifflom_logger
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure environment variables by copying the example file and updating the values:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file and fill in your actual values.


5. Build the project:
   ```bash
   npm run build
   ```

6. Add the resource to your server configuration:
   ```
   ensure kifflom_logger
   ```

To enable logging for your resource, add the following to your `fxmanifest.lua`:

```lua
-- Include Kifflom Logger
server_scripts {
    '@kifflom_logger/server-init.lua',
    ... 
}
```

## Configuration

The logger is configured through environment variables:

- `GRAFANA_TOKEN`: Your Grafana Loki access token
- `GRAFANA_URL`: The URL endpoint for your Grafana Loki instance

Additional default labels can be configured in the `Logger` constructor in `logger.ts`.

## How It Works

Kifflom Logger works by monkey-patching the FiveM server's event handling system:

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
