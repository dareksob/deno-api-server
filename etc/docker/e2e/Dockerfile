FROM postman/newman:alpine

ENV host=deno-latest:8080

WORKDIR /app
COPY . .

# newman exec problem with pass env
ENTRYPOINT [ "newman", "run", "collection.json", "--env-var", "host=deno-latest:8080" ]

## for local
# newman run collection.json --env-var host=H