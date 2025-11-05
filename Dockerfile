FROM node AS development

WORKDIR /app


COPY package.json  ./
COPY package-lock.json  ./

RUN npm i

COPY . .

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run", "start"]