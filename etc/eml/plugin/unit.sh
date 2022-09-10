eml_doc "unit" "execute unit test"
function eml-extend-unit() {
  service=deno-latest

  if [ "$1" != "" ]; then
    service="$1"
  fi

  echo "Run deno unit test env with service $service"

  docker compose -f $dockerFile run --rm -e APP_ENV=unit $service
}
