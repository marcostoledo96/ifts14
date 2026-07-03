FROM php:8.4-cli

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev; \
    docker-php-ext-install \
        curl \
        gd \
        mbstring \
        pdo_mysql \
        xml \
        zip; \
    rm -rf /var/lib/apt/lists/*
