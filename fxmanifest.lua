fx_version 'cerulean'
game { 'gta5' }

author 'LordChunk'
description 'Logger resource for network events and exports'
license 'LGPL-3.0-or-later'
repository 'https://github.com/LordChunk/kifflom_log'

version '1.0.0'

server_only 'yes'

files {
  'init-server.lua',
}

server_scripts {
  'dist/server/*.js'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
