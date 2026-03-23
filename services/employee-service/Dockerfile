FROM php:8.4-fpm-alpine
 
RUN apk add --no-cache nginx supervisor curl git unzip \
 && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers \
 && docker-php-ext-install pdo_mysql opcache bcmath sockets \
 && pecl install redis \
 && docker-php-ext-enable redis \
 && apk del .build-deps \
 && rm -rf /tmp/pear
 
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
 
WORKDIR /var/www/html
COPY . .
 
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN chown -R www-data:www-data storage bootstrap/cache || true
RUN composer install --no-dev --optimize-autoloader
 
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
 
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
