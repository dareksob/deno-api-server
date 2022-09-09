eml_doc "rebuild" "rebuild all services"
function eml-extend-rebuild() {
  local _cp="docker compose -f $dockerFile"

  $_cp pull
  $_cp build
  $_cp up -d
}
