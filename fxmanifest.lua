fx_version 'cerulean'
game { 'gta5' }

version '1.0.0'

server_only 'yes'

files {
  'init-server.lua',
}

server_scripts {
  'dist/server/*.js'
}

dependencies {
  '/server:12913', -- Node.js 22 support
}

node_version '22'
lua54 'yes'
use_experimental_fxv2_oal 'yes'
