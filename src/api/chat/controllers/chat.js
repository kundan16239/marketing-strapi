'use strict';

/**
 * chat controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::chat.chat', ({ strapi }) => ({
    async find(ctx) {
        const params = ctx.request.query
        if (params.creatorId === undefined || params.companyId === undefined) {
            return { success: false, message: "missing query params" }
        }
        const data = await strapi.db.query('api::chat.chat').findOne({
            where: {
                $and: [{
                        company: params.companyId
                    },
                    {
                        creator: params.creatorId
                    },
                    {
                        chatStatus: 1
                    }
                ]
            },
            select: ['chatJson'],
        });
        if (data === null) {
            return { success: true, data: "", message: "Empty Chat Info" }
        }
        delete data.id

        return { success: true, data, message: "Get Chat Info" }
    },

    async create(ctx) {
        const userId = ctx.state.user.id
        const bodyData = ctx.request.body;
        let companyStatus = 0
        const { creatorId, companyId, chat } = bodyData
        const creatorTypeData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true, creator: true }
        });
        if (creatorTypeData.type === 'company' && creatorTypeData.company !== null) {
            if (creatorTypeData.company.id !== companyId) {
                return { success: "false", message: "CompanyId and JWT not matching" }
            } else {
                companyStatus = 1
            }
        } else {
            return { success: "false", message: "Company Profile is not created" }
        }


        const data = await strapi.db.query('api::chat.chat').findOne({
            where: {
                $and: [{
                        company: companyId
                    },
                    {
                        creator: creatorId
                    },
                    {
                        chatStatus: 1
                    }
                ]
            },
            select: ['id', 'chatJson', 'lastChatSeenByCreator', 'lastChatSeenByCompany'],
        });
        if (data !== null) {

            const updateData = {
                creator: creatorId,
                company: companyId,
                lastChatSeenByCompany: data.lastChatSeenByCompany,
                lastChatSeenByCreator: data.lastChatSeenByCreator,
            }
            if (companyStatus === 1) {
                updateData.lastChatSeenByCompany = new Date()
                data.chatJson.message.push({ chat: chat, chatBy: companyId, date: new Date() })
            } else {
                updateData.lastChatSeenByCreator = new Date()
                data.chatJson.message.push({ chat: chat, chatBy: creatorId, date: new Date() })
            }
            updateData.chatJson = data.chatJson
            await strapi.db.query('api::chat.chat').update({
                where: { id: data.id },
                data: updateData,
            });
            return { success: true, message: "Chat Updated" }
        } else {
            const createDataByCompany = {
                creator: creatorId,
                company: companyId,
                chatJson: { message: [{ chat: chat, chatBy: companyId, date: new Date() }] },
                lastChatSeenByCompany: new Date()
            }
            await strapi.db.query('api::chat.chat').create({
                data: createDataByCompany,
            });
            return { success: true, message: "Chat Initiated first time" }
        }




        if (data !== null) {
            return { updateData }
        } else {
            const checkData = await strapi.db.query('api::chat.chat').create({
                data: updateData,
            });
        }
        return { success: true, message: "Company Account Info created" }

    },
}));