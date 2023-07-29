FROM anchanik/ubuntu20.node18:base.v0.0.1

WORKDIR /usr/src/app

# apt-get update
RUN apt-get update

# nvm install -> node 버전 변경 (18 -> 14)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
RUN source ~/.bashrc
RUN nvm install v14
RUN nvm alias default v14

