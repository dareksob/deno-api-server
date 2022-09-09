eml_doc "e2e" "enter e2e env to run your e2e test with newman"
function eml-extend-e2e() {
  local service=integration-test
  docker compose -f $dockerFile run --rm --entrypoint sh $service
}
