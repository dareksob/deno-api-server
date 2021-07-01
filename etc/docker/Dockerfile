FROM denoland/deno:alpine-1.11.0

ARG CI_TAG
ARG CI_SHA

# write deployment lock information file
RUN echo "v$CI_TAG : $CI_SHA" > deployment.lock

WORKDIR /app

# copy di and run cache file
COPY src/deps.ts .
RUN deno cache deps.ts

# copy all sources
COPY . .

EXPOSE 8080

RUN chmod +x etc/bin/start
ENTRYPOINT ["/bin/sh", "etc/bin/start"]