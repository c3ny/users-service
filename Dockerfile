FROM node AS development

WORKDIR /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY package.json  ./
COPY package-lock.json  ./

RUN npm i

COPY . .

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "build"]