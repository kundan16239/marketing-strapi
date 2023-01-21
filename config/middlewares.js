module.exports = [
    'strapi::errors',
    'strapi::security',
    'strapi::poweredBy',
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            header: '*',
            origin: ['*'],
            keepHeaderOnError: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
        }
    },
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];