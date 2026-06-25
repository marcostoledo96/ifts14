FROM php:8.4-cli

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev; \
    docker-php-ext-install \
        curl \
        mbstring \
        pdo_mysql \
        xml \
        zip; \
    rm -rf /var/lib/apt/lists/*
