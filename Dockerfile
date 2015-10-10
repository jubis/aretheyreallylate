FROM node

RUN npm install -g babel

ADD . /trains

EXPOSE 8081

CMD cd /trains && babel-node server.js

