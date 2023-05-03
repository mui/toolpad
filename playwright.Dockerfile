FROM mcr.microsoft.com/playwright:v1.33.0-focal

RUN apt-get update && apt-get install -y build-essential

CMD [ "bash" ]

