FROM php:8.4-fpm-alpine

# 1. Installer les dépendances d'exécution (conservées dans l'image finale)
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libzip \
    freetype \
    libjpeg-turbo \
    libpng \
    libwebp \
    oniguruma

# 2. Installer les dépendances de compilation, compiler, puis nettoyer
RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    linux-headers \
    libzip-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    oniguruma-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
 && docker-php-ext-install -j$(nproc) gd pdo_mysql bcmath \
 # Opcache est installé séparément sans -j$(nproc) pour éviter le plantage
 && docker-php-ext-install opcache \
 && pecl install redis \
 && docker-php-ext-enable redis \
 # Nettoyage des outils de compilation pour alléger l'image
 && apk del .build-deps \
 && rm -rf /tmp/pear

# 3. Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 4. Copier les fichiers du projet
COPY . .

# 5. Installer les dépendances PHP et ajuster les permissions
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN git config --global --add safe.directory /var/www/html \
 && composer install --no-dev --optimize-autoloader \
 && chown -R www-data:www-data storage bootstrap/cache

# 6. Copier les configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]