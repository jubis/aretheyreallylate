FROM node

RUN npm install -g babel
RUN npm install -g bunyan

ADD . /trains

EXPOSE 8081

CMD cd /trains && babel-node server.js | bunyan

