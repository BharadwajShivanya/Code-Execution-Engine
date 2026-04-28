FROM openjdk:17-alpine

RUN adduser -D -s /bin/sh runner
USER runner
WORKDIR /home/runner

CMD ["java", "-cp", ".", "Main"]
