FROM node

RUN npm install -g babel-cli
RUN npm install -g bunyan

ADD . /trains

EXPOSE 8081

CMD cd /trains && babel-node server.js | bunyan

