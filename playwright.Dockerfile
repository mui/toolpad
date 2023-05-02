FROM mcr.microsoft.com/playwright:v1.32.3-focal

RUN apt-get update && apt-get install -y build-essential

CMD [ "bash" ]

