eml_doc "unit" "execute unit test"
function eml-extend-unit() {
  service=deno-latest

  if [ "$2" != "" ]; then
    service="$2"
  fi

  echo "Run deno unit test env with service $service"

  docker compose -f $dockerFile run --rm -e APP_ENV=unit $service
}
