FROM node:21.2.0
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main.js"]
