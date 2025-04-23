# Kifflom Log - Grafana Dashboards

## Overview

This directory contains pre-configured Grafana dashboards that work with your FiveM server database to provide monitoring and visualization capabilities for player data.

## Requirements

- Grafana
- MySQL/MariaDB data source configured in Grafana
- FiveM server with QBox framework
- ox_inventory (for the inventory visualization)

## Available Dashboards

### Player Information Dashboard

![Player Information Dashboard](/docs/player-show-1.png)
![Player Information Dashboard](/docs/player-show-2.png)


The Player Information Dashboard provides a view of a player's data, including:

- **Basic Information**: Player name, citizen ID, and license ID
- **Financial**: Cash and bank account balances
- **Character Details**: Job, gang, nationality, phone, and date of birth
- **Properties**: Owned properties
- **Vehicles**: All vehicles with status information
- **Inventory**: Visual representation of player inventory (requires ox_inventory)
- **Transactions**: Financial transaction history
- **Sanctions**: Ban/warning records

## Installation Instructions

### 1. Configure Data Source

Before importing dashboards, ensure you have properly configured:

- **MySQL/MariaDB data source** with the following settings:
  - Name your data source `mariadb-kifflom` (important: the dashboard is configured to use this specific ID)
  - Point it to your FiveM database
  - Ensure the user has read permissions to all required tables

If you need to use a different data source ID, you'll need to edit the dashboard JSON to update all references to "mariadb-kifflom".

### 2. Import Dashboard

1. Go to your Grafana instance
2. Navigate to Dashboards → Import
3. Either upload the JSON file or paste the dashboard JSON content from `dashboards/player-show.json` 
4. Select your MySQL/MariaDB data source when prompted
5. Click Import

## Customization

The dashboards are designed to work with standard QBox and ox_inventory database schemas. If you have custom database schemas:

1. Edit the SQL queries in each panel
2. Adjust variable queries if needed
3. Save your customized version

## Troubleshooting

- **Missing Data**: Ensure your database schema matches the QBox and ox_inventory format
- **Connection Issues**: Verify data source credentials and connectivity
