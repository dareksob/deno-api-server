FROM postman/newman:alpine

ENV host=deno-latest:8080

WORKDIR /app
COPY . .

# newman exec
CMD [ "run", "collection.json", "--env-var host=$host" ]

## for local
# newman run collection.json --env-var host=H