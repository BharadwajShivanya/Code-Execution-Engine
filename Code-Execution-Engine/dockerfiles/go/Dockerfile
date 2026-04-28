FROM golang:1.21-alpine

RUN adduser -D -s /bin/sh runner
USER runner
WORKDIR /home/runner

CMD ["./main"]
