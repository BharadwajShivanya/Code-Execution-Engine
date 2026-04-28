FROM rust:1.70-alpine

RUN adduser -D -s /bin/sh runner
USER runner
WORKDIR /home/runner

CMD ["./main"]
