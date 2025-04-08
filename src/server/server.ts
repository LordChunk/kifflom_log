import { Logger } from "./logger";

console.log("Server script in Node 22!");

interface IEventCall {
  event: string;
  source?: string;
  citizen_id?: string;
  invoking_resource?: string;
  error?: string;
}

interface IExportCall {
  resource: string;
  function_name: string;
  invoking_resource: string;
}

const logger = new Logger(
  process.env.GRAFANA_TOKEN || "",
  process.env.GRAFANA_URL || "",
  {
    fivem_environment: "development",
    service_name: "kifflom_log",
  },
);

AddEventHandler(
  "kifflom_log:server:event:trigger",
  async (data: IEventCall, ...args: any[]) => {
    const { event, source, citizen_id, invoking_resource, error } = data;

    try {
      const logPayload: Record<string, any> = {
        event_type: 'event',
        event
      };

      if (source) logPayload.source = source;
      if (citizen_id) logPayload.citizen_id = citizen_id;
      if (invoking_resource) logPayload.invoking_resource = invoking_resource;
      if (error) logPayload.error = error;
      if (args.length > 0) logPayload.args = args;

      const metadata: Record<string, any> = {
        event_type: 'event',
        event
      };

      if (source) metadata.source = source;
      if (citizen_id) metadata.citizen_id = citizen_id;
      if (invoking_resource) metadata.invoking_resource = invoking_resource;
      if (args.length > 0) metadata.args = JSON.stringify(args);
      metadata.isError = !!error;

      await logger.info(logPayload, metadata);
    } catch (err) {
      console.error("Error logging event:", err);
    }
  }
);

AddEventHandler(
  "kifflom_log:server:export:call",
  async (data: IExportCall, ...args: any[]) => {
    const { resource, function_name, invoking_resource } = data;

    try {
      await logger.info(
        {
          event_type: 'export',
          resource,
          function_name,
          invoking_resource,
          args,
        },
        {
          event_type: 'export',
          resource,
          function_name,
          invoking_resource,
          args: JSON.stringify(args),
        }
      );
    } catch (err) {
      console.error("Error logging export call:", err);
    }
  }
);
