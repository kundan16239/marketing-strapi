'use strict';

module.exports = {
    routes: [{
        method: 'GET',
        path: '/allchat',
        handler: 'api::chat.chat.getAllChat',
    }]
};