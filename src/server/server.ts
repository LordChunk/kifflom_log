import { Log } from "./log";

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

const log = new Log(
  GetConvar("kifflom:log:grafana_url", ""),
  GetConvar("kifflom:log:grafana_token", ""),
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

      const labels: Record<string, any> = {
        event_type: 'event',
        event
      };

      if (source) labels.source = source;
      if (citizen_id) labels.citizen_id = citizen_id;
      if (invoking_resource) labels.invoking_resource = invoking_resource;
      labels.isError = !!error;

      await log.info(logPayload, labels);
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
      await log.info(
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
        }
      );
    } catch (err) {
      console.error("Error logging export call:", err);
    }
  }
);
