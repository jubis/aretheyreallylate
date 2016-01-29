FROM node

RUN npm install -g bunyan
RUN npm install -g forever

ADD . /trains
RUN touch /trains/log.txt
RUN touch /trains/err.txt

EXPOSE 8081

CMD cd /trains && npm run serve

