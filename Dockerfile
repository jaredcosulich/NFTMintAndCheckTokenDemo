ARG BASE_IMAGE_NAME=${base_image_name:-nodlabs/node-yarn-almalinux}
ARG BASE_IMAGE_VERSION=${base_image_version:-16-1.22.18-8.5}
FROM --platform=${TARGETPLATFORM} ${BASE_IMAGE_NAME}:${BASE_IMAGE_VERSION}

ARG GIT_VERSION=${git_version:-2.27.0}
ARG USER_NAME=${user_name:-nodejs}
ARG GROUP_NAME=${group_name:-users}
ARG PROJECT_INSTALL_DIR=${project_install_dir:-/opt}
ARG PROJECT_NAME=${project_name:-NFTMintAndCheckTokenDemo}
#ARG PROJECT_URL=${project_url:-https://github.com/jaredcosulich/${PROJECT_NAME}.git}
#ARG BRANCH_NAME=${branch_name:-jc-ethos-demo}

# root
RUN dnf install -y git-${GIT_VERSION}
RUN useradd ${USER_NAME} && \
	usermod -aG ${GROUP_NAME} ${USER_NAME}
WORKDIR ${PROJECT_INSTALL_DIR}
#RUN mkdir ${PROJECT_NAME} && \
#	chown ${USER_NAME}:${GROUP_NAME} ${PROJECT_NAME}

# restricted user
USER ${USER_NAME}
#RUN git clone ${PROJECT_URL} ${PROJECT_NAME}
WORKDIR ${PROJECT_NAME}
#RUN git checkout ${BRANCH_NAME} && \
#	yarn
COPY --chown=${USER_NAME}:${GROUP_NAME} . .
RUN yarn

EXPOSE 3000/tcp
ENTRYPOINT ["/usr/local/bin/yarn"]
CMD ["dev"]

HEALTHCHECK --interval=10s --timeout=5s \
	CMD curl --fail http://localhost:3000/ || exit 1
