FROM node

RUN npm install -g babel-cli
RUN npm install -g bunyan
RUN npm install -g forever

ADD . /trains

EXPOSE 8081

CMD cd /trains && npm start

