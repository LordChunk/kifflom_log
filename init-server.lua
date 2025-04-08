-- Store the original functions
local originalAddEventHandler = AddEventHandler
local originalExports = exports

-- Not needed since RegisterNetEvent proxies to AddEventHandler
-- local originalRegisterNetEvent = RegisterNetEvent

-- Create a function to handle the monkey patching
local function monkeyPatchEventHandler(originalFunc, event, callback)
  -- Create a wrapper function that calls the original callback and triggers an event
  local wrappedCallback = function(...)
    local source = source

    -- Call the original callback
    local success, error = pcall(callback, ...)

    -- Do not log exports
    if string.find(event, "^__cfx_export_") then return end


    local data = {
      event = event,
      source = source,
      invoking_resource = GetInvokingResource(),
      error = error
    }

    if source ~= "" and GetResourceState('qbx_core') == 'started' then
      local citizenId = nil
      if Player(source) and Player(source).state and Player(source).state.isLoggedIn then
        local player = exports['qbx_core']:GetPlayer(source)
        citizenId = player?.PlayerData?.citizenid or nil

        if citizenId then
          data.citizen_id = citizenId
        end
      end
    end

    TriggerEvent('kifflom-logger:server:event:trigger', data, ...)
  end

  -- Register with the wrapped callback
  return originalFunc(event, wrappedCallback)
end

AddEventHandler = function(name, callback)
  return monkeyPatchEventHandler(originalAddEventHandler, name, callback)
end

-- Create a function to handle the monkey patching for creating exports
-- Exports are created as such:
-- exports('name', function() end)
-- Exports are called as such:
-- exports['resourceName']:functionName()
-- exports.resourceName.functionName()
-- This functionality should be preserved
local resourceName = GetCurrentResourceName()

-- Create a proxy for export creation
exports = setmetatable({}, {
  __call = function(_, functionName, exportFunction)
    -- Create a wrapped function that logs calls to this export
    local wrappedFunction = function(...)
      local invokingResource = GetInvokingResource() or 'unknown'

      local data = {
        resource = resourceName,
        function_name = functionName,
        invoking_resource = invokingResource
      }

      pcall(function(...)
        TriggerEvent('kifflom-logger:server:export:call', data, ...)
      end, ...)

      -- Call the original export function and return its results
      return exportFunction(...)
    end

    -- Register the wrapped function with the original exports system
    return originalExports(functionName, wrappedFunction)
  end,

  -- Handle accessing exports from other resources (exports['resourceName'] or exports.resourceName)
  __index = function(_, key)
    return originalExports[key]
  end
})

local originalTriggerClientEvent = TriggerClientEvent
