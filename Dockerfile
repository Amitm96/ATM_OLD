FROM  electronuserland/builder:wine
WORKDIR /product
COPY . ./
RUN yarn global add @quasar/cli
ENV ELECTRON_CACHE="/root/.cache/electron"
ENV ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"
#RUN yarn
